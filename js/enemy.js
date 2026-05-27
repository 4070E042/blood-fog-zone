// ================================
// Enemy 系統
// ================================

let spawnTimer = 0;

let burrowSpawnCooldown = 0;
let leaperSpawnCooldown = 35;
let screamerSpawnCooldown = 60;

// ================================
// Screamer 系統
// ================================

const SCREAMER = {
    screamRange: 150,
    alertRange: 260,

    screamChargeTime: 1.4,
    screamCooldown: 14,

    fleeTime: 1.2,

    summonCount: 4
};


function getEnemyBaseHP() {

    if (survivalTime < 30) {
        return 10;
    }

    if (survivalTime < 70) {
        return 11;
    }

    if (survivalTime < 100) {
        return 12;
    }

    if (survivalTime < 120) {
        return 16;
    }

    return 18 + Math.floor((survivalTime - 120) / 35) * 2;
}

function getEnemyDamage(type) {
    const timeBonus = Math.floor(survivalTime / 60) * 2;

    if (type === 'leaper') {
        return 16 + Math.floor(survivalTime / 150) * 3;
    }

    return 10 + timeBonus;
}

function createEnemy(type, x, y, enemySpeed, enemyHp) {
    const radius = type === 'boss' ? 34 : 18;

    enemies.push({
        id: nextEnemyId++,
        x,
        y,
        radius,
        speed: enemySpeed,
        baseSpeed: enemySpeed,
        hp: enemyHp,
        maxHp: enemyHp,
        hitTimer: 0,
        stunTimer: 0,
        type,
        leapCooldown: 0,
        preLeapTimer: 0,
        leapTime: 0,
        leapDirX: 0,
        leapDirY: 0,
        leapSpeed: 260,
        leapTargetX: 0,
        leapTargetY: 0,
        screamCooldown: 0,
        screamTimer: 0,
        isScreaming: false,
        isAlerted: false,
        fleeTimer: 0,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderTimer: 0,
        burrowState: type === 'burrower' ? 'chasing' : null,
        burrowPrepareTimer: 0,
        burrowTimer: 0,
        burrowCooldown: 0,
        emergeX: 0,
        emergeY: 0,
        bindRadius: 80,
        bindTimer: 0,
        quakeWarning: false,
        quakeWarningTimer: 0,
        quakeDone: false,
        canBurrow: false,
        bossSkillState: 'idle',
        bossSkillTimer: 0,
        bossSkillAngle: 0,
        bossSlamCooldown: 2.0,
        bossChargeCooldown: 4.0,
        bossChargeDirX: 0,
        bossChargeDirY: 0,
        bossChargeRemaining: 0,
        bossChargeHit: false,
        bossFrenzied: false,
        bossBasicAttackCooldown: 0.8,
        bossBasicAttackTimer: 0,
        bossBasicAttackAngle: 0
    });
}


// 目前給 BOSS 和練習模式指定生成使用，正式遊戲內隨機生成走 spawnEnemy() 內部數值。
function getEnemyStats(type) {
    const zombieMaxSpeed = 130;
    const speedBonus = Math.floor(survivalTime / 50) * 5;
    const normalSpeed = Math.min(55 + Math.random() * 35 + speedBonus, zombieMaxSpeed);
    const baseHp = getEnemyBaseHP();

    let enemySpeed = normalSpeed;

    switch (type) {
        case 'leaper':
            enemySpeed = 100 + Math.random() * 20;
            break;

        case 'screamer':
            enemySpeed = 70 + Math.random() * 20;
            break;

        case 'burrower':
            enemySpeed = 80 + Math.random() * 20;
            break;

        case 'boss':
            enemySpeed = 62;
            break;
    }

    const normalHp =
        survivalTime < 30
            ? 10
            : baseHp + Math.floor(Math.random() * 5) - 2;

    const bossHp = 1000;


    const enemyHp =
        type === 'boss'
            ? bossHp
            : type === 'leaper'
                ? baseHp + 8 + Math.floor(survivalTime / 90) * 4
                : type === 'burrower'
                    ? baseHp + 40 + Math.floor(survivalTime / 180) * 5
                    : type === 'screamer'
                        ? baseHp + 28 + Math.floor(survivalTime / 120) * 6
                        : Math.max(8, normalHp);

    return {
        speed: enemySpeed,
        hp: enemyHp
    };
}

function spawnEnemy(allowSpecial = true) {
    // ================================
    // 生成位置：從畫面四邊出現
    // ================================
    const side = Math.floor(Math.random() * 4);

    let x, y;

    if (side === 0) {
        x = Math.random() * canvas.width;
        y = -20;
    } else if (side === 1) {
        x = canvas.width + 20;
        y = Math.random() * canvas.height;
    } else if (side === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + 20;
    } else {
        x = -20;
        y = Math.random() * canvas.height;
    }


    // ================================
    // 普通殭屍速度
    // ================================
    const zombieMaxSpeed = 120;
    const speedBonus = Math.floor(survivalTime / 60) * 4;
    const normalSpeed = Math.min(55 + Math.random() * 35 + speedBonus, zombieMaxSpeed);


    // ================================
    // 基礎資料
    // ================================
    const baseHp = getEnemyBaseHP();
    const burrowerCount = enemies.filter(e => e.type === 'burrower').length;
    const screamerCount = enemies.filter(e => e.type === 'screamer').length;


    // ================================
    // 特殊怪生成規則
    // 前期目標：
    // 0 ~ 30 秒：只有普通怪，一棒死，給玩家爽感
    // 30 ~ 90 秒：少量 Leaper 進場，開始逼位
    // 90 秒後：Screamer 進場，開始製造局勢壓力
    // Burrower：目前先關閉，之後放到後期
    // ================================

    const burrowerLimit =
        survivalTime >= 240
            ? 2
            : 1;

    const isBurrower =
        allowSpecial &&
        survivalTime >= 150 &&
        burrowSpawnCooldown <= 0 &&
        burrowerCount < burrowerLimit;

    let isScreamer = false;

    if (allowSpecial && !isBurrower && screamerSpawnCooldown <= 0) {
        if (survivalTime >= 60 && survivalTime < 150 && screamerCount < 1) {
            isScreamer = true;
            screamerSpawnCooldown = 42 + Math.random() * 10;
        } else if (survivalTime >= 150 && survivalTime < 240 && screamerCount < 2) {
            isScreamer = true;
            screamerSpawnCooldown = 32 + Math.random() * 10;
        } else if (survivalTime >= 240 && screamerCount < 3) {
            isScreamer = true;
            screamerSpawnCooldown = 24 + Math.random() * 10;
        }
    }

    const isLeaper =
        allowSpecial &&
        !isBurrower &&
        !isScreamer &&
        survivalTime >= 30 &&
        leaperSpawnCooldown <= 0;


    // ================================
    // 決定怪物種類
    // 優先順序：Burrower > Screamer > Leaper > Normal
    // ================================
    const type =
        isBurrower ? 'burrower'
            : isScreamer ? 'screamer'
                : isLeaper ? 'leaper'
                    : 'normal';


    // ================================
    // 依怪物種類設定速度
    // ================================
    let enemySpeed = normalSpeed;

    switch (type) {
        case 'leaper':
            // 前期 Leaper 出現頻率低，避免太早壓力過大
            if (survivalTime < 60) {
                leaperSpawnCooldown = 24 + Math.random() * 8;
            } else if (survivalTime < 150) {
                leaperSpawnCooldown = 14 + Math.random() * 5;
            } else if (survivalTime < 240) {
                leaperSpawnCooldown = 9 + Math.random() * 4;
            } else {
                leaperSpawnCooldown = 6 + Math.random() * 3;
            }

            enemySpeed = 100 + Math.random() * 20;
            break;

        case 'screamer':
            // Screamer 是局勢怪，不靠速度威脅
            enemySpeed = 70 + Math.random() * 20;
            break;

        case 'burrower':
            if (survivalTime < 240) {
                burrowSpawnCooldown = 55 + Math.random() * 15;
            } else {
                burrowSpawnCooldown = 45 + Math.random() * 15;
            }

            enemySpeed = 80 + Math.random() * 20;
            break;
    }


    // ================================
    // HP 設定
    // 0 ~ 30 秒：普通怪固定 10 HP，配合初始傷害 10，一棒死
    // 30 秒後：普通怪開始有 HP 浮動，可能需要兩下
    // 特殊怪：比普通怪硬，但不讓前期太誇張
    // ================================
    const normalHp =
        survivalTime < 30
            ? 10
            : baseHp + Math.floor(Math.random() * 5) - 2;

    const enemyHp =
        type === 'leaper'
            ? baseHp + 8 + Math.floor(survivalTime / 90) * 4
            : type === 'burrower'
                ? baseHp + 40 + Math.floor(survivalTime / 180) * 5
                : type === 'screamer'
                    ? baseHp + 28 + Math.floor(survivalTime / 120) * 6
                    : Math.max(8, normalHp);



    // ================================
    // 建立怪物
    // ================================
    createEnemy(type, x, y, enemySpeed, enemyHp);
}

function spawnPracticeEnemy(type) {
    if (!isPracticeMode) return;

    if (type === 'boss') {
        spawnBoss();
        return;
    }

    const allowedTypes = ['normal', 'leaper', 'screamer', 'burrower', 'boss'];
    const enemyType = allowedTypes.includes(type) ? type : 'normal';
    const radius = 18;
    const minDistance = player.radius + radius + 40;
    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    let x = player.x;
    let y = player.y;

    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 180 + Math.random() * 80;

        x = clamp(
            player.x + Math.cos(angle) * distance,
            radius,
            canvas.width - radius
        );

        y = clamp(
            player.y + Math.sin(angle) * distance,
            radius,
            canvas.height - radius
        );

        if (Math.hypot(x - player.x, y - player.y) >= minDistance) {
            break;
        }
    }

    if (Math.hypot(x - player.x, y - player.y) < minDistance) {
        x = clamp(player.x + minDistance, radius, canvas.width - radius);
        y = player.y;

        if (Math.hypot(x - player.x, y - player.y) < minDistance) {
            x = clamp(player.x - minDistance, radius, canvas.width - radius);
        }
    }

    const stats = getEnemyStats(enemyType);

    createEnemy(enemyType, x, y, stats.speed, stats.hp);
}

function spawnBoss() {
    const stats = getEnemyStats('boss');
    const radius = 34;

    createEnemy(
        'boss',
        canvas.width / 2,
        -radius,
        stats.speed,
        stats.hp
    );
}

function handleEnemyPush(en, dt) {
    const distToPlayer =
        Math.hypot(
            player.x - en.x,
            player.y - en.y
        );

    const pushDist =
        player.radius + en.radius;

    if (distToPlayer < pushDist) {

        const overlap =
            pushDist - distToPlayer;

        const pushStrength =
            overlap * 4;

        const pushX =
            (player.x - en.x) / (distToPlayer || 1);

        const pushY =
            (player.y - en.y) / (distToPlayer || 1);

        player.x += pushX * pushStrength * dt;
        player.y += pushY * pushStrength * dt;
    }
}

function damagePlayer(damage) {
    player.health =
        Math.max(0, player.health - damage);

    player.hitCooldown = 0.8;
    player.hurtTimer = 0.28;

    playHurtSound();

    floats.push({
        x: player.x,
        y: player.y - 32,
        vy: -45,
        life: 0.8,
        text: `-${damage}`
    });

    if (player.health <= 0) {
        triggerGameOver();
    }
}

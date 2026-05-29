// ================================
// Enemy 系統
// ================================

let spawnTimer = 0;

let burrowSpawnCooldown = 0;
let leaperSpawnCooldown = 35;
let screamerSpawnCooldown = 60;

const ENEMY_BASE = {
    normal: {
        hp: 10,
        speed: 55,
        damage: 10,
        radius: 18
    },

    leaper: {
        hp: 18,
        speed: 100,
        damage: 16,
        radius: 18,
        spawnCooldown: 35
    },

    screamer: {
        hp: 38,
        speed: 10,
        radius: 18,
        spawnCooldown: 60,

        screamRange: 150,
        alertRange: 300,
        screamChargeTime: 1.4,
        screamCooldown: 14,
        fleeTime: 1.8,
        summonCount: 4
    },

    burrower: {
        hp: 50,
        speed: 80,
        damage: 12,
        radius: 18,
        spawnCooldown: 60
    }
};



function getEnemyBaseHP() {

    if (survivalTime < 30) return 10;
    if (survivalTime < 70) return 11;
    if (survivalTime < 100) return 12;
    if (survivalTime < 120) return 16;

    return 18 + Math.floor((survivalTime - 120) / 35) * 2;
}

function getEnemyHpForType(type) {
    const phase = THREAT_PHASE[currentThreatPhase];

    if (type === 'normal') {
        const normalHp =
            currentThreatPhase === 0
                ? ENEMY_BASE.normal.hp
                : ENEMY_BASE.normal.hp + Math.floor(Math.random() * 5) - 2;

        return Math.max(
            8,
            normalHp + phase.normalHpBonus
        );
    }

    return ENEMY_BASE[type].hp + phase.specialHpBonus;
}

function getNormalEnemySpeed() {
    const phase = THREAT_PHASE[currentThreatPhase];

    return Math.min(
        ENEMY_BASE.normal.speed +
        Math.random() * 35 +
        phase.normalSpeedBonus,
        120
    );
}

function getSpecialEnemySpeed(type) {
    const phase = THREAT_PHASE[currentThreatPhase];

    return ENEMY_BASE[type].speed +
        Math.random() * 20 +
        phase.specialSpeedBonus;
}

function getEnemyDamage(type) {
    const timeBonus = Math.floor(survivalTime / 60) * 2;

    if (type === 'leaper') {
        return 16 + Math.floor(survivalTime / 150) * 3;
    }

    return 10 + timeBonus;
}

function createEnemy(type, x, y, enemySpeed, enemyHp) {
    const enemyRadius =
        type === 'boss'
            ? BOSS_BASE.radius
            : (ENEMY_BASE[type] || ENEMY_BASE.normal).radius;


    enemies.push({
        id: nextEnemyId++,
        x,
        y,
        radius: enemyRadius,
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

    let enemySpeed = normalSpeed;

    switch (type) {
        case 'leaper':
            enemySpeed = getSpecialEnemySpeed(type);
            break;

        case 'screamer':
            enemySpeed = getSpecialEnemySpeed(type);
            break;

        case 'burrower':
            enemySpeed = getSpecialEnemySpeed(type);
            break;

        case 'boss':
            enemySpeed = 62;
            break;
    }

    const bossHp = 1000;


    const enemyHp =
        type === 'boss'
            ? bossHp
            : getEnemyHpForType(type);

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
    // 基礎資料
    // ================================
    const burrowerCount = enemies.filter(e => e.type === 'burrower').length;
    const screamerCount = enemies.filter(e => e.type === 'screamer').length;

    // ================================
    // 特殊怪生成規則
    // 優先順序：Burrower > Screamer > Leaper > Normal
    // ================================
    const burrowerLimit = survivalTime >= 240 ? 2 : 1;

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

    const type =
        isBurrower ? 'burrower'
            : isScreamer ? 'screamer'
                : isLeaper ? 'leaper'
                    : 'normal';

    // ================================
    // 特殊怪出生冷卻
    // ================================
    if (type === 'leaper') {
        if (survivalTime < 60) {
            leaperSpawnCooldown = 24 + Math.random() * 8;
        } else if (survivalTime < 150) {
            leaperSpawnCooldown = 14 + Math.random() * 5;
        } else if (survivalTime < 240) {
            leaperSpawnCooldown = 9 + Math.random() * 4;
        } else {
            leaperSpawnCooldown = 6 + Math.random() * 3;
        }
    }

    if (type === 'burrower') {
        if (survivalTime < 240) {
            burrowSpawnCooldown = 55 + Math.random() * 15;
        } else {
            burrowSpawnCooldown = 45 + Math.random() * 15;
        }
    }

    // ================================
    // 數值設定
    // ================================
    const enemySpeed =
        type === 'normal'
            ? getNormalEnemySpeed()
            : getSpecialEnemySpeed(type);

    const enemyHp = getEnemyHpForType(type);

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
    createEnemy(
        'boss',
        canvas.width / 2,
        -BOSS_BASE.radius,
        BOSS_BASE.speed,
        BOSS_BASE.hp
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
function handleEnemyDeath(en, i) {
    const defeatedBoss = en.type === 'boss';

    // 爆炸效果
    if (explosionEnabled && Math.random() < explosionChance) {

        explosions.push({
            x: en.x,
            y: en.y,
            radius: explosionRadius,
            life: 0.45,
            maxLife: 0.45
        });

        for (const other of enemies) {

            if (other.id === en.id) continue;

            const dist = Math.hypot(
                other.x - en.x,
                other.y - en.y
            );

            if (dist <= explosionRadius) {

                other.hp -= explosionDamage;

                floats.push({
                    x: other.x,
                    y: other.y - other.radius - 6,
                    vy: -40,
                    life: 0.6,
                    text: `💥${explosionDamage}`
                });
            }
        }
    }

    let expGain = 1;

    if (en.type === 'leaper') {
        expGain = 2;
    } else if (en.type === 'screamer') {
        expGain = 3;
    } else if (en.type === 'burrower') {
        expGain = 6;
    }

    player.exp += expGain;
    killCount++;
    healFromBloodRageKill();

    addCorpseEffect(en);

    deathEffects.push({
        x: en.x,
        y: en.y,
        radius: en.radius,
        life: 0.35,
        maxLife: 0.35
    });

    if (en.type === 'burrower') {
        burrowSpawnCooldown = 35;

        if (
            player.isBound &&
            player.boundEnemyId === en.id
        ) {
            player.isBound = false;
            player.boundEnemyId = null;
        }

    }

    en.attackState = 'dead';
    en.attackTimer = 0;
    en.attackCooldown = 0;

    enemies.splice(i, 1);

    if (defeatedBoss && !isPracticeMode) {
        bossClearTime = survivalTime;
        bossFightDuration =
            bossFightStartTime === null
                ? 0
                : Math.max(0, bossClearTime - bossFightStartTime);
        bossHealthBarVisible = false;
        bossHealthBarAnim = 0;
        triggerVictory();
    }
}

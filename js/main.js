// ================================
// 開始 / 結束選單
// ================================
const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');
const practiceStartButton = document.getElementById('practice-start-button');

const classSelectMenu = document.getElementById('class-select-menu');
const classList = document.getElementById('class-list');

const gameOverMenu = document.getElementById('game-over-menu');
const restartButton = document.getElementById('restart-button');
const victoryMenu = document.getElementById('victory-menu');
const victoryRestartButton = document.getElementById('victory-restart-button');
const victoryMainButton = document.getElementById('victory-main-button');

const gameOverTime = document.getElementById('game-over-time');
const gameOverScore = document.getElementById('game-over-score');
const victoryTime = document.getElementById('victory-time');
const victoryKills = document.getElementById('victory-kills');
const victoryScore = document.getElementById('victory-score');


// ================================
// 升級 / 暫停選單
// ================================
const upgradeMenu = document.getElementById('upgrade-menu');
const pauseMenu = document.getElementById('pause-menu');
const practiceResumeButton = document.getElementById('practice-resume-button');
const practiceReturnButton = document.getElementById('practice-return-button');
const phaseAlert = document.getElementById('phase-alert');
const phaseAlertTitle = document.getElementById('phase-alert-title');
const phaseAlertMessage = document.getElementById('phase-alert-message');


// ================================
// Combo
// ================================
const comboDuration = 4;


// ================================
// 測試 / 顯示設定
// ================================
let botMode = false;
let showEnemyHpText = false;


// ================================
// 敵人系統
// ================================
const enemies = [];
let nextEnemyId = 1;


// ================================
// 補包系統
// ================================
const healthPacks = [];

let healthPackTimer = 0;
const healthPackInterval = 20;


// ================================
// 浮動文字
// ================================
const floats = [];
const corpseEffects = [];
const bossSlamImpactEffects = [];

function resetGame() {

    // ================================
    // 遊戲流程
    // ================================
    gameStarted = true;
    isGameOver = false;
    isVictory = false;
    isUpgradeActive = false;
    isPaused = false;

    last = performance.now();


    // ================================
    // 分數 / 時間
    // ================================
    survivalTime = 290;
    score = 0;
    killCount = 0;

    playerLevel = 1;
    playerExp = 0;
    playerNextExp = 8;



    // ================================
    // Combo
    // ================================
    comboCount = 0;
    comboTimer = 0;


    // ================================
    // 畫面效果
    // ================================
    screenShake = 0;
    upgradeEffectTimer = 0;
    currentThreatPhase = 0;
    phaseAlertTimer = 0;
    bossSpawned = false;
    bossIntroActive = false;
    bossIntroTimer = 0;
    bossFightStarted = false;
    bossHealthBarVisible = false;
    bossHealthBarAnim = 0;


    // ================================
    // UI
    // ================================
    pauseMenu.style.display = 'none';
    startMenu.style.display = 'none';
    classSelectMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    victoryMenu.style.display = 'none';
    upgradeMenu.style.display = 'none';
    isPracticeExitMenuOpen = false;
    updatePracticeExitMenu();

    updatePracticeModeDisplay();
    updatePhaseAlert();

    canvas.style.cursor = 'none';

    document.body.classList.add('game-playing');


    // ================================
    // 玩家
    // ================================
    resetPlayer();


    // ================================
    // 能力卡
    // ================================
    speedLevel = 0;
    damageLevel = 0;
    attackSpeedLevel = 0;
    rangeLevel = 0;


    // ================================
    // 攻擊系統
    // ================================
    stickDamage = 10;
    stickRange = 26;

    baseAttackCooldownTime = 1.0;
    attackCooldown = 0;

    isSwinging = false;
    swingProgress = 0;

    swingHitSet.clear();

    bloodRageActive = false;
    bloodRageUnlocked = false;
    bloodRageLevel = 0;
    bloodRageTimer = 0;
    bloodRageCooldownTimer = 0;
    bloodRageBaseStickRange = 0;
    bloodStepUnlocked = false;
    bloodStepLevel = 0;
    bloodStepCooldownTimer = 0;
    boneBreakerUnlocked = false;
    boneBreakerLevel = 0;
    boneBreakerCooldownTimer = 0;
    boneBreakerWindupTimer = 0;
    boneBreakerPending = null;

    bloodExecutionValue = 0;
    bloodExecutionWasFull = false;
    bloodExecutionCombatTimer = 0;
    updateAttackCooldownTime();

    activeBuilds.length = 0;
    activeSkills.length = 0;





    // ================================
    // 敵人系統
    // ================================
    spawnTimer = 0;

    burrowSpawnCooldown = 0;
    leaperSpawnCooldown = 35;
    screamerSpawnCooldown = 60;

    zombieSoundCooldown = 0;

    enemies.length = 0;
    lastEnemyCount = 0;


    // ================================
    // 場上物件
    // ================================
    healthPackTimer = 0;

    healthPacks.length = 0;
    floats.length = 0;
    corpseEffects.length = 0;
    bossSlamImpactEffects.length = 0;
    deathEffects.length = 0;


    // ================================
    // HUD
    // ================================
    refreshBuildList();
    refreshSkillList();
}

function renderClassSelect() {
    classList.innerHTML = '';

    for (const classInfo of Object.values(CLASSES)) {
        const button = document.createElement('button');
        button.className = 'class-card';
        button.type = 'button';
        button.dataset.classId = classInfo.id;

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = classInfo.name;

        const role = document.createElement('div');
        role.className = 'card-desc';
        role.textContent = classInfo.role;

        const description = document.createElement('div');
        description.className = 'card-desc';
        description.textContent = classInfo.description;

        button.appendChild(title);
        button.appendChild(role);
        button.appendChild(description);

        button.addEventListener('click', () => {
            playerClass = classInfo.id;
            resetGame();
        });

        classList.appendChild(button);
    }
}

function showClassSelect(practiceMode = false) {
    isVictory = false;
    isPracticeMode = practiceMode;
    isPracticePanelOpen = false;
    isPracticeExitMenuOpen = false;
    updatePracticeModeDisplay();
    updatePracticeExitMenu();

    renderClassSelect();

    startMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    victoryMenu.style.display = 'none';
    pauseMenu.style.display = 'none';
    upgradeMenu.style.display = 'none';
    classSelectMenu.style.display = 'flex';

    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
}

startButton.addEventListener('click', () => {
    showClassSelect(false);
});

practiceStartButton.addEventListener('click', () => {
    showClassSelect(true);
});

restartButton.addEventListener('click', () => {
    showClassSelect(false);
});

victoryRestartButton.addEventListener('click', () => {
    resetGame();
});

victoryMainButton.addEventListener('click', () => {
    returnToMainMenuFromVictory();
});

practiceResumeButton.addEventListener('click', () => {
    isPracticeExitMenuOpen = false;
    isPaused = false;
    updatePracticeExitMenu();
    canvas.style.cursor = 'none';
    document.body.classList.add('game-playing');
});

practiceReturnButton.addEventListener('click', () => {
    isPracticeExitMenuOpen = false;
    isPracticeMode = false;
    isPracticePanelOpen = false;
    practiceSelectedEnemyType = 'normal';
    gameStarted = false;
    isGameOver = false;
    isVictory = false;
    bossSpawned = false;
    bossIntroActive = false;
    bossIntroTimer = 0;
    bossFightStarted = false;
    bossHealthBarVisible = false;
    bossHealthBarAnim = 0;
    isPaused = false;
    isUpgradeActive = false;

    enemies.length = 0;
    healthPacks.length = 0;
    floats.length = 0;
    corpseEffects.length = 0;
    bossSlamImpactEffects.length = 0;
    deathEffects.length = 0;
    explosions.length = 0;

    updatePracticeExitMenu();
    updatePracticeModeDisplay();

    pauseMenu.style.display = 'none';
    classSelectMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    victoryMenu.style.display = 'none';
    upgradeMenu.style.display = 'none';
    startMenu.style.display = 'flex';

    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
});

function returnToMainMenuFromVictory() {
    isVictory = false;
    bossSpawned = false;
    bossIntroActive = false;
    bossIntroTimer = 0;
    bossFightStarted = false;
    bossHealthBarVisible = false;
    bossHealthBarAnim = 0;
    gameStarted = false;
    isGameOver = false;
    isPaused = false;
    isUpgradeActive = false;
    isPracticeMode = false;
    isPracticePanelOpen = false;
    isPracticeExitMenuOpen = false;
    survivalTime = 0;
    score = 0;
    killCount = 0;
    currentThreatPhase = 0;
    phaseAlertTimer = 0;
    playerExp = 0;
    playerLevel = 1;

    enemies.length = 0;
    healthPacks.length = 0;
    floats.length = 0;
    corpseEffects.length = 0;
    bossSlamImpactEffects.length = 0;
    deathEffects.length = 0;
    explosions.length = 0;

    victoryMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    pauseMenu.style.display = 'none';
    classSelectMenu.style.display = 'none';
    upgradeMenu.style.display = 'none';
    startMenu.style.display = 'flex';

    updatePracticeModeDisplay();
    updatePracticeExitMenu();
    updatePhaseAlert();

    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
}


function triggerVictory() {
    if (isVictory) return;

    isVictory = true;
    gameStarted = false;
    isPaused = false;
    isUpgradeActive = false;

    victoryTime.textContent =
        `Survival Time: ${Math.floor(survivalTime)}s`;
    victoryKills.textContent = `Kills: ${killCount}`;
    victoryScore.textContent = `Score: ${score}`;

    victoryMenu.style.display = 'flex';
    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
}

function showPhaseAlert(title, message) {
    phaseAlertTitle.textContent = `【${title}】`;
    phaseAlertMessage.textContent = message;
    phaseAlertTimer = 3;
    updatePhaseAlert();
}

function updatePhaseAlert() {
    phaseAlert.style.display =
        phaseAlertTimer > 0 ? 'block' : 'none';
}

function updateThreatPhase(dt) {
    if (isPracticeMode) return;

    let nextPhase = currentThreatPhase;

    if (survivalTime >= 300 && currentThreatPhase < 4) {
        nextPhase = 4;
        showPhaseAlert('大型變異反應', 'Boss 即將出現');
    } else if (survivalTime >= 240 && currentThreatPhase < 3) {
        nextPhase = 3;
        showPhaseAlert('感染失控', '變異體組合壓力上升');
    } else if (survivalTime >= 150 && currentThreatPhase < 2) {
        nextPhase = 2;
        showPhaseAlert('變異體出現', '地洞殭屍開始活動');
    } else if (survivalTime >= 60 && currentThreatPhase < 1) {
        nextPhase = 1;
        showPhaseAlert('感染擴散', '跳躍者活動增加，尖叫者開始出現');
    }

    currentThreatPhase = nextPhase;

    if (phaseAlertTimer > 0) {
        phaseAlertTimer = Math.max(0, phaseAlertTimer - dt);
        updatePhaseAlert();
    }
}


let last = performance.now();

function update(dt) {
    // ================================
    // 遊戲停止狀態
    // 遊戲結束 / 暫停 / 升級時停止更新
    // ================================
    if (
        !gameStarted ||
        isGameOver ||
        isVictory ||
        isUpgradeActive ||
        isPaused ||
        isPracticeExitMenuOpen
    ) {
        updateHUD();
        return;
    }


    // ================================
    // 升級特效計時
    // ================================
    if (upgradeEffectTimer > 0) {
        upgradeEffectTimer = Math.max(0, upgradeEffectTimer - dt);
    }


    // ================================
    // 玩家移動輸入
    // ================================
    let dx = 0, dy = 0;

    if (botMode) {

        // Bot 自動控制
        const botMove = updateBotControl();

        dx = botMove.dx;
        dy = botMove.dy;

    } else {

        // 玩家鍵盤移動
        if (!player.isBound) {

            if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
            if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
        }
    }


    // ================================
    // 緩速效果
    // ================================
    if (player.slowTimer > 0) {

        player.slowTimer = Math.max(0, player.slowTimer - dt);

        if (player.slowTimer <= 0) {
            player.slowMultiplier = 1;
        }
    }


    // ================================
    // 受傷加速效果
    // ================================
    if (player.speedBoostTimer > 0) {

        player.speedBoostTimer = Math.max(0, player.speedBoostTimer - dt);

        if (player.speedBoostTimer <= 0) {
            player.speedBoostMultiplier = 1;
        }
    }


    // ================================
    // 玩家移動
    // ================================
    if (dx !== 0 || dy !== 0) {

        const len = Math.hypot(dx, dy) || 1;

        dx /= len;
        dy /= len;

        playerMoveDir.x = dx;
        playerMoveDir.y = dy;

        const boneBreakerMoveScale =
            boneBreakerPending && boneBreakerWindupTimer > 0
                ? boneBreakerMoveMultiplier
                : 1;

        const currentSpeed =
            player.speed *
            player.slowMultiplier *
            player.speedBoostMultiplier *
            boneBreakerMoveScale;

        player.x += dx * currentSpeed * dt;
        player.y += dy * currentSpeed * dt;
    }


    // ================================
    // 玩家擊退位移
    // ================================
    player.x += player.knockbackX * dt;
    player.y += player.knockbackY * dt;


    // ================================
    // 擊退衰減
    // ================================
    player.knockbackX *= 0.84;
    player.knockbackY *= 0.84;


    // ================================
    // 限制玩家在畫面內
    // ================================
    player.x =
        Math.max(
            player.radius,
            Math.min(canvas.width - player.radius, player.x)
        );

    player.y =
        Math.max(
            player.radius,
            Math.min(canvas.height - player.radius, player.y)
        );


    // ================================
    // 生存時間
    // ================================
    survivalTime += dt;
    updateThreatPhase(dt);

    if (
        !isPracticeMode &&
        !bossSpawned &&
        survivalTime >= 300
    ) {
        bossSpawned = true;
        bossIntroActive = true;
        bossIntroTimer = bossIntroDuration;
        bossFightStarted = false;
        bossHealthBarVisible = false;
        bossHealthBarAnim = 0;
        spawnBoss();
        screenShake = Math.max(screenShake, 8);
    }


    // ================================
    // Combo 計時
    // ================================
    if (comboTimer > 0) {

        comboTimer -= dt;

        if (comboTimer <= 0) {
            comboCount = 0;
        }
    }


    // ================================
    // 升級中停止遊戲
    // ================================
    if (isUpgradeActive) {
        return;
    }


    // ================================
    // 特殊怪生成冷卻
    // ================================
    if (leaperSpawnCooldown > 0) {
        leaperSpawnCooldown = Math.max(0, leaperSpawnCooldown - dt);
    }

    if (screamerSpawnCooldown > 0) {
        screamerSpawnCooldown = Math.max(0, screamerSpawnCooldown - dt);
    }

    if (burrowSpawnCooldown > 0) {
        burrowSpawnCooldown = Math.max(0, burrowSpawnCooldown - dt);
    }

    updateSkillCooldowns(dt);
    updateCorpseEffects(dt);
    updateBossSlamImpactEffects(dt);
    updateBossHealthBar(dt);


    if (playerExp >= playerNextExp) {
        levelUp();
        return;
    }

    if (bossIntroActive) {
        bossIntroTimer = Math.max(0, bossIntroTimer - dt);
        screenShake = Math.max(screenShake, 3);

        if (bossIntroTimer <= 0) {
            bossIntroActive = false;
            bossFightStarted = true;
            bossHealthBarVisible = true;
            bossHealthBarAnim = 0;
            screenShake = Math.max(screenShake, 16);

            for (let i = enemies.length - 1; i >= 0; i--) {
                if (enemies[i].type !== 'boss') {
                    addCorpseEffect(enemies[i]);

                    deathEffects.push({
                        x: enemies[i].x,
                        y: enemies[i].y,
                        radius: enemies[i].radius,
                        life: 0.35,
                        maxLife: 0.35
                    });

                    enemies.splice(i, 1);
                }
            }
        }

        updateHUD();
        return;
    }

    updateHUD();

    updateAttack(dt);
    updateOrbitSkill(dt);

    handleAutoAttack();


    const enemiesBeforeSpawn = enemies.length;
    // spawn enemies periodically
    spawnTimer += dt;
    let currentSpawnInterval;

    if (survivalTime < 60) {
        currentSpawnInterval = 1.8 - survivalTime * 0.004;
    } else if (survivalTime < 150) {
        currentSpawnInterval = 1.56 - (survivalTime - 60) * 0.004;
    } else if (survivalTime < 240) {
        currentSpawnInterval = 1.2 - (survivalTime - 150) * 0.0039;
    } else {
        currentSpawnInterval = Math.max(0.65, 0.85 - (survivalTime - 240) * 0.0033);
    }

    updateHealthPackSpawn(dt);

    // 怪物生產時間
    if (!isPracticeMode && !bossSpawned && spawnTimer >= currentSpawnInterval) {
        spawnTimer -= currentSpawnInterval;
        spawnEnemy();
    }
    const enemyCountIncreased = enemies.length > enemiesBeforeSpawn;
    let closeZombieNearPlayer = false;

    // update enemies: move toward player, update hit timers
    for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];

        // 暈眩中停止行動，但仍然要讓後面的死亡判定執行
        const isStunned = en.stunTimer > 0;

        // 先死亡判定
        if (en.hp <= 0) {

            handleEnemyDeath(en, i);
            continue;
        }

        if (en.attackState === undefined) {
            en.attackState = 'idle';
        }

        if (en.attackTimer === undefined) {
            en.attackTimer = 0;
        }

        if (en.attackCooldown === undefined) {
            en.attackCooldown = 0;
        }

        const distToPlayer =
            Math.hypot(player.x - en.x, player.y - en.y);

        const attackRange = player.radius + en.radius + enemyAttackRangeOffset;

        if (en.attackCooldown > 0) {
            en.attackCooldown =
                Math.max(0, en.attackCooldown - dt);
        }

        if (en.hp <= 0) continue;

        if (en.attackState === 'attacking') {

            en.attackTimer -= dt;

            // 玩家被攻擊
            if (en.attackTimer <= 0) {

                if (distToPlayer <= attackRange) {

                    const enemyDamage =
                        getEnemyDamage(en.type);

                    player.health =
                        Math.max(0, player.health - enemyDamage);

                    floats.push({
                        x: player.x,
                        y: player.y - 32,
                        vy: -45,
                        life: 0.8,
                        text: `-${enemyDamage}`
                    });

                    player.hitCooldown = 0.8;
                    player.hurtTimer = 0.28;

                    playHurtSound();

                    player.speedBoostTimer = 0.7;
                    player.speedBoostMultiplier = 1.25;

                    if (player.health <= 0 && !isGameOver) {
                        triggerGameOver();
                    }
                }

                en.attackState = 'recovering';
                en.attackTimer = 0.45;
                en.attackCooldown = 0.9;
            }

            continue;
        }

        if (en.attackState === 'recovering') {

            en.attackTimer -= dt;

            if (en.attackTimer <= 0) {
                en.attackState = 'idle';
            }

            continue;
        }

        if (
            en.type !== 'burrower' &&
            en.type !== 'leaper' &&
            en.type !== 'screamer' &&
            en.type !== 'boss' &&
            distToPlayer <= attackRange &&
            en.attackCooldown <= 0
        ) {
            en.attackState = 'attacking';

            en.attackWindup = 0.45;
            en.attackTimer = en.attackWindup;
            continue;
        }



        if (isStunned) {
            en.stunTimer = Math.max(0, en.stunTimer - dt);
        }

        let targetX = player.x;
        let targetY = player.y;

        const surroundStrength = Math.min(40, survivalTime * 0.5);

        if (en.type !== 'burrower') {
            targetX += playerMoveDir.x * surroundStrength;
            targetY += playerMoveDir.y * surroundStrength;

            if (en.id % 5 === 0) {
                targetX += -playerMoveDir.y * 35;
                targetY += playerMoveDir.x * 35;
            }

            if (en.id % 7 === 0) {
                targetX += playerMoveDir.y * 35;
                targetY += -playerMoveDir.x * 35;
            }
        }

        const dx = targetX - en.x;
        const dy = targetY - en.y;
        const len = Math.hypot(dx, dy) || 1;
        const quakeRange = player.radius + stickRange + 14;

        if (isStunned) {
            // 暈眩中不執行移動 / 技能邏輯
        } else if (en.type === 'boss') {
            updateBossBehavior(en, dt);
        } else if (en.type === 'burrower') {
            const burrowSpeedScale =
                Math.min(1, survivalTime / 300);

            if (en.burrowState === 'chasing') {
                if (en.burrowCooldown > 0) {
                    en.burrowCooldown = Math.max(0, en.burrowCooldown - dt);
                }

                if (!en.quakeWarning && !en.quakeDone && distToPlayer <= quakeRange) {
                    en.quakeWarning = true;

                    en.quakeWarningTimer =
                        1.2 - burrowSpeedScale * 0.45;
                }

                en.x += (dx / len) * en.speed * dt;
                en.y += (dy / len) * en.speed * dt;

                const quakeDist = Math.hypot(player.x - en.x, player.y - en.y);

                if (!en.quakeWarning && !en.quakeDone && quakeDist <= quakeRange) {
                    en.quakeWarning = true;

                    en.quakeWarningTimer =
                        1.2 - burrowSpeedScale * 0.45;
                }

                if (en.quakeWarning) {
                    en.quakeWarningTimer -= dt;

                    if (en.quakeWarningTimer <= 0) {
                        en.quakeWarning = false;
                        en.quakeDone = true;
                        en.canBurrow = true;

                        if (quakeDist <= quakeRange) {
                            player.slowTimer = 1.2;
                            player.slowMultiplier = 0.45;
                            player.hurtTimer = 0.28;
                            player.health = Math.max(0, player.health - 12);
                            playHurtSound();

                            player.speedBoostTimer = 0.7;
                            player.speedBoostMultiplier = 1.25;

                            const pushX = player.x - en.x;
                            const pushY = player.y - en.y;
                            const pushLen = Math.hypot(pushX, pushY) || 1;

                            player.knockbackX = (pushX / pushLen) * 260;
                            player.knockbackY = (pushY / pushLen) * 260;

                            en.x -= (pushX / pushLen) * 45;
                            en.y -= (pushY / pushLen) * 45;
                        }

                        en.quakeEffectTimer = 0.25;
                        en.canBurrow = true;
                        continue;
                    }
                }

                if (
                    en.canBurrow &&
                    distToPlayer < 320 &&
                    distToPlayer > quakeRange &&
                    en.burrowCooldown <= 0
                ) {
                    en.burrowState = 'preparingBurrow';
                    en.burrowPrepareTimer = 1.5 - burrowSpeedScale * 0.5;
                    en.canBurrow = false;
                    playBurrowSound();
                }

                if (
                    en.burrowState === 'chasing' &&
                    !en.quakeWarning &&
                    distToPlayer <= attackRange &&
                    en.attackCooldown <= 0 &&
                    (
                        en.quakeDone ||
                        en.burrowCooldown > 0 ||
                        !en.canBurrow
                    )
                ) {
                    en.attackState = 'attacking';
                    en.attackWindup = 0.45;
                    en.attackTimer = en.attackWindup;
                    continue;
                }

            } else if (en.burrowState === 'preparingBurrow') {
                en.burrowPrepareTimer = Math.max(0, en.burrowPrepareTimer - dt);

                if (en.burrowPrepareTimer <= 0) {
                    en.burrowState = 'burrowing';
                    en.burrowTimer = 2.0 - burrowSpeedScale * 0.7;
                    en.emergeX = 0;
                    en.emergeY = 0;
                }

            } else if (en.burrowState === 'burrowing') {
                en.burrowTimer = Math.max(0, en.burrowTimer - dt);

                if (en.burrowTimer <= 0.55 && en.emergeX === 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const offset = 40 + Math.random() * 50;

                    en.emergeX = player.x + Math.cos(angle) * offset;
                    en.emergeY = player.y + Math.sin(angle) * offset;
                }

                if (en.burrowTimer <= 0) {
                    en.burrowState = 'emerging';
                    en.x = en.emergeX;
                    en.y = en.emergeY;
                }

            } else if (en.burrowState === 'emerging') {
                const distEmerging = Math.hypot(player.x - en.x, player.y - en.y);

                if (distEmerging <= en.bindRadius) {
                    en.burrowState = 'binding';
                    player.isBound = true;
                    player.boundEnemyId = en.id;
                    en.burrowCooldown = 4.0;
                    en.bindTimer = 3.0;
                } else {
                    en.burrowState = 'chasing';
                    en.burrowCooldown = 6.0;
                    en.quakeDone = false;
                }

            } else if (en.burrowState === 'binding') {
                en.x = player.x;
                en.y = player.y;

                en.bindTimer = Math.max(0, en.bindTimer - dt);

                if (!en.bindDamageTimer) {
                    en.bindDamageTimer = 1.0;
                }

                en.bindDamageTimer -= dt;

                if (en.bindDamageTimer <= 0) {
                    en.bindDamageTimer = 1.0;

                    player.health = Math.max(0, player.health - 4);
                    player.hurtTimer = 0.15;

                    playHurtSound();

                    if (player.health <= 0 && !isGameOver) {
                        triggerGameOver();
                    }
                }

                if (en.bindTimer <= 0) {
                    player.isBound = false;
                    player.boundEnemyId = null;

                    en.burrowState = 'chasing';
                    en.burrowCooldown = 6.0;
                    en.quakeDone = false;
                }
            }
        } else if (en.type === 'screamer') {

            const screamRange = SCREAMER.screamRange;
            const alertRange = SCREAMER.alertRange;

            en.isAlerted = distToPlayer <= alertRange;

            if (en.screamCooldown > 0) {
                en.screamCooldown = Math.max(0, en.screamCooldown - dt);
            }

            if (en.isScreaming) {
                en.screamTimer = Math.max(0, en.screamTimer - dt);

                if (en.screamTimer <= 0) {

                    en.isScreaming = false;
                    en.screamCooldown = SCREAMER.screamCooldown;

                    // 召喚殭屍
                    for (let s = 0; s < SCREAMER.summonCount; s++) {
                        spawnEnemy(false);
                    }
                }

            } else if (
                distToPlayer <= screamRange &&
                en.screamCooldown <= 0
            ) {

                en.isScreaming = true;
                en.screamTimer = SCREAMER.screamChargeTime;

                playScreamSound();

            } else if (en.fleeTimer > 0) {

                en.fleeTimer = Math.max(0, en.fleeTimer - dt);

                en.x -= (dx / len) * en.speed * 1.4 * dt;
                en.y -= (dy / len) * en.speed * 1.4 * dt;

                en.x = Math.max(en.radius, Math.min(canvas.width - en.radius, en.x));
                en.y = Math.max(en.radius, Math.min(canvas.height - en.radius, en.y));

            } else {

                en.wanderTimer -= dt;

                if (en.wanderTimer <= 0) {
                    en.wanderTimer = 1.2 + Math.random() * 1.5;
                    en.wanderAngle += -0.8 + Math.random() * 1.6;
                }

                en.x += Math.cos(en.wanderAngle) * en.speed * 0.45 * dt;
                en.y += Math.sin(en.wanderAngle) * en.speed * 0.45 * dt;

                en.x = Math.max(en.radius, Math.min(canvas.width - en.radius, en.x));
                en.y = Math.max(en.radius, Math.min(canvas.height - en.radius, en.y));
            }
        } else if (en.type === 'leaper') {

            if (en.leapTime > 0) {

                // Leaper 衝刺擦撞判定
                const leapHitDist = player.radius + en.radius + 12;

                const hitDist =
                    Math.hypot(
                        player.x - en.x,
                        player.y - en.y
                    );

                if (
                    hitDist <= leapHitDist &&
                    player.hitCooldown <= 0
                ) {

                    // 撞擊特效
                    screenShake = 10;

                    impactEffects.push({
                        x: player.x,
                        y: player.y,
                        life: 0.25,
                        maxLife: 0.25,
                        radius: 16
                    });

                    // Leaper 小擊退
                    const pushX = player.x - en.x;
                    const pushY = player.y - en.y;

                    const pushLen = Math.hypot(pushX, pushY) || 1;

                    player.knockbackX = (pushX / pushLen) * 180;
                    player.knockbackY = (pushY / pushLen) * 180;

                    const enemyDamage = getEnemyDamage(en.type);

                    damagePlayer(enemyDamage);
                }

                const leapDx = en.leapTargetX - en.x;
                const leapDy = en.leapTargetY - en.y;
                const leapDist = Math.hypot(leapDx, leapDy);

                const moveDist = en.leapSpeed * dt;

                if (leapDist <= moveDist) {
                    en.x = en.leapTargetX;
                    en.y = en.leapTargetY;

                    en.leapTime = 0;

                    // 撲擊後硬直
                    en.recoverTimer = 0.8;
                } else {
                    en.x += en.leapDirX * moveDist;
                    en.y += en.leapDirY * moveDist;
                    en.leapTime = Math.max(0, en.leapTime - dt);
                }
            } else {
                // Leaper 撲擊後硬直中，暫時不行動
                if (en.recoverTimer > 0) {

                    en.recoverTimer = Math.max(0, en.recoverTimer - dt);

                    continue;
                }

                // Leaper 近身小咬範圍
                const leaperBiteRange = player.radius + en.radius + 8;

                // Leaper 非撲擊狀態下，貼近玩家時造成小傷害
                if (distToPlayer <= leaperBiteRange && player.hitCooldown <= 0) {
                    en.attackState = 'attacking';

                    en.attackWindup = 0.28;
                    en.attackTimer = en.attackWindup;

                    en.attackDamageRate = 0.6;
                    en.attackRecover = 0.6;
                    en.attackCooldown = 0.8;

                    continue;
                }

                // Leaper 撲擊冷卻
                if (en.leapCooldown > 0) {
                    en.leapCooldown = Math.max(0, en.leapCooldown - dt);
                }

                // Leaper 預備撲擊倒數
                if (en.preLeapTimer > 0) {
                    en.preLeapTimer = Math.max(0, en.preLeapTimer - dt);

                    if (en.preLeapTimer <= 0) {

                        const leapDist =
                            Math.hypot(
                                en.leapTargetX - en.x,
                                en.leapTargetY - en.y
                            );

                        en.leapTime = leapDist / en.leapSpeed;
                        en.leapCooldown = 3.5;
                    }

                    // Leaper 距離適中時，開始準備撲擊
                } else if (distToPlayer < 160 && distToPlayer > 110 && en.leapCooldown <= 0) {
                    en.leapTargetX = player.x;
                    en.leapTargetY = player.y;

                    const leapDx = en.leapTargetX - en.x;
                    const leapDy = en.leapTargetY - en.y;
                    const leapLen = Math.hypot(leapDx, leapDy) || 1;

                    en.leapDirX = leapDx / leapLen;
                    en.leapDirY = leapDy / leapLen;

                    // 預備突進時間，越後期越快
                    let leaperChargeTime = 0.65;

                    if (survivalTime >= 90) {
                        leaperChargeTime = 0.55;
                    }

                    if (survivalTime >= 150) {
                        leaperChargeTime = 0.45;
                    }

                    en.preLeapTimer = leaperChargeTime;

                    // 沒有撲擊時，正常追玩家
                } else {
                    en.x += (dx / len) * en.speed * dt;
                    en.y += (dy / len) * en.speed * dt;
                }
            }
        } else {

            // 普通殭屍
            en.x += (dx / len) * en.speed * dt;
            en.y += (dy / len) * en.speed * dt;

            handleEnemyPush(en, dt);
        }

        if (en.hitTimer > 0) en.hitTimer = Math.max(0, en.hitTimer - dt);

        if (distToPlayer < 120) closeZombieNearPlayer = true;


    }

    // simple enemy separation: prevent zombies stacking into one ball
    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            const a = enemies[i];
            const b = enemies[j];

            if (a.type === 'burrower' && a.burrowState === 'burrowing') continue;
            if (b.type === 'burrower' && b.burrowState === 'burrowing') continue;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = a.radius + b.radius - 4;

            if (dist < minDist) {
                const push = (minDist - dist) * 0.25;
                const nx = dx / dist;
                const ny = dy / dist;

                a.x -= nx * push;
                a.y -= ny * push;
                b.x += nx * push;
                b.y += ny * push;
            }
        }
    }

    if (zombieSoundCooldown > 0) zombieSoundCooldown = Math.max(0, zombieSoundCooldown - dt);
    if (zombieSoundCooldown <= 0 && enemies.length > 0) {
        let shouldPlay = false;
        if (enemyCountIncreased) {
            shouldPlay = Math.random() < 0.45;
        } else if (closeZombieNearPlayer) {
            shouldPlay = Math.random() < 0.18;
        }
        if (shouldPlay) {
            playZombieSound();
            zombieSoundCooldown = 4 + Math.random() * 2;
        }
    }
    lastEnemyCount = enemies.length;

    updateFloatingTexts(dt);

    updateExplosions(dt);

    // update death effects
    for (let i = deathEffects.length - 1; i >= 0; i--) {
        const effect = deathEffects[i];
        effect.life -= dt;
        if (effect.life <= 0) deathEffects.splice(i, 1);
    }

    updateHealthPacks(dt);

    // 玩家受傷計時
    if (player.hitCooldown > 0) {
        player.hitCooldown = Math.max(0, player.hitCooldown - dt);
    }
    if (player.hurtTimer > 0) {
        player.hurtTimer = Math.max(0, player.hurtTimer - dt);
    }
    // for (const en of enemies) {
    //     if (en.hp <= 0) continue;
    //     if (en.type === 'burrower') continue;

    //     const px = player.x - en.x;
    //     const py = player.y - en.y;
    //     if (Math.hypot(px, py) <= player.radius + en.radius) {
    //         if (player.hitCooldown <= 0) {

    //             const enemyDamage = getEnemyDamage(en.type);

    //             player.health = Math.max(0, player.health - enemyDamage);

    //             floats.push({
    //                 x: player.x,
    //                 y: player.y - 32,
    //                 vy: -45,
    //                 life: 0.8,
    //                 text: `-${enemyDamage}`
    //             });

    //             player.hitCooldown = 0.8;
    //             player.hurtTimer = 0.28;
    //             playHurtSound();
    //             player.speedBoostTimer = 0.7;
    //             player.speedBoostMultiplier = 1.25;

    //             if (player.health <= 0 && !isGameOver) {
    //                 isGameOver = true;
    //                 gameStarted = false;
    //                 gameOverMenu.style.display = 'flex';
    //                 canvas.style.cursor = 'auto';
    //                 document.body.classList.remove('game-playing');
    //                 gameOverTime.textContent = `生存時間: ${Math.floor(survivalTime)}s`;
    //                 gameOverScore.textContent = `分數: ${score}`;
    //                 playDeathSound();
    //             }
    //         }
    //         break;
    //     }
    // }

    if (isGameOver) return;

    handleAttackHits();
}

function handleEnemyDeath(en, i) {
    const defeatedBoss = en.type === 'boss';

    // 爆炸效果
    if (explosionEnabled) {

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

    comboCount++;
    comboTimer = comboDuration;

    let expGain = 1;

    if (en.type === 'leaper') {
        expGain = 2;
    } else if (en.type === 'screamer') {
        expGain = 3;
    } else if (en.type === 'burrower') {
        expGain = 6;
    } 

    playerExp += expGain;
    killCount++;
    healFromBloodRageKill();

    // 顯示 COMBO 數字 
    // if (comboCount >= 2) {

    //     addFloatText(
    //         `COMBO x${comboCount}`,
    //         0.8
    //     );
    // }

    deathEffects.push({
        x: en.x,
        y: en.y,
        radius: en.radius,
        life: 0.35,
        maxLife: 0.35
    });

    const timeBonus =
        Math.floor(survivalTime / 60) * 2;

    if (en.type === 'leaper') {

        score +=
            25 + (timeBonus * 2);

    } else if (en.type === 'burrower') {

        score +=
            45 + (timeBonus * 3);

        burrowSpawnCooldown = 35;

        if (
            player.isBound &&
            player.boundEnemyId === en.id
        ) {
            player.isBound = false;
            player.boundEnemyId = null;
        }

    } else if (en.type === 'screamer') {

        score +=
            35 + (timeBonus * 2);

    } else {

        score +=
            10 + timeBonus;
    }

    en.attackState = 'dead';
    en.attackTimer = 0;
    en.attackCooldown = 0;

    enemies.splice(i, 1);

    if (defeatedBoss && !isPracticeMode) {
        bossHealthBarVisible = false;
        bossHealthBarAnim = 0;
        triggerVictory();
    }
}





function updateEnemies(dt) {

}

function addCorpseEffect(en) {
    const pieces = [];

    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = en.radius * (0.25 + Math.random() * 0.85);

        pieces.push({
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            radius: Math.max(3, en.radius * (0.12 + Math.random() * 0.1))
        });
    }

    corpseEffects.push({
        x: en.x,
        y: en.y,
        radius: en.radius,
        timer: 18.0,
        duration: 18.0,
        pieces
    });
}

function updateCorpseEffects(dt) {
    for (let i = corpseEffects.length - 1; i >= 0; i--) {
        const corpse = corpseEffects[i];

        corpse.timer -= dt;

        if (corpse.timer <= 0) {
            corpseEffects.splice(i, 1);
        }
    }
}

function updateBossSlamImpactEffects(dt) {
    for (let i = bossSlamImpactEffects.length - 1; i >= 0; i--) {
        const fx = bossSlamImpactEffects[i];

        fx.timer -= dt;

        if (fx.timer <= 0) {
            bossSlamImpactEffects.splice(i, 1);
        }
    }
}

function updateBossHealthBar(dt) {
    const boss =
        enemies.find(en => en.type === 'boss' && en.hp > 0);

    bossHealthBarVisible =
        bossFightStarted &&
        !bossIntroActive &&
        !!boss;

    if (bossHealthBarVisible) {
        bossHealthBarAnim =
            Math.min(1, bossHealthBarAnim + dt * 2.8);
    } else {
        bossHealthBarAnim = 0;
    }
}

function drawBossHealthBar() {
    if (!bossHealthBarVisible || bossHealthBarAnim <= 0) return;

    const boss =
        enemies.find(en => en.type === 'boss' && en.hp > 0);

    if (!boss) return;

    const width =
        Math.min(620, canvas.width - 80);

    const height = 26;
    const x = (canvas.width - width) / 2;
    const targetY = 24;
    const y = -70 + (targetY + 70) * bossHealthBarAnim;
    const hpRatio =
        Math.max(0, Math.min(1, boss.hp / boss.maxHp));

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(x - 10, y - 6, width + 20, height + 26);

    ctx.strokeStyle = '#050000';
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 10, y - 6, width + 20, height + 26);

    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#050000';
    ctx.fillStyle = '#f0d0c8';
    ctx.strokeText('巨型屠夫', canvas.width / 2, y + 3);
    ctx.fillText('巨型屠夫', canvas.width / 2, y + 3);

    ctx.fillStyle = '#1b0303';
    ctx.fillRect(x, y + 19, width, height);

    ctx.fillStyle = '#7f0d16';
    ctx.fillRect(x, y + 19, width * hpRatio, height);

    ctx.fillStyle = 'rgba(255, 70, 80, 0.32)';
    ctx.fillRect(x, y + 19, width * hpRatio, 7);

    ctx.strokeStyle = '#050000';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y + 19, width, height);

    ctx.restore();
}

function drawCorpseEffects() {
    for (const corpse of corpseEffects) {
        const fade =
            Math.max(0, Math.min(1, corpse.timer / corpse.duration));

        ctx.save();
        ctx.globalAlpha = Math.min(1, fade * 1.25);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(90, 0, 12, 0.72)';
        ctx.ellipse(
            corpse.x,
            corpse.y + corpse.radius * 0.35,
            corpse.radius * 1.1,
            corpse.radius * 0.55,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = 'rgba(45, 0, 6, 0.82)';

        for (const piece of corpse.pieces) {
            ctx.beginPath();
            ctx.arc(
                corpse.x + piece.x,
                corpse.y + piece.y,
                piece.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }
}

function drawBossSlamImpactEffects() {
    for (const fx of bossSlamImpactEffects) {
        const progress =
            1 - Math.max(0, fx.timer) / fx.duration;
        const alpha =
            Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(fx.x, fx.y);
        ctx.rotate(fx.angle);
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(35, 0, 0, 0.95)';
        ctx.lineWidth = 7;
        ctx.arc(0, 0, 48 + progress * 80, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(120, 0, 18, 0.72)';
        ctx.lineWidth = 4;
        ctx.arc(0, 0, 32 + progress * 55, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(20, 0, 0, 0.9)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';

        for (let i = -2; i <= 2; i++) {
            const spread = i * 0.26;
            const start = 20 + Math.abs(i) * 10;
            const end = bossSlamRange * (0.72 + progress * 0.28);

            ctx.beginPath();
            ctx.moveTo(
                Math.cos(spread) * start,
                Math.sin(spread) * start
            );
            ctx.lineTo(
                Math.cos(spread) * end,
                Math.sin(spread) * end
            );
            ctx.stroke();
        }

        ctx.restore();
    }
}

function startBossBasicAttack(en) {
    en.bossSkillState = 'basicWindup';
    en.bossBasicAttackTimer = bossBasicAttackWindupTime;
    en.bossBasicAttackAngle = Math.atan2(player.y - en.y, player.x - en.x);
}

function resolveBossBasicAttack(en) {
    const dx = player.x - en.x;
    const dy = player.y - en.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    const angleDiff =
        Math.atan2(
            Math.sin(angle - en.bossBasicAttackAngle),
            Math.cos(angle - en.bossBasicAttackAngle)
        );

    screenShake = Math.max(screenShake, 6);

    if (
        dist <= en.radius + bossBasicAttackRange + player.radius &&
        Math.abs(angleDiff) <= Math.PI * 0.34
    ) {
        damagePlayer(bossBasicAttackDamage);

        player.knockbackX = (dx / dist) * 150;
        player.knockbackY = (dy / dist) * 150;
    }
}

function startBossSlam(en) {
    en.bossSkillState = 'slamWindup';
    en.bossSkillTimer = bossSlamWindupTime;
    en.bossSkillAngle = Math.atan2(player.y - en.y, player.x - en.x);
}

function resolveBossSlam(en) {
    const dx = player.x - en.x;
    const dy = player.y - en.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    const angleDiff =
        Math.atan2(
            Math.sin(angle - en.bossSkillAngle),
            Math.cos(angle - en.bossSkillAngle)
        );

    screenShake = Math.max(screenShake, 14);

    bossSlamImpactEffects.push({
        x: en.x + Math.cos(en.bossSkillAngle) * en.radius,
        y: en.y + Math.sin(en.bossSkillAngle) * en.radius,
        angle: en.bossSkillAngle,
        timer: 0.42,
        duration: 0.42
    });

    if (
        dist <= bossSlamRange + player.radius &&
        Math.abs(angleDiff) <= bossSlamArc / 2
    ) {
        damagePlayer(bossSlamDamage);

        player.knockbackX = (dx / dist) * 220;
        player.knockbackY = (dy / dist) * 220;
    }
}

function startBossCharge(en) {
    const dx = player.x - en.x;
    const dy = player.y - en.y;
    const len = Math.hypot(dx, dy) || 1;

    en.bossSkillState = 'chargeWindup';
    en.bossSkillTimer = bossChargeWindupTime;
    en.bossSkillAngle = Math.atan2(dy, dx);
    en.bossChargeDirX = dx / len;
    en.bossChargeDirY = dy / len;
    en.bossChargeRemaining =
        Math.min(canvas.width, canvas.height) * bossChargeDistanceRatio;
    en.bossChargeHit = false;
}

function updateBossBehavior(en, dt) {
    if (bossIntroActive) return;

    if (!en.bossSkillState) en.bossSkillState = 'idle';
    if (en.bossSlamCooldown === undefined) en.bossSlamCooldown = 2.0;
    if (en.bossChargeCooldown === undefined) en.bossChargeCooldown = 4.0;
    if (en.bossBasicAttackCooldown === undefined) en.bossBasicAttackCooldown = 0.8;
    if (en.bossBasicAttackTimer === undefined) en.bossBasicAttackTimer = 0;
    if (en.baseSpeed === undefined) en.baseSpeed = en.speed;

    const dx = player.x - en.x;
    const dy = player.y - en.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const frenzyRate = en.bossFrenzied ? 0.75 : 1;

    if (
        !en.bossFrenzied &&
        en.hp / en.maxHp <= 0.35
    ) {
        en.bossFrenzied = true;
        screenShake = Math.max(screenShake, 12);
    }

    if (en.bossSlamCooldown > 0) {
        en.bossSlamCooldown = Math.max(0, en.bossSlamCooldown - dt);
    }

    if (en.bossChargeCooldown > 0) {
        en.bossChargeCooldown = Math.max(0, en.bossChargeCooldown - dt);
    }

    if (en.bossBasicAttackCooldown > 0) {
        en.bossBasicAttackCooldown =
            Math.max(0, en.bossBasicAttackCooldown - dt);
    }

    if (en.bossSkillState === 'basicWindup') {
        en.bossBasicAttackTimer =
            Math.max(0, en.bossBasicAttackTimer - dt);

        if (en.bossBasicAttackTimer <= 0) {
            resolveBossBasicAttack(en);
            en.bossSkillState = 'idle';
            en.bossBasicAttackCooldown =
                bossBasicAttackCooldownTime * frenzyRate;
        }

        return;
    }

    if (en.bossSkillState === 'slamWindup') {
        en.bossSkillTimer = Math.max(0, en.bossSkillTimer - dt);

        if (en.bossSkillTimer <= 0) {
            resolveBossSlam(en);
            en.bossSkillState = 'idle';
            en.bossSlamCooldown = bossSlamCooldownTime * frenzyRate;
        }

        return;
    }

    if (en.bossSkillState === 'chargeWindup') {
        en.bossSkillTimer = Math.max(0, en.bossSkillTimer - dt);
        screenShake = Math.max(screenShake, 2);

        if (en.bossSkillTimer <= 0) {
            en.bossSkillState = 'charging';
        }

        return;
    }

    if (en.bossSkillState === 'charging') {
        const moveDist =
            Math.min(bossChargeSpeed * dt, en.bossChargeRemaining);

        en.x += en.bossChargeDirX * moveDist;
        en.y += en.bossChargeDirY * moveDist;
        en.bossChargeRemaining -= moveDist;

        screenShake = Math.max(screenShake, 5);

        const hitDist =
            Math.hypot(player.x - en.x, player.y - en.y);

        if (
            !en.bossChargeHit &&
            hitDist <= player.radius + en.radius + 10
        ) {
            en.bossChargeHit = true;
            damagePlayer(bossChargeDamage);

            const hitLen = hitDist || 1;
            player.knockbackX = ((player.x - en.x) / hitLen) * 260;
            player.knockbackY = ((player.y - en.y) / hitLen) * 260;
        }

        const hitWall =
            en.x <= en.radius ||
            en.x >= canvas.width - en.radius ||
            en.y <= en.radius ||
            en.y >= canvas.height - en.radius;

        en.x = Math.max(en.radius, Math.min(canvas.width - en.radius, en.x));
        en.y = Math.max(en.radius, Math.min(canvas.height - en.radius, en.y));

        if (hitWall || en.bossChargeRemaining <= 0) {
            en.bossSkillState = 'idle';
            en.bossChargeCooldown = bossChargeCooldownTime * frenzyRate;
            screenShake = Math.max(screenShake, 10);
        }

        return;
    }

    const playerMovingAway =
        playerMoveDir.x * nx + playerMoveDir.y * ny > 0.35;

    if (
        dist <= bossSlamRange + player.radius + 10 &&
        en.bossSlamCooldown <= 0
    ) {
        startBossSlam(en);
        return;
    }

    if (
        dist > bossSlamRange + 35 &&
        dist < 380 &&
        playerMovingAway &&
        en.bossChargeCooldown <= 0
    ) {
        startBossCharge(en);
        return;
    }

    if (
        dist <= en.radius + bossBasicAttackRange + player.radius &&
        en.bossBasicAttackCooldown <= 0
    ) {
        startBossBasicAttack(en);
        return;
    }

    const moveSpeed =
        (en.baseSpeed || en.speed) * (en.bossFrenzied ? 1.2 : 1);

    en.x += nx * moveSpeed * dt;
    en.y += ny * moveSpeed * dt;

    handleEnemyPush(en, dt);
}

function drawBossIntroRing() {
    if (!bossIntroActive) return;

    const boss = enemies.find(en => en.type === 'boss');
    if (!boss) return;

    const progress =
        1 - Math.max(0, bossIntroTimer) / bossIntroDuration;

    const radius =
        boss.radius * 1.4 + progress * 120;

    const alpha =
        0.55 * (1 - progress * 0.45);

    ctx.save();

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 20, 40, ${alpha})`;
    ctx.lineWidth = 5;
    ctx.arc(
        boss.x,
        boss.y,
        radius,
        0,
        Math.PI * 2
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = `rgba(180, 0, 20, ${0.12 * (1 - progress)})`;
    ctx.arc(
        boss.x,
        boss.y,
        radius * 0.65,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
}

function drawBossIntroOverlay() {
    if (!bossIntroActive) return;

    const progress =
        1 - Math.max(0, bossIntroTimer) / bossIntroDuration;

    const pulse =
        Math.sin(performance.now() * 0.012) * 0.08;

    ctx.save();

    ctx.fillStyle = `rgba(0, 0, 0, ${0.45 + pulse})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 46px sans-serif';
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillStyle = `rgba(255, 40, 55, ${0.85 + progress * 0.15})`;

    ctx.strokeText(
        '巨型屠夫',
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.fillText(
        '巨型屠夫',
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    applyScreenShake();

    drawGroundCracks();

    drawBossSlamImpactEffects();

    drawCorpseEffects();

    drawBossIntroRing();

    drawEnemies();

    drawExplosions();
    drawImpactEffects();
    drawDeathEffects();

    drawHealthPacks();

    drawUpgradeEffect();

    drawPlayer();

    drawAttackCooldown();
    drawSkillCooldowns();

    drawLowHealthOverlay();

    drawAttack();
    drawAimCursor();

    drawBossIntroOverlay();

    ctx.restore();

    drawBossHealthBar();

    drawFloatingTexts();
}



function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

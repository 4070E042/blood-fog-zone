// ================================
// 開始 / 結束選單
// ================================
const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');
const gameplayButton = document.getElementById('gameplay-button');
const gameplayMenu = document.getElementById('gameplay-menu');
const gameplayBackButton = document.getElementById('gameplay-back-button');
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
const gameOverLevel = document.getElementById('game-over-level');
const victoryTime = document.getElementById('victory-time');
const victoryBossTime = document.getElementById('victory-boss-time');
const victoryKills = document.getElementById('victory-kills');
const victoryLevel = document.getElementById('victory-level');
const victoryScore = document.getElementById('victory-score');


// ================================
// 升級 / 暫停選單
// ================================
const upgradeMenu = document.getElementById('upgrade-menu');
const pauseMenu = document.getElementById('pause-menu');
const bgmVolumeSlider = document.getElementById('bgm-volume-slider');
const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
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
const bossFrenzyPulseEffects = [];
let bossFrenzyAlertTimer = 0;

function triggerGameOver() {

    if (isGameOver) return;

    stopBGM();
    stopBossBGM();
    isGameOver = true;
    gameStarted = false;

    gameOverMenu.style.display = 'flex';

    canvas.style.cursor = 'auto';

    document.body.classList.remove('game-playing');

    if (bossFightStartTime === null) {
        gameOverTime.textContent = `生存時間: ${Math.floor(survivalTime)}s`;
        gameOverScore.style.display = 'none';
    } else {
        bossFightDuration = Math.max(0, survivalTime - bossFightStartTime);
        gameOverTime.textContent = '已進入 Boss 戰';
        gameOverScore.textContent =
            `Boss 戰耗時: ${Math.floor(bossFightDuration)}s`;
        gameOverScore.style.display = 'block';
    }

    gameOverKills.textContent = `擊殺數: ${killCount}`;
    gameOverLevel.textContent = `角色等級: Lv.${player.level}`;

    playDeathSound();
}

function resetGame() {
    playBGM();
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
    survivalTime = GAME_BASE.survivalTime;
    killCount = 0;

    player.level = 1;
    player.exp = 0;
    player.nextExp = 8;

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

    bossSpawned = BOSS_STATE.spawned;
    bossIntroActive = BOSS_STATE.introActive;
    bossIntroTimer = BOSS_STATE.introTimer;
    bossFightStarted = BOSS_STATE.fightStarted;
    bossFightStartTime = BOSS_STATE.fightStartTime;
    bossClearTime = BOSS_STATE.clearTime;
    bossFightDuration = BOSS_STATE.fightDuration;
    bossHealthBarVisible = BOSS_STATE.healthBarVisible;
    bossHealthBarAnim = BOSS_STATE.healthBarAnim;


    // ================================
    // UI
    // ================================
    pauseMenu.style.display = 'none';
    startMenu.style.display = 'none';
    classSelectMenu.style.display = 'none';
    gameplayMenu.style.display = 'none';
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
    explosionEnabled = false;
    explosionLevel = 0;
    explosionRadius = 70;
    explosionDamage = 4;

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
    bossFrenzyPulseEffects.length = 0;
    bossFrenzyAlertTimer = 0;
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
            playUIHoverSound();
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
    gameplayMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    victoryMenu.style.display = 'none';
    pauseMenu.style.display = 'none';
    upgradeMenu.style.display = 'none';
    classSelectMenu.style.display = 'flex';

    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
}

startButton.addEventListener('click', () => {
    playUIHoverSound(true);
    showClassSelect(false);
});

gameplayButton.addEventListener('click', () => {
    playUIHoverSound(true);
    startMenu.style.display = 'none';
    gameplayMenu.style.display = 'flex';
    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
});

gameplayBackButton.addEventListener('click', () => {
    playUIHoverSound(true);
    gameplayMenu.style.display = 'none';
    startMenu.style.display = 'flex';
    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
});

practiceStartButton.addEventListener('click', () => {
    playUIHoverSound(true);
    showClassSelect(true);
});

startButton.addEventListener('mouseenter', playUIHoverSound);
gameplayButton.addEventListener('mouseenter', playUIHoverSound);
gameplayBackButton.addEventListener('mouseenter', playUIHoverSound);
practiceStartButton.addEventListener('mouseenter', playUIHoverSound);

bgmVolumeSlider.addEventListener('input', () => {
    setBGMVolume(bgmVolumeSlider.value);
});

sfxVolumeSlider.addEventListener('input', () => {
    setSFXVolume(sfxVolumeSlider.value);
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
    bossFightStartTime = null;
    bossClearTime = null;
    bossFightDuration = 0;
    bossHealthBarVisible = false;
    bossHealthBarAnim = 0;
    isPaused = false;
    isUpgradeActive = false;

    enemies.length = 0;
    healthPacks.length = 0;
    floats.length = 0;
    corpseEffects.length = 0;
    bossSlamImpactEffects.length = 0;
    bossFrenzyPulseEffects.length = 0;
    bossFrenzyAlertTimer = 0;
    deathEffects.length = 0;
    explosions.length = 0;

    updatePracticeExitMenu();
    updatePracticeModeDisplay();

    pauseMenu.style.display = 'none';
    classSelectMenu.style.display = 'none';
    gameplayMenu.style.display = 'none';
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
    bossFightStartTime = null;
    bossClearTime = null;
    bossFightDuration = 0;
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
    player.exp = 0;
    player.level = 1;

    enemies.length = 0;
    healthPacks.length = 0;
    floats.length = 0;
    corpseEffects.length = 0;
    bossSlamImpactEffects.length = 0;
    bossFrenzyPulseEffects.length = 0;
    bossFrenzyAlertTimer = 0;
    deathEffects.length = 0;
    explosions.length = 0;

    victoryMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    pauseMenu.style.display = 'none';
    classSelectMenu.style.display = 'none';
    gameplayMenu.style.display = 'none';
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

    const rating = getPurificationRating(bossFightDuration);

    victoryTime.textContent =
        `生存時間: ${Math.floor(survivalTime)}s`;
    victoryBossTime.textContent =
        `Boss 戰耗時: ${Math.floor(bossFightDuration)}s`;
    victoryKills.textContent = `擊殺數: ${killCount}`;
    victoryLevel.textContent = `角色等級: Lv.${player.level}`;
    victoryScore.textContent = `淨化評級: ${rating}`;

    victoryMenu.style.display = 'flex';
    canvas.style.cursor = 'auto';
    document.body.classList.remove('game-playing');
}


// ================================
// 威脅階段
// ================================
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
        playZombieMutationSound();
        showPhaseAlert('大型變異反應', 'Boss 即將出現');
    } else if (survivalTime >= 240 && currentThreatPhase < 3) {
        nextPhase = 3;
        playZombieMutationSound();
        showPhaseAlert('感染失控', '變異體組合壓力上升');
    } else if (survivalTime >= 150 && currentThreatPhase < 2) {
        nextPhase = 2;
        playZombieMutationSound();
        showPhaseAlert('變異體出現', '地洞殭屍開始活動');
    } else if (survivalTime >= 60 && currentThreatPhase < 1) {
        nextPhase = 1;
        playZombieMutationSound();
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
    // 更新停止條件
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
    // 畫面與升級特效
    // ================================
    if (upgradeEffectTimer > 0) {
        upgradeEffectTimer = Math.max(0, upgradeEffectTimer - dt);
    }

    // ================================
    // 玩家狀態效果
    // ================================
    updatePlayerStatusEffects(dt);


    // ================================
    // 生存時間與 Boss 流程
    // ================================
    survivalTime += dt;
    updateThreatPhase(dt);

    if (
        !isPracticeMode &&
        !bossSpawned &&
        survivalTime >= BOSS_BASE.spawnTime
    ) {
        stopBGM();
        playBossRoarSound();
        bossSpawned = true;
        bossIntroActive = true;
        bossIntroTimer = bossIntroDuration;
        bossFightStarted = false;
        bossFightStartTime = null;
        bossClearTime = null;
        bossFightDuration = 0;
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
    updateBossFrenzyEffects(dt);
    updateBossHealthBar(dt);


    if (player.exp >= player.nextExp) {
        levelUp();
        return;
    }

    // ================================
    // Boss 介紹流程
    // ================================
    if (updateBossIntro(dt)) {
        return;
    }

    // ================================
    // 玩家輸入與移動
    // ================================
    const moveInput = updatePlayerInput();

    updatePlayerMovement(dt, moveInput.dx, moveInput.dy);
    updatePlayerPositionClamp();

    updateHUD();

    updateAttack(dt);
    updateOrbitSkill(dt);

    handleAutoAttack();


    const enemiesBeforeSpawn = enemies.length;
    // 怪物生成節奏
    spawnTimer += dt;
    let currentSpawnInterval = getCurrentSpawnInterval();

    updateHealthPackSpawn(dt);

    // 怪物生產
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

    resolveEnemySeparation();

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


    if (isGameOver) return;

    handleAttackHits();
}



function getCurrentSpawnInterval() {

    if (survivalTime < 60) {
        return 1.8 - survivalTime * 0.0035;
    }

    if (survivalTime < 150) {
        return 1.59 - (survivalTime - 60) * 0.0025;
    }

    if (survivalTime < 240) {
        return 1.365 - (survivalTime - 150) * 0.0026;
    }

    return Math.max(
        0.8,
        1.13 - (survivalTime - 240) * 0.0022
    );
}

function resolveEnemySeparation() {
    // 敵人互相推開，避免全部疊成一團
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
}




function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGameBackground();

    ctx.save();

    applyScreenShake();

    drawGroundCracks();

    drawBossSlamImpactEffects();
    drawBossFrenzyPulseEffects();

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

    drawBossAtmosphereOverlay();
    drawLowHealthOverlay();

    drawAttack();
    drawAimCursor();

    drawBossIntroOverlay();

    ctx.restore();

    drawBossHealthBar();
    drawBossFrenzyAlert();

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

const keys = {};
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
const practiceModeHint = document.getElementById('practice-mode-hint');
const practicePanel = document.getElementById('practice-panel');
const practiceSelectedEnemy = document.getElementById('practice-selected-enemy');
const practiceExitMenu = document.getElementById('practice-exit-menu');

const practiceEnemyOptions = [
    { type: 'normal', label: '普通殭屍' },
    { type: 'leaper', label: '跳躍者' },
    { type: 'screamer', label: '尖叫者' },
    { type: 'burrower', label: '地洞殭屍' }
    ,
    { type: 'boss', label: '屠夫巨屍' }
];

function updatePracticeModeHint() {
    practiceModeHint.style.display = isPracticeMode ? 'block' : 'none';
}

function getPracticeEnemyIndex() {
    const index = practiceEnemyOptions.findIndex(
        option => option.type === practiceSelectedEnemyType
    );

    return index >= 0 ? index : 0;
}

function updatePracticePanel() {
    const selectedEnemy = practiceEnemyOptions[getPracticeEnemyIndex()];

    practiceSelectedEnemy.textContent = selectedEnemy.label;
    practicePanel.style.display =
        isPracticeMode && isPracticePanelOpen ? 'block' : 'none';
}

function getPracticeEnemyLabel() {
    return practiceEnemyOptions[getPracticeEnemyIndex()].label;
}

function updatePracticeModeDisplay() {
    updatePracticeModeHint();
    updatePracticePanel();
}

function updatePracticeExitMenu() {
    practiceExitMenu.style.display =
        isPracticeExitMenuOpen ? 'flex' : 'none';
}

function selectPracticeEnemy(step) {
    const currentIndex = getPracticeEnemyIndex();
    const nextIndex =
        (currentIndex + step + practiceEnemyOptions.length) %
        practiceEnemyOptions.length;

    practiceSelectedEnemyType = practiceEnemyOptions[nextIndex].type;
    updatePracticePanel();
}

window.addEventListener('keydown', (e) => {
    const k = e.key;

    if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();

        if (!isPracticeMode) {
            isPracticePanelOpen = false;
            updatePracticePanel();
            return;
        }

        isPracticePanelOpen = !isPracticePanelOpen;
        updatePracticePanel();
        return;
    }

    if (
        isPracticeMode &&
        isPracticePanelOpen &&
        !isPracticeExitMenuOpen &&
        (e.key === 'ArrowUp' || e.key === 'ArrowDown')
    ) {
        e.preventDefault();

        selectPracticeEnemy(e.key === 'ArrowUp' ? -1 : 1);
        return;
    }

    if (
        isPracticeMode &&
        isPracticePanelOpen &&
        !isPracticeExitMenuOpen &&
        e.key === 'Enter'
    ) {
        e.preventDefault();

        spawnPracticeEnemy(practiceSelectedEnemyType);
        addFloatText(`生成：${getPracticeEnemyLabel()}`, 0.8);
        return;
    }

    // ESC 鍵處理
    if (e.key === 'Escape') {
        if (isPracticeMode && gameStarted) {
            e.preventDefault();

            isPracticeExitMenuOpen = !isPracticeExitMenuOpen;
            isPracticePanelOpen = false;
            isPaused = isPracticeExitMenuOpen;

            canvas.style.cursor = isPaused ? 'auto' : 'none';

            if (isPaused) {
                document.body.classList.remove('game-playing');
            } else {
                document.body.classList.add('game-playing');
            }

            updatePracticePanel();
            updatePracticeExitMenu();
            return;
        }

        if (!gameStarted || isGameOver || isUpgradeActive) return;

        isPaused = !isPaused;

        if (isPaused) {
            pauseMenu.style.display = 'flex';
            canvas.style.cursor = 'auto';
            document.body.classList.remove('game-playing');
        } else {
            pauseMenu.style.display = 'none';
            canvas.style.cursor = 'none';
            document.body.classList.add('game-playing');
        }
    }

    if (e.key === 't' || e.key === 'T') {

        autoAttackMode = !autoAttackMode;

        addFloatText(
            autoAttackMode
                ? '自動攻擊'
                : '手動攻擊',
            1
        );
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();

        if (!isPracticeMode) return;

        if (!gameStarted || isGameOver || isUpgradeActive) return;

        playerExp = playerNextExp;
    }

    if (
        (e.key === 'e' || e.key === 'E') &&
        !e.repeat &&
        playerClass === 'executioner' &&
        bloodRageUnlocked &&
        gameStarted &&
        !isUpgradeActive &&
        !isPaused &&
        !isGameOver
    ) {
        e.preventDefault();
        activateBloodRage();
        return;
    }

    if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        activateBloodStep();
        return;
    }

    if (
        (e.key === 'r' || e.key === 'R') &&
        !e.repeat &&
        playerClass === 'executioner' &&
        boneBreakerUnlocked &&
        gameStarted &&
        !isUpgradeActive &&
        !isPaused &&
        !isGameOver
    ) {
        e.preventDefault();
        activateBoneBreaker();
        return;
    }

    // 震波技能
    if (
        (e.key === 'e' || e.key === 'E') &&
        shockwaveUnlocked &&
        shockwaveCooldown <= 0 &&
        !isUpgradeActive &&
        !isPaused &&
        !isGameOver
    ) {
        shockwaveCooldown = shockwaveCooldownTime;
        screenShake = 8;

        impactEffects.push({
            x: player.x,
            y: player.y,
            life: 0.55,
            maxLife: 0.55,
            radius: 90,
            shockwave: true
        });


        // 地板裂痕特效
        groundCracks.push({
            x: player.x,
            y: player.y,
            life: 5,
            maxLife: 5,
            radius: shockwaveRadius
        });

        for (const en of enemies) {
            const dx = en.x - player.x;
            const dy = en.y - player.y;
            const dist = Math.hypot(dx, dy) || 1;

            // Shockwave 命中範圍內敵人
            if (dist <= shockwaveRadius) {
                en.hp -= shockwaveDamage;

                en.stunTimer = shockwaveStunTime;

                const nx = dx / dist;
                const ny = dy / dist;

                en.x += nx * shockwaveKnockback * 0.25;
                en.y += ny * shockwaveKnockback * 0.25;

                floats.push({
                    x: en.x,
                    y: en.y - en.radius - 10,
                    vy: -40,
                    life: 0.8,
                    text: `震波-${shockwaveDamage}`
                });
            }
        }

        addFloatText('衝擊震波', 0.8);
    }

    if (/Arrow|w|a|s|d|W|A|S|D/.test(k)) {
        keys[k] = true;
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { delete keys[e.key]; });

window.addEventListener('mousemove', (e) => {
    if (isPaused || isGameOver || isUpgradeActive || !gameStarted) return;

    const r = canvas.getBoundingClientRect();
    mouse.x = Math.max(
        0,
        Math.min(
            canvas.width,
            e.clientX - r.left
        )
    );

    mouse.y = Math.max(
        0,
        Math.min(
            canvas.height,
            e.clientY - r.top
        )
    );
});

window.addEventListener('mousedown', (e) => {
    if (!gameStarted || isUpgradeActive || isPaused || isGameOver) return;

    if (e.button === 0 && !isSwinging && attackCooldown <= 0) {
        isSwinging = true;
        swingProgress = 0;
        swingHitSet.clear();
        attackCooldown = attackCooldownTime;

        try {
            swingAudio.currentTime = 0;
            swingAudio.play().catch(() => { });
        } catch (e) { }
    }
});

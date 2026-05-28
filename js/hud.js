// ================================
// HUD 顯示
// ================================

const hudHealth = document.getElementById('health');
const hudTime = document.getElementById('time');
const hudKills = document.getElementById('kills');
const hudLevel = document.getElementById('level');

const healthBarFill = document.getElementById('health-bar-fill');
const expBarFill = document.getElementById('exp-bar-fill');
const gameOverKills = document.getElementById('game-over-kills');


// ================================
// 能力卡
// ================================

const hudAdrenalineLevel = document.getElementById('trait-adrenaline');
const hudSkullHitLevel = document.getElementById('trait-skull-hit');
const hudFrenzyLevel = document.getElementById('trait-frenzy');
const hudGripLevel = document.getElementById('trait-grip');
const hudExplosionLevel = document.getElementById('trait-explosion');

const slotAdrenaline = document.getElementById('slot-adrenaline');
const slotSkullHit = document.getElementById('slot-skull-hit');
const slotFrenzy = document.getElementById('slot-frenzy');
const slotGrip = document.getElementById('slot-grip');
const slotExplosion = document.getElementById('slot-explosion');

const iconAdrenaline = document.getElementById('icon-adrenaline');
const iconSkullHit = document.getElementById('icon-skull-hit');
const iconFrenzy = document.getElementById('icon-frenzy');
const iconGrip = document.getElementById('icon-grip');
const iconExplosion = document.getElementById('icon-explosion');


// ================================
// Skill UI
// ================================

const skillList = document.getElementById('skill-list');
const bloodExecutionStatus = document.getElementById('blood-execution-status');
const bloodExecutionLabel = document.getElementById('blood-execution-label');
const bloodExecutionFill = document.getElementById('blood-execution-fill');
const bloodStepStatus = document.getElementById('blood-step-status');
const bloodStepLabel = document.getElementById('blood-step-label');
const bloodStepFill = document.getElementById('blood-step-fill');
const bloodRageStatus = document.getElementById('blood-rage-status');
const bloodRageLabel = document.getElementById('blood-rage-label');
const bloodRageFill = document.getElementById('blood-rage-fill');
const boneBreakerStatus = document.getElementById('bone-breaker-status');
const boneBreakerLabel = document.getElementById('bone-breaker-label');
const boneBreakerFill = document.getElementById('bone-breaker-fill');

function refreshBuildList() {
    // 目前 Build 已改成能力卡 UI，先保留空函式避免 resetGame() 報錯
}

function refreshSkillList() {
    if (activeSkills.length <= 0) {
        skillList.innerHTML = '尚未習得技能';
        return;
    }

    skillList.innerHTML = activeSkills.join('<br>');
}

function updateTraitSlot(slot, icon, levelText, level, iconText) {
    if (level <= 0) {
        slot.classList.remove('active');
        slot.classList.add('empty');
        icon.className = 'trait-empty';
        icon.textContent = '✦';
        levelText.textContent = '—';
        return;
    }

    slot.classList.remove('empty');
    slot.classList.add('active');
    icon.className = 'trait-icon';
    icon.textContent = iconText;
    levelText.textContent = `Lv.${level}`;
}

function setSkillState(status, fill, state, ratio) {
    status.style.display = 'block';
    status.classList.remove('passive', 'ready', 'active', 'cooldown', 'locked');
    status.classList.add(state);

    fill.style.width =
        `${Math.max(0, Math.min(1, ratio)) * 100}%`;
}

function updateCoreSkillHUD() {
    const isExecutioner = playerClass === 'executioner';

    bloodExecutionStatus.querySelector('.hud-skill-row span:first-child')
        .textContent = '被動｜血決';
    bloodStepStatus.querySelector('.hud-skill-row span:first-child')
        .textContent = 'SPACE｜血步';
    bloodRageStatus.querySelector('.hud-skill-row span:first-child')
        .textContent = 'E｜血怒';
    boneBreakerStatus.querySelector('.hud-skill-row span:first-child')
        .textContent = 'R｜裂骨';

    if (!isExecutioner) {
        bloodExecutionLabel.textContent = '未解鎖';
        bloodStepLabel.textContent = '未解鎖';
        bloodRageLabel.textContent = '未解鎖';
        boneBreakerLabel.textContent = '未解鎖';

        setSkillState(bloodExecutionStatus, bloodExecutionFill, 'locked', 0);
        setSkillState(bloodStepStatus, bloodStepFill, 'locked', 0);
        setSkillState(bloodRageStatus, bloodRageFill, 'locked', 0);
        setSkillState(boneBreakerStatus, boneBreakerFill, 'locked', 0);
        return;
    }

    const executionRatio =
        Math.max(0, Math.min(1, bloodExecutionValue / bloodExecutionMax));

    bloodExecutionLabel.textContent =
        `${Math.round(executionRatio * 100)}%`;
    setSkillState(bloodExecutionStatus, bloodExecutionFill, 'passive', executionRatio);

    if (!bloodStepUnlocked) {
        bloodStepLabel.textContent = '未解鎖';
        setSkillState(bloodStepStatus, bloodStepFill, 'locked', 0);
    } else if (bloodStepCooldownTimer > 0) {
        bloodStepLabel.textContent =
            `Lv.${bloodStepLevel} ${bloodStepCooldownTimer.toFixed(1)}s`;
        setSkillState(
            bloodStepStatus,
            bloodStepFill,
            'cooldown',
            1 - bloodStepCooldownTimer / getBloodStepCooldown()
        );
    } else {
        bloodStepLabel.textContent = `Lv.${bloodStepLevel} 可用`;
        setSkillState(bloodStepStatus, bloodStepFill, 'ready', 1);
    }

    if (!bloodRageUnlocked) {
        bloodRageLabel.textContent = '未解鎖';
        setSkillState(bloodRageStatus, bloodRageFill, 'locked', 0);
    } else if (bloodRageActive) {
        bloodRageLabel.textContent = `發動中 ${bloodRageTimer.toFixed(1)}s`;
        setSkillState(
            bloodRageStatus,
            bloodRageFill,
            'active',
            bloodRageTimer / getBloodRageDuration()
        );
    } else if (bloodRageCooldownTimer > 0) {
        bloodRageLabel.textContent =
            `Lv.${bloodRageLevel} ${bloodRageCooldownTimer.toFixed(1)}s`;
        setSkillState(
            bloodRageStatus,
            bloodRageFill,
            'cooldown',
            1 - bloodRageCooldownTimer / getBloodRageCooldown()
        );
    } else {
        bloodRageLabel.textContent = `Lv.${bloodRageLevel} 可用`;
        setSkillState(bloodRageStatus, bloodRageFill, 'ready', 1);
    }

    if (!boneBreakerUnlocked) {
        boneBreakerLabel.textContent = '未解鎖';
        setSkillState(boneBreakerStatus, boneBreakerFill, 'locked', 0);
    } else if (boneBreakerCooldownTimer > 0) {
        boneBreakerLabel.textContent =
            `Lv.${boneBreakerLevel} ${boneBreakerCooldownTimer.toFixed(1)}s`;
        setSkillState(
            boneBreakerStatus,
            boneBreakerFill,
            'cooldown',
            1 - boneBreakerCooldownTimer / getBoneBreakerCooldown()
        );
    } else {
        boneBreakerLabel.textContent = `Lv.${boneBreakerLevel} 可用`;
        setSkillState(boneBreakerStatus, boneBreakerFill, 'ready', 1);
    }
}


// ================================
// HUD 更新
// ================================

function updateHUD() {

    // HP
    hudHealth.textContent = Math.floor(player.health);

    // 時間
    hudTime.textContent = `⏱️ ${Math.floor(survivalTime)}s`;

    // 擊殺
    hudKills.textContent = `💀 ${killCount}`;

    // 等級
    hudLevel.textContent = `✦ Lv. ${player.level}`;


    // ================================
    // 能力卡等級
    // ================================

    updateTraitSlot(slotAdrenaline, iconAdrenaline, hudAdrenalineLevel, speedLevel, '👟');
    updateTraitSlot(slotSkullHit, iconSkullHit, hudSkullHitLevel, damageLevel, '🗡️');
    updateTraitSlot(slotFrenzy, iconFrenzy, hudFrenzyLevel, attackSpeedLevel, '🥁');
    updateTraitSlot(slotGrip, iconGrip, hudGripLevel, rangeLevel, '📏');
    updateTraitSlot(slotExplosion, iconExplosion, hudExplosionLevel, explosionLevel, '💥');


    // ================================
    // HP Bar
    // ================================

    const hpRatio = player.health / player.maxHealth;
    healthBarFill.style.width = `${Math.max(0, hpRatio * 100)}%`;


    // ================================
    // EXP Bar
    // ================================

    const expRatio = player.exp / player.nextExp;
    expBarFill.style.width = `${Math.min(100, expRatio * 100)}%`;

    if (playerClass !== 'executioner') {
        bloodExecutionStatus.style.display = 'none';

    } else {
        const executionRatio =
            Math.max(
                0,
                Math.min(1, bloodExecutionValue / bloodExecutionMax)
            );

        bloodExecutionStatus.style.display = 'block';
        bloodExecutionLabel.textContent =
            `${Math.round(executionRatio * 100)}%`;
        bloodExecutionFill.style.width =
            `${executionRatio * 100}%`;

        bloodExecutionFill.style.background =
            executionRatio >= 0.66
                ? '#ff3355'
                : executionRatio >= 0.33
                    ? '#d83a4a'
                    : '#8f2633';
    }

    bloodRageStatus.classList.remove('ready', 'active', 'cooldown');

    if (playerClass !== 'executioner' || !bloodRageUnlocked) {
        bloodRageStatus.style.display = 'none';

    } else if (bloodRageActive) {
        bloodRageStatus.style.display = 'block';
        bloodRageStatus.classList.add('active');
        bloodRageLabel.textContent = `發動中 ${bloodRageTimer.toFixed(1)}s`;
        bloodRageFill.style.width =
            `${Math.max(0, (bloodRageTimer / getBloodRageDuration()) * 100)}%`;

    } else if (bloodRageCooldownTimer > 0) {
        bloodRageStatus.style.display = 'block';
        bloodRageStatus.classList.add('cooldown');
        bloodRageLabel.textContent =
            `Lv.${bloodRageLevel} ${bloodRageCooldownTimer.toFixed(1)}s`;
        bloodRageFill.style.width =
            `${Math.min(100, (1 - bloodRageCooldownTimer / getBloodRageCooldown()) * 100)}%`;

    } else {
        bloodRageStatus.style.display = 'block';
        bloodRageStatus.classList.add('ready');
        bloodRageLabel.textContent = `Lv.${bloodRageLevel} 可用`;
        bloodRageFill.style.width = '100%';
    }

    updateCoreSkillHUD();
}

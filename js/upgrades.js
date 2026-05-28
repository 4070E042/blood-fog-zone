const upgradeSpeedButton = document.getElementById('upgrade-speed');
const upgradeDamageButton = document.getElementById('upgrade-damage');
const upgradeRangeButton = document.getElementById('upgrade-range');
const upgradeAttackSpeedButton = document.getElementById('upgrade-attack-speed');
const upgradeBloodRageButton = document.getElementById('upgrade-blood-rage');
const upgradeBloodStepButton = document.getElementById('upgrade-blood-step');
const upgradeBoneBreakerButton = document.getElementById('upgrade-bone-breaker');
const upgradeExplosionButton = document.getElementById('upgrade-explosion');
const upgradeExplosionPowerButton = document.getElementById('upgrade-explosion-power');
const upgradeStretchButton = document.getElementById('upgrade-stretch');
const upgradeShockwaveButton = document.getElementById('upgrade-shockwave');
const upgradeOrbitButton = document.getElementById('upgrade-orbit');

const SKILL_UPGRADE_MAP = {
    bloodRage: {
        upgradeType: 'bloodRage',
        button: upgradeBloodRageButton
    },
    bloodStep: {
        upgradeType: 'bloodStep',
        button: upgradeBloodStepButton
    },
    boneBreaker: {
        upgradeType: 'boneBreaker',
        button: upgradeBoneBreakerButton
    },
    shockwave: {
        upgradeType: 'shockwave',
        button: upgradeShockwaveButton
    },
    stretch: {
        upgradeType: 'stretch',
        button: upgradeStretchButton
    },
    orbit: {
        upgradeType: 'orbit',
        button: upgradeOrbitButton
    }
};

//const LEVEL_EXP_TABLE = [ 0,8,14,22,32,45,60,78 ];
const LEVEL_EXP_TABLE = [0, 8, 9, 10, 11, 12, 13, 14];

const PLAYER_MAX_SPEED = 150;

upgradeSpeedButton.addEventListener('click', () => applyUpgrade('speed'));
upgradeDamageButton.addEventListener('click', () => applyUpgrade('damage'));
upgradeRangeButton.addEventListener('click', () => applyUpgrade('range'));
upgradeAttackSpeedButton.addEventListener('click', () => applyUpgrade('attackSpeed'));
upgradeBloodRageButton.addEventListener('click', () => applyUpgrade('bloodRage'));
upgradeBloodStepButton.addEventListener('click', () => applyUpgrade('bloodStep'));
upgradeBoneBreakerButton.addEventListener('click', () => applyUpgrade('boneBreaker'));
upgradeExplosionButton.addEventListener('click', () => applyUpgrade('explosion'));
upgradeStretchButton.addEventListener('click', () => applyUpgrade('stretch'));
upgradeShockwaveButton.addEventListener('click', () => applyUpgrade('shockwave'));
upgradeOrbitButton.addEventListener('click', () => applyUpgrade('orbit'));

function applyUpgrade(type) {
    if (!isUpgradeActive) return;

    switch (type) {

        case 'speed':
            if (speedLevel >= TRAIT_MAX_LEVEL) return;

            speedLevel++;

            if (speedLevel === 1) {
                player.speed = Math.min(player.speed + 5, PLAYER_MAX_SPEED);
            }

            addFloatText(`👟 腎上腺素 Lv.${speedLevel}`);
            break;

        case 'damage':
            if (damageLevel >= TRAIT_MAX_LEVEL) return;

            damageLevel++;
            stickDamage += 3;

            addFloatText(`🗡️ 破顱打擊 Lv.${damageLevel}`);
            break;

        case 'range':
            if (rangeLevel >= TRAIT_MAX_LEVEL) return;

            rangeLevel++;
            stickRange += rangeBonusByLevel[rangeLevel];

            addFloatText(`📏 加長握柄 Lv.${rangeLevel}`);
            break;

        case 'attackSpeed':
            if (attackSpeedLevel >= TRAIT_MAX_LEVEL) return;

            attackSpeedLevel++;
            baseAttackCooldownTime *= attackSpeedBonusByLevel[attackSpeedLevel];

            updateAttackCooldownTime();

            addFloatText(`🥁 狂躁節奏 Lv.${attackSpeedLevel}`);
            break;

        case 'bloodRage':
            if (bloodRageLevel >= bloodRageMaxLevel) return;

            bloodRageUnlocked = true;
            bloodRageLevel++;

            if (!activeSkills.includes('血怒狂暴')) {
                activeSkills.push('血怒狂暴');
            }

            addFloatText(`血怒狂暴 Lv.${bloodRageLevel}`, 1.2);
            refreshSkillList();
            break;

        case 'bloodStep':
            if (bloodStepLevel >= bloodStepMaxLevel) return;

            bloodStepUnlocked = true;
            bloodStepLevel++;

            if (!activeSkills.includes('血步突進')) {
                activeSkills.push('血步突進');
            }

            addFloatText(`血步突進 Lv.${bloodStepLevel}`, 1.2);
            refreshSkillList();
            break;

        case 'boneBreaker':
            if (boneBreakerLevel >= boneBreakerMaxLevel) return;

            boneBreakerUnlocked = true;
            boneBreakerLevel++;

            if (!activeSkills.includes('裂骨重擊')) {
                activeSkills.push('裂骨重擊');
            }

            addFloatText(`裂骨重擊 Lv.${boneBreakerLevel}`, 1.2);
            refreshSkillList();
            break;

        case 'stretch':
            stretchUnlocked = true;
            stretchLevel++;

            if (!activeBuilds.includes('🪄 棍棒伸縮')) {
                activeBuilds.push('🪄 棍棒伸縮');
            }

            addFloatText('🪄 棍棒伸縮解鎖', 1.2);
            refreshSkillList();
            break;

        case 'explosion':
            if (explosionLevel >= TRAIT_MAX_LEVEL) return;

            explosionEnabled = true;
            explosionLevel++;

            if (explosionLevel === 1) {
                if (!activeBuilds.includes('💥 爆裂揮擊')) {
                    activeBuilds.push('💥 爆裂揮擊');
                }
            } else if (explosionLevel === 2) {
                explosionDamage += 3;
            } else if (explosionLevel === 3) {
                explosionRadius += 8;
            }

            addFloatText(`💥 爆裂揮擊 Lv.${explosionLevel}`, 1.2);
            refreshBuildList();
            break;

        case 'shockwave':
            shockwaveUnlocked = true;

            if (!activeSkills.includes('🌊 衝擊震波')) {
                activeSkills.push('🌊 衝擊震波');
            }

            addFloatText('🌊 衝擊震波解鎖', 1.2);
            refreshSkillList();
            break;

        case 'orbit':
            orbitUnlocked = true;
            orbitLevel++;

            if (!activeSkills.includes('🔷 量子刃輪')) {
                activeSkills.push('🔷 量子刃輪');
            }

            addFloatText(`🔷 量子刃輪 Lv.${orbitLevel}`, 1.2);
            refreshSkillList();
            break;
    }

    upgradeEffectTimer = 0.7;
    isUpgradeActive = false;
    upgradeMenu.style.display = 'none';
    canvas.style.cursor = 'none';
    document.body.classList.add('game-playing');

    updateHUD();
}

function showRandomUpgradeCards() {
    const allCards = [
        upgradeSpeedButton,
        upgradeDamageButton,
        upgradeRangeButton,
        upgradeAttackSpeedButton,
        upgradeBloodRageButton,
        upgradeBloodStepButton,
        upgradeBoneBreakerButton,
        upgradeExplosionButton,
        upgradeExplosionPowerButton,
        upgradeStretchButton,
        upgradeShockwaveButton,
        upgradeOrbitButton
    ];

    const cards = [];

    if (damageLevel < TRAIT_MAX_LEVEL) {
        updateDamageCardUI();
        cards.push(upgradeDamageButton);
    }
    if (rangeLevel < TRAIT_MAX_LEVEL) {
        updateRangeCardUI();
        cards.push(upgradeRangeButton);
    }
    if (attackSpeedLevel < TRAIT_MAX_LEVEL) {
        updateAttackSpeedCardUI();
        cards.push(upgradeAttackSpeedButton);
    }

    if (
        speedLevel < TRAIT_MAX_LEVEL &&
        (speedLevel > 0 || player.speed < PLAYER_MAX_SPEED)
    ) {
        updateSpeedCardUI();
        cards.push(upgradeSpeedButton);
    }

    if (
        playerLevel >= 3 &&
        explosionLevel < TRAIT_MAX_LEVEL
    ) {
        updateExplosionCardUI();
        cards.push(upgradeExplosionButton);
    }

    const classSkillPool =
        CLASSES[playerClass]?.skillPool || [];

    // ================================
    // 職業技能抽卡池：
    // 依照技能解鎖狀態、等級、玩家等級等條件決定是否加入抽卡池
    //
    // 同時動態更新：
    // 卡片標題, 等級顯示, 技能描述
    // ================================
    for (const skillId of classSkillPool) {
        const skillUpgrade = SKILL_UPGRADE_MAP[skillId];

        if (!skillUpgrade) continue;
        if (skillId === 'stretch') continue;

        if (
            skillUpgrade.upgradeType === 'bloodRage' &&
            bloodRageLevel < bloodRageMaxLevel
        ) {
            updateBloodRageCardUI(skillUpgrade);
            cards.push(skillUpgrade.button);

        } else if (
            skillUpgrade.upgradeType === 'bloodStep' &&
            bloodStepLevel < bloodStepMaxLevel
        ) {
            updateBloodStepCardUI(skillUpgrade);
            cards.push(skillUpgrade.button);

        } else if (
            skillUpgrade.upgradeType === 'boneBreaker' &&
            (
                (!boneBreakerUnlocked && playerLevel >= 6) ||
                (boneBreakerUnlocked && playerLevel >= 12)
            ) &&
            boneBreakerLevel < boneBreakerMaxLevel
        ) {
            updateBoneBreakerCardUI(skillUpgrade);

            if (
                (
                    playerLevel === 6 &&
                    !boneBreakerUnlocked
                ) ||
                (
                    playerLevel === 12 &&
                    boneBreakerUnlocked &&
                    boneBreakerLevel === 1
                )
            ) {

                cards.unshift(skillUpgrade.button);

            } else {

                cards.push(skillUpgrade.button);
            }

        } else if (
            skillUpgrade.upgradeType === 'shockwave' &&
            playerLevel >= 1 &&
            !shockwaveUnlocked
        ) {
            cards.push(skillUpgrade.button);

        } else if (
            skillUpgrade.upgradeType === 'orbit' &&
            playerLevel >= 1 &&
            !orbitUnlocked
        ) {
            cards.push(skillUpgrade.button);
        }
    }

    allCards.forEach(card => {
        card.style.display = 'none';
    });

    const uniqueCards = [];

    for (const card of cards) {
        if (!uniqueCards.includes(card)) {
            uniqueCards.push(card);
        }
    }

    const selected = [];

    const guaranteedBoneBreaker =
        playerLevel === 6 &&
        !boneBreakerUnlocked &&
        uniqueCards.includes(upgradeBoneBreakerButton);

    const skillCards = uniqueCards.filter(card =>
        card === upgradeBloodStepButton ||
        card === upgradeBloodRageButton ||
        card === upgradeBoneBreakerButton
    );

    const traitCards = uniqueCards.filter(card =>
        card === upgradeSpeedButton ||
        card === upgradeDamageButton ||
        card === upgradeRangeButton ||
        card === upgradeAttackSpeedButton ||
        card === upgradeExplosionButton
    );

    if (guaranteedBoneBreaker) {
        selected.push(upgradeBoneBreakerButton);
    } else if (skillCards.length > 0) {
        selected.push(
            skillCards[
            Math.floor(Math.random() * skillCards.length)
            ]
        );
    }

    const remainingTraitCards =
        traitCards.filter(card => !selected.includes(card));

    const shuffled =
        remainingTraitCards.sort(() => Math.random() - 0.5);

    selected.push(
        ...shuffled.slice(0, 3 - selected.length)
    );

    selected.forEach(card => {
        card.style.display = 'block';
    });
}

function applyLevelUpStats() {
    if (!Number.isFinite(player.maxHealth)) player.maxHealth = PLAYER_BASE.maxHealth;
    if (!Number.isFinite(player.health)) player.health = player.maxHealth;

    player.maxHealth += 2;
    player.health = Math.min(player.maxHealth, player.health + 2);
    player.speed = Math.min(PLAYER_MAX_SPEED, player.speed + 1);
    stickDamage += 0.5;

    upgradeEffectTimer = 2.0;
    playLevelUpSound();
    //addFloatText(`⬆ Lv.${playerLevel}`, 1.2);
}

function levelUp() {

    playerExp -= playerNextExp;

    playerLevel++;

    applyLevelUpStats();

    playerNextExp =
        LEVEL_EXP_TABLE[playerLevel] ||
        Math.floor(playerNextExp * 1.25);

    const shouldUpgrade = true;

    if (shouldUpgrade) {

        isUpgradeActive = true;

        showRandomUpgradeCards();

        if (botMode) {

            applyBotUpgrade();

        } else {

            upgradeMenu.style.display = 'flex';

            canvas.style.cursor = 'auto';

            document.body.classList.remove('game-playing');
        }
    }

    updateHUD();
}


// 卡片顯示更新
function updateBloodRageCardUI(skillUpgrade) {
    const title = skillUpgrade.button.querySelector('.card-title');
    const desc = skillUpgrade.button.querySelector('.card-desc');
    const nextLevel = bloodRageLevel + 1;

    title.textContent =
        bloodRageUnlocked
            ? `血怒狂暴 Lv.${nextLevel}`
            : '🔓 血怒狂暴';

    desc.textContent =
        bloodRageUnlocked
            ? `持續 +${bloodRageDurationPerLevel.toFixed(1)}s｜冷卻 ${bloodRageCooldownByLevel[nextLevel].toFixed(1)}s`
            : '解鎖 E 鍵狂暴，大幅提升近戰壓制力';
}
function updateBloodStepCardUI(skillUpgrade) {
    const title = skillUpgrade.button.querySelector('.card-title');
    const desc = skillUpgrade.button.querySelector('.card-desc');
    const nextLevel = bloodStepLevel + 1;

    title.textContent =
        bloodStepUnlocked
            ? `血步突進 Lv.${nextLevel}`
            : '🔓 血步突進';

    desc.textContent =
        bloodStepUnlocked
            ? `冷卻 ${bloodStepCooldownByLevel[nextLevel].toFixed(1)}s`
            : '解鎖 SPACE 血步突進，可穿越怪群脫困';
}
function updateBoneBreakerCardUI(skillUpgrade) {

    const title = skillUpgrade.button.querySelector('.card-title');
    const desc = skillUpgrade.button.querySelector('.card-desc');
    const nextLevel = boneBreakerLevel + 1;

    title.textContent =
        boneBreakerUnlocked
            ? `裂骨重擊 Lv.${nextLevel}`
            : '🔓 裂骨重擊';

    desc.textContent =
        boneBreakerUnlocked
            ? `冷卻 ${boneBreakerCooldownByLevel[nextLevel].toFixed(1)}s`
            : '解鎖 R 鍵重擊，前方大範圍傷害與擊退';
}

function updateSpeedCardUI() {

    const title = upgradeSpeedButton.querySelector('.card-title');
    const desc = upgradeSpeedButton.querySelector('.card-desc');
    const nextLevel = speedLevel + 1;

    title.textContent = `👟 腎上腺素 Lv.${nextLevel}`;

    if (speedLevel === 0) {

        desc.textContent =
            '移動速度提升';

    } else if (speedLevel === 1) {

        desc.textContent =
            '受傷後短暫提升移動速度';

    } else {

        desc.textContent =
            '低血量時大幅提升移動速度。';
    }
}
function updateDamageCardUI() {

    const title = upgradeDamageButton.querySelector('.card-title');
    const desc = upgradeDamageButton.querySelector('.card-desc');
    const nextLevel = damageLevel + 1;

    title.textContent = `🗡️ 破顱打擊 Lv.${nextLevel}`;

    if (damageLevel === 0) {

        desc.textContent =
            '提升近戰攻擊傷害';

    } else if (damageLevel === 1) {

        desc.textContent =
            '對普通敵人造成額外重擊傷害';

    } else {

        desc.textContent =
            '攻擊更容易擊退與打斷敵人';
    }
}
function updateAttackSpeedCardUI() {

    const title = upgradeAttackSpeedButton.querySelector('.card-title');
    const desc = upgradeAttackSpeedButton.querySelector('.card-desc');
    const nextLevel = attackSpeedLevel + 1;

    title.textContent = `🥁 狂躁節奏 Lv.${nextLevel}`;

    if (attackSpeedLevel === 0) {

        desc.textContent =
            '提升近戰攻擊速度';

    } else if (attackSpeedLevel === 1) {

        desc.textContent =
            '更快揮擊與壓制敵人';

    } else {

        desc.textContent =
            '大幅提升連續攻擊節奏';
    }
}
function updateRangeCardUI() {

    const title = upgradeRangeButton.querySelector('.card-title');
    const desc = upgradeRangeButton.querySelector('.card-desc');
    const nextLevel = rangeLevel + 1;

    title.textContent = `📏 加長握柄 Lv.${nextLevel}`;

    if (rangeLevel === 0) {

        desc.textContent =
            '增加近戰攻擊距離';

    } else if (rangeLevel === 1) {

        desc.textContent =
            '進一步提升攻擊範圍';

    } else {

        desc.textContent =
            '更容易安全命中與掃怪';
    }
}
function updateExplosionCardUI() {

    const title = upgradeExplosionButton.querySelector('.card-title');
    const desc = upgradeExplosionButton.querySelector('.card-desc');
    const nextLevel = explosionLevel + 1;

    title.textContent = `💥 爆裂揮擊 Lv.${nextLevel}`;

    if (explosionLevel === 0) {

        desc.textContent =
            '近戰命中時產生爆炸';

    } else if (explosionLevel === 1) {

        desc.textContent =
            '提升爆炸傷害';

    } else {

        desc.textContent =
            '提升爆炸範圍';
    }
}

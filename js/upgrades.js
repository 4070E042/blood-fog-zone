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
    explosionSlash: {
        upgradeType: 'explosion',
        button: upgradeExplosionButton
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

const PLAYER_MAX_SPEED = 150;

upgradeSpeedButton.addEventListener('click', () => applyUpgrade('speed'));
upgradeDamageButton.addEventListener('click', () => applyUpgrade('damage'));
upgradeRangeButton.addEventListener('click', () => applyUpgrade('range'));
upgradeAttackSpeedButton.addEventListener('click', () => applyUpgrade('attackSpeed'));
upgradeBloodRageButton.addEventListener('click', () => applyUpgrade('bloodRage'));
upgradeBloodStepButton.addEventListener('click', () => applyUpgrade('bloodStep'));
upgradeBoneBreakerButton.addEventListener('click', () => applyUpgrade('boneBreaker'));
upgradeExplosionButton.addEventListener('click', () => applyUpgrade('explosion'));
upgradeExplosionPowerButton.addEventListener('click', () => applyUpgrade('explosionPower'));
upgradeStretchButton.addEventListener('click', () => applyUpgrade('stretch'));
upgradeShockwaveButton.addEventListener('click', () => applyUpgrade('shockwave'));
upgradeOrbitButton.addEventListener('click', () => applyUpgrade('orbit'));

function applyUpgrade(type) {
    if (!isUpgradeActive) return;

    if (type === 'speed') {
        if (speedLevel >= TRAIT_MAX_LEVEL) return;

        speedLevel++;
        player.speed = Math.min(player.speed + 5, PLAYER_MAX_SPEED);
        addFloatText(`⚡ 腎上腺素 Lv.${speedLevel}`);

    } else if (type === 'damage') {
        if (damageLevel >= TRAIT_MAX_LEVEL) return;

        damageLevel++;
        stickDamage += 2;
        addFloatText(`🗡️ 破顱打擊 Lv.${damageLevel}`);

    } else if (type === 'range') {
        if (rangeLevel >= TRAIT_MAX_LEVEL) return;

        rangeLevel++;
        stickRange += 10;
        addFloatText(`📏 加長握柄 Lv.${rangeLevel}`);

    } else if (type === 'attackSpeed') {
        if (attackSpeedLevel >= TRAIT_MAX_LEVEL) return;

        attackSpeedLevel++;
        baseAttackCooldownTime *= 0.9;
        updateAttackCooldownTime();
        addFloatText(`🥁 狂躁節奏 Lv.${attackSpeedLevel}`);

    } else if (type === 'bloodRage') {
        if (bloodRageLevel >= bloodRageMaxLevel) return;

        bloodRageUnlocked = true;
        bloodRageLevel++;

        if (!activeSkills.includes('血怒狂暴')) {
            activeSkills.push('血怒狂暴');
        }

        addFloatText(`血怒狂暴 Lv.${bloodRageLevel}`, 1.2);
        refreshSkillList();

    } else if (type === 'bloodStep') {
        if (bloodStepLevel >= bloodStepMaxLevel) return;

        bloodStepUnlocked = true;
        bloodStepLevel++;

        if (!activeSkills.includes('血步突進')) {
            activeSkills.push('血步突進');
        }

        addFloatText(`血步突進 Lv.${bloodStepLevel}`, 1.2);
        refreshSkillList();

    } else if (type === 'boneBreaker') {
        if (boneBreakerLevel >= boneBreakerMaxLevel) return;

        boneBreakerUnlocked = true;
        boneBreakerLevel++;

        if (!activeSkills.includes('裂骨重擊')) {
            activeSkills.push('裂骨重擊');
        }

        addFloatText(`裂骨重擊 Lv.${boneBreakerLevel}`, 1.2);
        refreshSkillList();

    } else if (type === 'stretch') {
        stretchUnlocked = true;
        stretchLevel++;

        if (!activeBuilds.includes('🪄 棍棒伸縮')) activeBuilds.push('🪄 棍棒伸縮');

        addFloatText('🪄 棍棒伸縮解鎖', 1.2);
        refreshSkillList();

    } else if (type === 'explosion') {
        explosionEnabled = true;
        explosionLevel = 1;

        if (!activeBuilds.includes('💥 爆裂揮擊')) activeBuilds.push('💥 爆裂揮擊');

        addFloatText('💥 爆裂揮擊解鎖', 1.2);
        refreshBuildList();

    } else if (type === 'explosionPower') {
        explosionLevel++;
        explosionDamage += 3;
        explosionRadius += 8;

        addFloatText('💥 爆炸強化');
        refreshBuildList();

    } else if (type === 'shockwave') {
        shockwaveUnlocked = true;

        if (!activeSkills.includes('🌊 衝擊震波')) activeSkills.push('🌊 衝擊震波');

        addFloatText('🌊 衝擊震波解鎖', 1.2);
        refreshSkillList();
    } else if (type === 'orbit') {

        orbitUnlocked = true;
        orbitLevel++;

        if (!activeSkills.includes('🔷 量子刃輪')) {
            activeSkills.push('🔷 量子刃輪');
        }

        addFloatText(`🔷 量子刃輪 Lv.${orbitLevel}`, 1.2);
        refreshSkillList();
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

    if (damageLevel < TRAIT_MAX_LEVEL) cards.push(upgradeDamageButton);
    if (rangeLevel < TRAIT_MAX_LEVEL) cards.push(upgradeRangeButton);
    if (attackSpeedLevel < TRAIT_MAX_LEVEL) cards.push(upgradeAttackSpeedButton);

    if (speedLevel < TRAIT_MAX_LEVEL && player.speed < PLAYER_MAX_SPEED) {
        cards.push(upgradeSpeedButton);
    }

    const classSkillPool =
        CLASSES[playerClass]?.skillPool || [];

    // ================================
    // 職業技能抽卡池
    // 依照技能解鎖狀態、等級、玩家等級等條件決定是否加入抽卡池
    //
    // 同時動態更新：
    // - 卡片標題
    // - 等級顯示
    // - 技能描述
    // ================================
    for (const skillId of classSkillPool) {
        const skillUpgrade = SKILL_UPGRADE_MAP[skillId];

        if (!skillUpgrade) continue;
        if (skillId === 'stretch') continue;

        if (
            skillUpgrade.upgradeType === 'bloodRage' &&
            bloodRageLevel < bloodRageMaxLevel
        ) {
            const title = skillUpgrade.button.querySelector('.card-title');
            const desc = skillUpgrade.button.querySelector('.card-desc');
            const nextLevel = bloodRageLevel + 1;

            title.textContent =
                bloodRageUnlocked
                    ? `血怒狂暴 Lv.${nextLevel}`
                    : '解鎖 血怒狂暴';

            desc.textContent =
                bloodRageUnlocked
                    ? `持續 +${bloodRageDurationPerLevel.toFixed(1)}s｜冷卻 ${bloodRageCooldownByLevel[nextLevel].toFixed(1)}s`
                    : '解鎖 E 鍵狂暴，大幅提升近戰壓制力';

            cards.push(skillUpgrade.button);

        } else if (
            skillUpgrade.upgradeType === 'bloodStep' &&
            bloodStepLevel < bloodStepMaxLevel
        ) {
            const title = skillUpgrade.button.querySelector('.card-title');
            const desc = skillUpgrade.button.querySelector('.card-desc');
            const nextLevel = bloodStepLevel + 1;

            title.textContent =
                bloodStepUnlocked
                    ? `血步突進 Lv.${nextLevel}`
                    : '解鎖 血步突進';

            desc.textContent =
                bloodStepUnlocked
                    ? `冷卻 ${bloodStepCooldownByLevel[nextLevel].toFixed(1)}s`
                    : '解鎖 SPACE 血步突進，可穿越怪群脫困';

            cards.push(skillUpgrade.button);

        } else if (
            skillUpgrade.upgradeType === 'boneBreaker' &&
            (
                (!boneBreakerUnlocked && playerLevel >= 6) ||
                (boneBreakerUnlocked && playerLevel >= 12)
            ) &&
            boneBreakerLevel < boneBreakerMaxLevel
        ) {
            const title = skillUpgrade.button.querySelector('.card-title');
            const desc = skillUpgrade.button.querySelector('.card-desc');
            const nextLevel = boneBreakerLevel + 1;

            title.textContent =
                boneBreakerUnlocked
                    ? `裂骨重擊 Lv.${nextLevel}`
                    : '解鎖 裂骨重擊';

            desc.textContent =
                boneBreakerUnlocked
                    ? `冷卻 ${boneBreakerCooldownByLevel[nextLevel].toFixed(1)}s`
                    : '解鎖 R 鍵重擊，前方大範圍傷害與擊退';

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
            skillUpgrade.upgradeType === 'explosion' &&
            playerLevel >= 3 &&
            !explosionEnabled
        ) {
            cards.push(skillUpgrade.button);

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

    if (
        classSkillPool.includes('explosionSlash') &&
        explosionEnabled
    ) {
        cards.push(upgradeExplosionPowerButton);
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
        card === upgradeAttackSpeedButton
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
    if (!Number.isFinite(player.maxHealth)) player.maxHealth = 100;
    if (!Number.isFinite(player.health)) player.health = player.maxHealth;

    player.maxHealth += 2;
    player.health = Math.min(player.maxHealth, player.health + 2);
    player.speed = Math.min(PLAYER_MAX_SPEED, player.speed + 1);
    stickDamage += 0.5;

    upgradeEffectTimer = 2.0;
    playLevelUpSound();
    //addFloatText(`⬆ Lv.${playerLevel}`, 1.2);
}

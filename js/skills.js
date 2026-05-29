// ================================
// 震波 Build 系統
// ================================
let shockwaveUnlocked = false;
let shockwaveCooldown = 0;

const shockwaveCooldownTime = 2;
const shockwaveRadius = 140;
const shockwaveDamage = 8;
const shockwaveKnockback = 220;
const shockwaveStunTime = 2;

// Stretch
let stretchUnlocked = false;
let stretchLevel = 0;
let stretchCooldown = 0;

const stretchCooldownTime = 2;
// ================================
// Blood Step（SPACE）
// ================================
let bloodStepUnlocked = false;
let bloodStepLevel = 0;
let bloodStepCooldownTimer = 0;

const bloodStepMaxLevel = 5;
const bloodStepCooldownByLevel = [0, 8.0, 6.8, 5.6, 4.8, 4.0];  // 各等級冷卻時間
const bloodStepDistance = 95;   // 固定突進距離

// ================================
// Blood Rage（E）
// ================================
const bloodRageAttackCooldownMultiplier = 0.7;  // 攻擊冷卻倍率（越小攻速越快）
const bloodRageRangeBonus = 20; // 額外攻擊範圍
const bloodRageHealOnKill = 2;  // 狂暴期間擊殺回血
const bloodExecutionMaxHealOnHit = 0.4; // 血性處決單次命中最大回血

// Blood Rage 啟動時的回血倍率
const bloodRageBloodExecutionHealMultiplier = 2;

// ================================
// Bone Breaker（R）
// ================================
let boneBreakerUnlocked = false;
let boneBreakerLevel = 0;
let boneBreakerCooldownTimer = 0;

// 前搖期間暫存施放資料
let boneBreakerWindupTimer = 0;
let boneBreakerPending = null;

const boneBreakerMaxLevel = 5;
const boneBreakerCooldownByLevel = [0, 10, 9, 8, 7, 6];

const boneBreakerWindupTime = 0.2;          // 前搖時間
const boneBreakerMoveMultiplier = 0.45;     // 前搖期間移動速度倍率
const boneBreakerRange = 125;               // 攻擊距離
const boneBreakerArc = Math.PI * 0.85;      // 扇形攻擊角度
const boneBreakerDamage = 32;               // 技能傷害
const boneBreakerKnockback = 120;           // 擊退距離
const boneBreakerStunTime = 1.0;            // 命中僵直時間

function updateAttackCooldownTime() {
    let cooldownTime = baseAttackCooldownTime;

    if (playerClass === 'executioner') {
        const executionRatio =
            bloodExecutionValue / bloodExecutionMax;

        cooldownTime *=
            1 - executionRatio * bloodExecutionAttackSpeedBonus;
    }

    if (bloodRageActive) {
        cooldownTime *= bloodRageAttackCooldownMultiplier;
    }

    attackCooldownTime = cooldownTime;
}

function addBloodExecutionValue(amount) {
    if (playerClass !== 'executioner') return;

    const wasFull = bloodExecutionValue >= bloodExecutionMax;

    bloodExecutionValue =
        Math.min(
            bloodExecutionMax,
            bloodExecutionValue + amount
        );

    if (
        !wasFull &&
        bloodExecutionValue >= bloodExecutionMax &&
        !bloodExecutionWasFull
    ) {
        bloodExecutionWasFull = true;
        addFloatText('血決滿溢', 0.8);
    }

    bloodExecutionCombatTimer = bloodExecutionCombatGrace;
    updateAttackCooldownTime();
}

function updateBloodExecution(dt) {
    if (playerClass !== 'executioner') {
        bloodExecutionWasFull = false;

        if (bloodExecutionValue > 0) {
            bloodExecutionValue = 0;
            bloodExecutionCombatTimer = 0;
            updateAttackCooldownTime();
        }

        return;
    }

    if (bloodExecutionValue < bloodExecutionMax) {
        bloodExecutionWasFull = false;
    }

    if (bloodExecutionCombatTimer > 0) {
        bloodExecutionCombatTimer =
            Math.max(0, bloodExecutionCombatTimer - dt);

        return;
    }

    if (bloodExecutionValue <= 0) return;

    bloodExecutionValue =
        Math.max(
            0,
            bloodExecutionValue - bloodExecutionDecayRate * dt
        );

    if (bloodExecutionValue < bloodExecutionMax) {
        bloodExecutionWasFull = false;
    }

    updateAttackCooldownTime();
}

function healFromBloodExecutionHit() {
    if (playerClass !== 'executioner') return;
    if (bloodExecutionValue < bloodExecutionMax) return;

    const beforeHealth = player.health;

    const executionRatio =
        bloodExecutionValue / bloodExecutionMax;

    const healAmount =
        executionRatio *
        bloodExecutionMaxHealOnHit *
        (bloodRageActive ? bloodRageBloodExecutionHealMultiplier : 1);

    if (healAmount <= 0) return;

    player.health =
        Math.min(
            player.maxHealth,
            player.health + healAmount
        );

    const healedAmount = player.health - beforeHealth;

    if (healedAmount <= 0) return;

    //playHealSound();

    floats.push({
        x: player.x,
        y: player.y - 34,
        vy: -42,
        life: 0.65,
        text: `+${Math.max(1, Math.round(healedAmount / bloodExecutionMaxHealOnHit))}`,
        color: bloodRageActive ? '255,150,150' : '120,255,150'
    });
}

// ================================
// 使用技能
// ================================
function activateBloodRage() {
    if (!bloodRageUnlocked) return;
    if (bloodRageActive) return;
    if (bloodRageCooldownTimer > 0) return;

    playBloodRageSound();
    bloodRageActive = true;
    bloodRageTimer = getBloodRageDuration();
    bloodRageCooldownTimer = 0;

    bloodRageBaseStickRange = stickRange;

    updateAttackCooldownTime();
    stickRange += bloodRageRangeBonus;

    screenShake = 8;

    impactEffects.push({
        x: player.x,
        y: player.y,
        life: 0.35,
        maxLife: 0.35,
        radius: 28,
        bloodRage: true
    });

    addFloatText('血性狂暴', 0.8);
}
function activateBloodStep() {
    // 使用條件
    if (!bloodStepUnlocked) return;
    if (bloodStepCooldownTimer > 0) return;
    if (player.isBound) return;

    playdashSound();

    const angle =
        Math.atan2(
            mouse.y - player.y,
            mouse.x - player.x
        );

    const startX = player.x;
    const startY = player.y;

    player.x += Math.cos(angle) * bloodStepDistance;
    player.y += Math.sin(angle) * bloodStepDistance;

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

    impactEffects.push({
        x: player.x,
        y: player.y,
        fromX: startX,
        fromY: startY,
        life: 0.18,
        maxLife: 0.18,
        radius: player.radius,
        bloodStep: true
    });

    bloodStepCooldownTimer = getBloodStepCooldown();
}

function activateBoneBreaker() {
    // 使用條件
    if (!boneBreakerUnlocked) return;
    if (boneBreakerCooldownTimer > 0) return;
    if (boneBreakerPending) return;
    if (player.isBound) return;

    playHeavyCleaveSound();
    const baseAngle =
        Math.atan2(
            mouse.y - player.y,
            mouse.x - player.x
        );

    boneBreakerPending = {
        x: player.x,
        y: player.y,
        angle: baseAngle
    };

    boneBreakerWindupTimer = boneBreakerWindupTime;
    boneBreakerCooldownTimer = getBoneBreakerCooldown();

    impactEffects.push({
        x: boneBreakerPending.x,
        y: boneBreakerPending.y,
        angle: boneBreakerPending.angle,
        range: boneBreakerRange,
        arc: boneBreakerArc,
        life: boneBreakerWindupTime,
        maxLife: boneBreakerWindupTime,
        boneBreaker: true,
        preview: true
    });

    addFloatText('裂骨重擊', 0.8);
}
function resolveBoneBreaker() {
    if (!boneBreakerPending) return;

    const originX = boneBreakerPending.x;
    const originY = boneBreakerPending.y;
    const baseAngle = boneBreakerPending.angle;

    let hitCount = 0;

    for (const en of enemies) {
        if (en.hp <= 0) continue;

        if (
            en.type === 'burrower' &&
            (
                en.burrowState === 'burrowing' ||
                en.burrowState === 'emerging'
            )
        ) continue;

        const dx = en.x - originX;
        const dy = en.y - originY;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist > boneBreakerRange + en.radius) continue;

        const enemyAngle = Math.atan2(dy, dx);
        const angleDiff =
            Math.atan2(
                Math.sin(enemyAngle - baseAngle),
                Math.cos(enemyAngle - baseAngle)
            );

        if (Math.abs(angleDiff) > boneBreakerArc / 2) continue;

        playHeavyDamageSound();
        en.hp -= boneBreakerDamage;
        en.hitTimer = 0.16;

        if (en.type !== 'boss') {
            // 暈眩敵人
            en.stunTimer = Math.max(en.stunTimer || 0, boneBreakerStunTime);
        }

        if (en.type !== 'boss') {
            // 計算擊退位移
            const nx = dx / dist;
            const ny = dy / dist;

            en.x += nx * boneBreakerKnockback;
            en.y += ny * boneBreakerKnockback;

            en.x =
                Math.max(
                    en.radius,
                    Math.min(canvas.width - en.radius, en.x)
                );

            en.y =
                Math.max(
                    en.radius,
                    Math.min(canvas.height - en.radius, en.y)
                );
        }


        if (en.type === 'screamer') {

            const screamerBase = ENEMY_BASE.screamer;

            en.fleeTimer = screamerBase.fleeTime;

            if (en.isScreaming) {
                en.isScreaming = false;
                en.screamTimer = screamerBase.screamChargeTime;
                en.screamCooldown = screamerBase.screamCooldown;
            }
        }

        floats.push({
            x: en.x,
            y: en.y - en.radius - 10,
            vy: -40,
            life: 0.8,
            text: `裂骨-${boneBreakerDamage}`
        });

        healFromBloodExecutionHit();
        addBloodExecutionValue(bloodExecutionGainOnHit);

        hitCount++;
    }

    screenShake = hitCount > 0 ? 10 : 5;

    impactEffects.push({
        x: originX,
        y: originY,
        angle: baseAngle,
        range: boneBreakerRange,
        arc: boneBreakerArc,
        life: 0.18,
        maxLife: 0.18,
        boneBreaker: true
    });

    boneBreakerPending = null;
    boneBreakerWindupTimer = 0;
}

function getBloodStepCooldown() {
    return bloodStepCooldownByLevel[bloodStepLevel] ||
        bloodStepCooldownByLevel[bloodStepMaxLevel];
}
function getBoneBreakerCooldown() {
    return boneBreakerCooldownByLevel[boneBreakerLevel] ||
        boneBreakerCooldownByLevel[boneBreakerMaxLevel];
}
function getBloodRageDuration() {
    return bloodRageDuration +
        Math.max(0, bloodRageLevel - 1) * bloodRageDurationPerLevel;
}
function getBloodRageCooldown() {
    return bloodRageCooldownByLevel[bloodRageLevel] ||
        bloodRageCooldownByLevel[bloodRageMaxLevel];
}

function endBloodRage() {
    if (!bloodRageActive) return;

    bloodRageActive = false;
    bloodRageTimer = 0;

    stickRange = bloodRageBaseStickRange;

    bloodRageCooldownTimer = getBloodRageCooldown();
    updateAttackCooldownTime();
}

function healFromBloodRageKill() {
    if (!bloodRageActive) return;

    const beforeHealth = player.health;

    player.health =
        Math.min(
            player.maxHealth,
            player.health + bloodRageHealOnKill
        );

    const healedAmount = player.health - beforeHealth;

    if (healedAmount <= 0) return;

    floats.push({
        x: player.x,
        y: player.y - 28,
        vy: -45,
        life: 0.65,
        text: `+${Math.floor(healedAmount)} HP`
    });
}

function updateSkillCooldowns(dt) {
    updateBloodExecution(dt);

    if (bloodRageActive) {
        bloodRageTimer = Math.max(0, bloodRageTimer - dt);

        if (bloodRageTimer <= 0) {
            endBloodRage();
        }
    }

    if (bloodRageCooldownTimer > 0) {
        bloodRageCooldownTimer = Math.max(0, bloodRageCooldownTimer - dt);
    }

    if (bloodStepCooldownTimer > 0) {
        bloodStepCooldownTimer = Math.max(0, bloodStepCooldownTimer - dt);
    }

    if (boneBreakerCooldownTimer > 0) {
        boneBreakerCooldownTimer = Math.max(0, boneBreakerCooldownTimer - dt);
    }

    if (boneBreakerWindupTimer > 0) {
        boneBreakerWindupTimer = Math.max(0, boneBreakerWindupTimer - dt);

        if (boneBreakerWindupTimer <= 0) {
            resolveBoneBreaker();
        }
    }

    if (shockwaveCooldown > 0) {
        shockwaveCooldown = Math.max(0, shockwaveCooldown - dt);
    }

    if (stretchCooldown > 0) {
        stretchCooldown = Math.max(0, stretchCooldown - dt);
    }
}

function drawSkillCooldowns() {
    if (
        stretchUnlocked &&
        stretchCooldown > 0
    ) {

        const ratio =
            1 - (stretchCooldown / stretchCooldownTime);

        const barWidth = 42;
        const barHeight = 5;

        const barX =
            player.x - barWidth / 2;

        const barY =
            player.y + 36;

        ctx.fillStyle =
            'rgba(0,0,0,0.5)';

        ctx.fillRect(
            barX,
            barY,
            barWidth,
            barHeight
        );

        ctx.fillStyle = '#80d8ff';

        ctx.fillRect(
            barX + 1,
            barY + 1,
            (barWidth - 2) * ratio,
            barHeight - 2
        );
    }
}

// ================================
// 旋轉棍棒更新
// ================================
function updateOrbitSkill(dt) {

    if (!orbitUnlocked || orbitLevel <= 0) return;

    orbitAngle += orbitRotateSpeed * dt;


    // ================================
    // 棍棒數量
    // Lv.1 = 1 根
    // Lv.2+ = 2 根
    // ================================
    const orbitCount =
        orbitLevel >= 2 ? 2 : 1;


    // ================================
    // 每根旋轉棍棒
    // ================================
    for (let i = 0; i < orbitCount; i++) {

        const angle =
            orbitAngle +
            (Math.PI * 2 / orbitCount) * i;

        const orbitX =
            player.x +
            Math.cos(angle) * orbitRadius;

        const orbitY =
            player.y +
            Math.sin(angle) * orbitRadius;


        // ================================
        // 攻擊敵人
        // ================================
        for (const en of enemies) {

            if (en.hp <= 0) continue;

            const dist =
                Math.hypot(
                    orbitX - en.x,
                    orbitY - en.y
                );

            const hitRange =
                en.radius + 12;

            if (dist <= hitRange) {

                // 防止每幀狂扣血
                if (!en.orbitHitTimer) {
                    en.orbitHitTimer = 0;
                }

                if (en.orbitHitTimer > 0) continue;

                en.orbitHitTimer = 0.35;

                en.hp -= orbitDamage;

                en.hitTimer = 0.08;
            }
        }
    }


    // ================================
    // Orbit Hit Timer
    // ================================
    for (const en of enemies) {

        if (!en.orbitHitTimer) continue;

        en.orbitHitTimer =
            Math.max(
                0,
                en.orbitHitTimer - dt
            );
    }
}

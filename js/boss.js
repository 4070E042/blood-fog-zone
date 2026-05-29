// ================================
// Boss 登場
// ================================
function updateBossIntro(dt) {
    if (!bossIntroActive) return false;

    bossIntroTimer = Math.max(0, bossIntroTimer - dt);
    screenShake = Math.max(screenShake, 3);

    if (bossIntroTimer <= 0) {
        finishBossIntro();
        playBossBGM();
    }

    updateHUD();
    return true;
}
function finishBossIntro() {
    bossIntroActive = false;
    bossFightStarted = true;
    bossFightStartTime = survivalTime;
    bossClearTime = null;
    bossFightDuration = 0;
    bossHealthBarVisible = true;
    bossHealthBarAnim = 0;

    screenShake = Math.max(screenShake, 16);

    player.health = player.maxHealth;

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].type !== 'boss') {
            addCorpseEffect(enemies[i], 18.0);

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

// ================================
// Boss UI State
// ================================
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


// ================================
// Boss Basic Attack
// ================================
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


// ================================
// Boss Slam
// ================================
function startBossSlam(en) {
    en.bossSkillState = 'slamWindup';
    en.bossSkillTimer = bossSlamWindupTime;
    en.bossSkillAngle = Math.atan2(player.y - en.y, player.x - en.x);
    bossHeavySwingSound();
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

        playHeavyHurtSound();

        player.knockbackX = (dx / dist) * 220;
        player.knockbackY = (dy / dist) * 220;
    }
}

// ================================
// Boss Charge
// ================================
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


// ================================
// Boss Behavior
// ================================

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
        bossFrenzyAlertTimer = 2.2;
        screenShake = Math.max(screenShake, 22);

        bossFrenzyPulseEffects.push({
            x: en.x,
            y: en.y,
            radius: en.radius,
            timer: 0.9,
            duration: 0.9
        });
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

    const playerMovingAway = playerMoveDir.x * nx + playerMoveDir.y * ny > 0.35;

    // 玩家進入重擊範圍且技能 CD 完成時，開始巨斧重擊前搖
    if (
        dist <= bossSlamRange + player.radius + 10 &&
        en.bossSlamCooldown <= 0
    ) {
        startBossSlam(en);
        return;
    }

    // 玩家正在拉開距離、位於中距離時，使用衝鋒踐踏逼位
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
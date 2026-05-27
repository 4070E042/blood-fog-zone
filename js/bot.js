function updateBotControl() {

    let dx = 0;
    let dy = 0;

    let nearest = null;
    let nearestDist = Infinity;
    let nearbyCount = 0;
    let nearbyX = 0;
    let nearbyY = 0;
    let leaperPrepDanger = false;
    let bossTarget = null;
    let bossDist = Infinity;

    // ================================
    // 尋找最近敵人
    // ================================
    for (const en of enemies) {

        if (
            en.type === 'burrower' &&
            en.burrowState === 'burrowing'
        ) continue;

        const d = Math.hypot(player.x - en.x, player.y - en.y);

        if (d < 180) {
            nearbyCount++;
            nearbyX += en.x;
            nearbyY += en.y;
        }

        if (
            en.type === 'leaper' &&
            en.preLeapTimer > 0
        ) {
            leaperPrepDanger = true;
        }

        if (
            en.type === 'boss' &&
            d < bossDist
        ) {
            bossDist = d;
            bossTarget = en;
        }

        if (d < nearestDist) {
            nearestDist = d;
            nearest = en;
        }
    }


    // ================================
    // 低血量時尋找補包
    // ================================
    let targetHealthPack = null;

    if (player.health <= 45) {

        let nearestHpDist = Infinity;

        for (const hp of healthPacks) {

            const d = Math.hypot(player.x - hp.x, player.y - hp.y);

            if (d < nearestHpDist) {
                nearestHpDist = d;
                targetHealthPack = hp;
            }
        }
    }


    // ================================
    // 優先行為：低血量撿補包
    // ================================
    if (targetHealthPack) {

        const hpDx = targetHealthPack.x - player.x;
        const hpDy = targetHealthPack.y - player.y;
        const hpLen = Math.hypot(hpDx, hpDy) || 1;

        let moveX = hpDx / hpLen;
        let moveY = hpDy / hpLen;

        // 撿補包時，如果附近有怪，混入逃跑方向
        if (nearest && nearestDist < 140) {

            const awayX = player.x - nearest.x;
            const awayY = player.y - nearest.y;
            const awayLen = Math.hypot(awayX, awayY) || 1;

            moveX = moveX * 0.45 + (awayX / awayLen) * 0.55;
            moveY = moveY * 0.45 + (awayY / awayLen) * 0.55;
        }

        const moveLen = Math.hypot(moveX, moveY) || 1;

        dx = moveX / moveLen;
        dy = moveY / moveLen;

    } else if (nearest) {

        const awayX = player.x - nearest.x;
        const awayY = player.y - nearest.y;
        const len = Math.hypot(awayX, awayY) || 1;

        const attackDistance = player.radius + stickRange + 10;
        const dangerDistance = player.radius + 35;


        // ================================
        // 危險判斷：普通怪紅色攻擊預警
        // ================================
        let attackWarningDanger = false;

        if (nearest.attackState === 'attacking') {

            const attackRange =
                player.radius +
                nearest.radius +
                enemyAttackRangeOffset +
                18;

            if (nearestDist <= attackRange) {
                attackWarningDanger = true;
            }
        }


        // ================================
        // 危險判斷：Burrower 地裂預警
        // ================================
        let burrowDanger = false;

        if (
            nearest.type === 'burrower' &&
            nearest.quakeWarning
        ) {

            const quakeDist = Math.hypot(player.x - nearest.x, player.y - nearest.y);
            const dangerRange = player.radius + stickRange + 25;

            if (quakeDist <= dangerRange) {
                burrowDanger = true;
            }
        }


        // ================================
        // 行為決策
        // ================================

        // Leaper 預備撲擊時，優先橫向閃避
        let bossDanger = false;
        let bossSlamDanger = false;
        let bossChargeDanger = false;
        let bossBasicDanger = false;
        let bossChargePathDanger = false;
        let bossSafeToAttack = true;
        let bossMoveX = 0;
        let bossMoveY = 0;

        if (bossTarget) {
            const bossDx = player.x - bossTarget.x;
            const bossDy = player.y - bossTarget.y;
            const bossLen = Math.hypot(bossDx, bossDy) || 1;
            const bossNx = bossDx / bossLen;
            const bossNy = bossDy / bossLen;
            const bossState = bossTarget.bossSkillState || 'idle';

            bossSlamDanger = bossState === 'slamWindup';
            bossChargeDanger =
                bossState === 'chargeWindup' ||
                bossState === 'charging';
            bossBasicDanger = bossState === 'basicWindup';

            if (bossChargeDanger) {
                const chargeDirX =
                    bossTarget.bossChargeDirX ||
                    Math.cos(bossTarget.bossSkillAngle || 0);
                const chargeDirY =
                    bossTarget.bossChargeDirY ||
                    Math.sin(bossTarget.bossSkillAngle || 0);
                const ahead =
                    bossDx * chargeDirX + bossDy * chargeDirY;
                const side =
                    Math.abs(bossDx * -chargeDirY + bossDy * chargeDirX);
                const chargeLength =
                    Math.min(canvas.width, canvas.height) *
                    bossChargeDistanceRatio;

                bossChargePathDanger =
                    ahead > -30 &&
                    ahead < chargeLength + 80 &&
                    side < bossTarget.radius + player.radius + 55;

                const sideSign =
                    bossDx * -chargeDirY + bossDy * chargeDirX >= 0
                        ? 1
                        : -1;

                bossMoveX = -chargeDirY * sideSign;
                bossMoveY = chargeDirX * sideSign;
            } else if (bossSlamDanger || bossBasicDanger) {
                const sideSign =
                    bossDx * -bossNy + bossDy * bossNx >= 0
                        ? 1
                        : -1;

                bossMoveX =
                    (-bossNy * sideSign) * 0.75 +
                    bossNx * 0.45;
                bossMoveY =
                    (bossNx * sideSign) * 0.75 +
                    bossNy * 0.45;
            } else if (bossTarget.bossFrenzied && bossDist < 230) {
                bossMoveX = bossNx;
                bossMoveY = bossNy;
            }

            bossDanger =
                bossSlamDanger ||
                bossChargeDanger ||
                bossBasicDanger;

            bossSafeToAttack =
                !bossDanger &&
                (
                    !bossTarget.bossFrenzied ||
                    bossDist > 105 ||
                    player.health > 60
                );
        }

        const tooClose =
            nearestDist < player.radius + nearest.radius + 18;

        const bossStepDanger =
            bossTarget &&
            (
                (
                    bossSlamDanger &&
                    bossDist < bossSlamRange + player.radius + 10
                ) ||
                (
                    bossBasicDanger &&
                    bossDist < bossTarget.radius + bossBasicAttackRange + player.radius
                ) ||
                bossChargePathDanger ||
                (
                    bossTarget.bossFrenzied &&
                    bossDist < 95
                )
            );

        const shouldBloodStep =
            (
                player.health <= 35 &&
                nearestDist < 160
            ) ||
            tooClose ||
            burrowDanger ||
            attackWarningDanger ||
            bossStepDanger;

        if (
            shouldBloodStep &&
            bloodStepUnlocked &&
            bloodStepCooldownTimer <= 0
        ) {
            if (bossStepDanger && bossTarget) {
                const stepLen = Math.hypot(bossMoveX, bossMoveY) || 1;

                mouse.x = player.x + (bossMoveX / stepLen) * 220;
                mouse.y = player.y + (bossMoveY / stepLen) * 220;
            } else {
                mouse.x = player.x + (awayX / len) * 200;
                mouse.y = player.y + (awayY / len) * 200;
            }

            activateBloodStep();
        }

        const shouldBloodRage =
            !bossDanger &&
            player.health > 45 &&
            (
                nearbyCount >= 4 ||
                (
                    nearest.type === 'boss' &&
                    nearestDist < 180
                ) ||
                (
                    player.health <= 55 &&
                    nearbyCount >= 2
                )
            );

        if (
            shouldBloodRage &&
            bloodRageUnlocked &&
            !bloodRageActive &&
            bloodRageCooldownTimer <= 0
        ) {
            activateBloodRage();
        }

        const bossInBoneBreakerRange =
            bossTarget &&
            bossDist <= boneBreakerRange + bossTarget.radius + 60;

        const shouldBoneBreaker =
            !shouldBloodStep &&
            !leaperPrepDanger &&
            bossSafeToAttack &&
            (
                nearestDist <= boneBreakerRange + nearest.radius ||
                nearbyCount >= 4 ||
                bossInBoneBreakerRange
            );

        if (
            shouldBoneBreaker &&
            boneBreakerUnlocked &&
            boneBreakerCooldownTimer <= 0 &&
            !boneBreakerPending
        ) {
            if (bossInBoneBreakerRange) {
                mouse.x = bossTarget.x;
                mouse.y = bossTarget.y;
            } else if (nearbyCount >= 4) {
                mouse.x = nearbyX / nearbyCount;
                mouse.y = nearbyY / nearbyCount;
            } else {
                mouse.x = nearest.x;
                mouse.y = nearest.y;
            }

            activateBoneBreaker();
        }

        if (
            bossTarget &&
            bossDanger &&
            (
                nearest.type === 'boss' ||
                bossDist < 260
            )
        ) {
            const bossMoveLen = Math.hypot(bossMoveX, bossMoveY) || 1;

            dx = bossMoveX / bossMoveLen;
            dy = bossMoveY / bossMoveLen;

        } else if (
            bossTarget &&
            bossTarget.bossFrenzied &&
            nearest.type === 'boss' &&
            bossDist < player.radius + stickRange + 95
        ) {
            dx = awayX / len;
            dy = awayY / len;

        } else if (
            nearest.type === 'leaper' &&
            nearest.preLeapTimer > 0
        ) {

            dx = -awayY / len;
            dy = awayX / len;

        } else if (
            nearestDist < dangerDistance ||
            burrowDanger ||
            attackWarningDanger
        ) {

            // 紅色攻擊預警 / 地裂預警 / 太近時，優先後退
            dx = awayX / len;
            dy = awayY / len;

        } else if (nearestDist > attackDistance) {

            // 太遠時接近敵人，保持攻擊距離
            dx = -awayX / len;
            dy = -awayY / len;

        } else {

            // 距離剛好時繞圈，避免站樁
            dx = -awayY / len;
            dy = awayX / len;


            // ================================
            // 靠牆時往中心修正
            // ================================
            const wallMargin = 80;

            if (
                player.x < wallMargin ||
                player.x > canvas.width - wallMargin ||
                player.y < wallMargin ||
                player.y > canvas.height - wallMargin
            ) {

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                const toCenterX = centerX - player.x;
                const toCenterY = centerY - player.y;
                const centerLen = Math.hypot(toCenterX, toCenterY) || 1;

                dx += (toCenterX / centerLen) * 0.5;
                dy += (toCenterY / centerLen) * 0.5;
            }
        }


        // ================================
        // 自動瞄準最近敵人
        // ================================
        mouse.x = nearest.x;
        mouse.y = nearest.y;


        // ================================
        // 自動攻擊
        // Leaper 預備撲擊時先不攻擊，優先閃避
        // ================================
        if (
            !isSwinging &&
            attackCooldown <= 0 &&
            nearestDist <= player.radius + stickRange + 35 &&
            !(nearest.type === 'leaper' && nearest.preLeapTimer > 0) &&
            (
                nearest.type !== 'boss' ||
                bossSafeToAttack
            )
        ) {

            isSwinging = true;
            swingProgress = 0;

            swingHitSet.clear();

            attackCooldown = attackCooldownTime;
        }
    }

    return {
        dx,
        dy
    };
}

function applyBotUpgrade() {

    if (!botMode) return;

    const choices = [];

    // 基礎屬性
    if (attackSpeedLevel < TRAIT_MAX_LEVEL) {
        choices.push('attackSpeed');
    }

    if (damageLevel < TRAIT_MAX_LEVEL) {
        choices.push('damage');
    }

    if (
        speedLevel < TRAIT_MAX_LEVEL &&
        player.speed < PLAYER_MAX_SPEED
    ) {
        choices.push('speed');
    }

    // SPACE｜血步
    if (bloodStepLevel < bloodStepMaxLevel) {
        choices.push('bloodStep');
    }

    // E｜血怒
    if (bloodRageLevel < bloodRageMaxLevel) {
        choices.push('bloodRage');
    }

    // R｜裂骨重擊
    // 6 等後可解鎖，12 等後才可升級
    if (
        boneBreakerLevel < boneBreakerMaxLevel &&
        (
            (!boneBreakerUnlocked && playerLevel >= 6) ||
            (boneBreakerUnlocked && playerLevel >= 12)
        )
    ) {
        choices.push('boneBreaker');
    }

    if (choices.length <= 0) {
        return;
    }

    const pick =
        choices[Math.floor(Math.random() * choices.length)];

    applyUpgrade(pick);
}

function drawBotLabel() {

    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';

    // 外框
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';

    ctx.strokeText(
        'BOT',
        player.x,
        player.y - player.radius - 10
    );

    // 主文字
    ctx.fillStyle = '#80d8ff';

    ctx.fillText(
        'BOT',
        player.x,
        player.y - player.radius - 10
    );
}

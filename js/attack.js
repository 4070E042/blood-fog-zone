


// ================================
// Attack 更新
// ================================
function updateAttack(dt) {

    // 揮擊進度
    if (isSwinging) {
        swingProgress += dt / swingDuration;
        if (swingProgress >= 1) {
            isSwinging = false;
            swingProgress = 0;
            swingHitSet.clear();
        }
    }

    // 攻擊冷卻處理
    if (attackCooldown > 0) {
        attackCooldown = Math.max(0, attackCooldown - dt);
    }
}

function handleAutoAttack() {
    if (
        autoAttackMode &&
        !isSwinging &&
        attackCooldown <= 0
    ) {
        isSwinging = true;
        swingProgress = 0;

        swingHitSet.clear();

        attackCooldown = attackCooldownTime;
    }
}

function handleAttackHits() {

    if (!isSwinging) return;

    const baseAngle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    const offset = -swingArc / 2 + swingArc * swingProgress;
    const angle = baseAngle + offset;
    const stickLen = stickRange;
    const x1 = player.x + Math.cos(angle) * player.radius;
    const y1 = player.y + Math.sin(angle) * player.radius;
    const x2 = player.x + Math.cos(angle) * (player.radius + stickLen);
    const y2 = player.y + Math.sin(angle) * (player.radius + stickLen);

    const vx = x2 - x1, vy = y2 - y1;

    for (const en of enemies) {
        if (en.hp <= 0) continue;

        if (
            en.type === 'burrower' &&
            (
                en.burrowState === 'burrowing' ||
                en.burrowState === 'emerging'
            )
        ) continue;

        if (swingHitSet.has(en.id)) continue;

        const wx = en.x - x1, wy = en.y - y1;
        const c1 = vx * wx + vy * wy;
        const c2 = vx * vx + vy * vy;
        let t = c1 / c2;
        t = Math.max(0, Math.min(1, t));
        const px = x1 + vx * t, py = y1 + vy * t;
        const dist = Math.hypot(px - en.x, py - en.y);
        if (dist <= en.radius + 6) {
            // hit
            swingHitSet.add(en.id);
            en.hitTimer = 0.12;
            en.hp -= stickDamage;

            // ================================
            // 破顱打擊額外效果
            // Lv2：非 Boss 額外傷害
            // Lv3：非 Boss 僵直與擊退
            // ================================
            if (en.type !== 'boss' && damageLevel >= 2) {
                en.hp -= 2;
            }

            if (en.type !== 'boss' && damageLevel >= 3) {
                const pushX = en.x - player.x;
                const pushY = en.y - player.y;
                const pushLen = Math.hypot(pushX, pushY) || 1;

                en.stunTimer = Math.max(en.stunTimer || 0, 0.18);
                en.x += (pushX / pushLen) * 32;
                en.y += (pushY / pushLen) * 32;

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

                en.fleeTimer = SCREAMER.fleeTime;

                if (en.isScreaming) {
                    en.isScreaming = false;
                    en.screamTimer = SCREAMER.screamChargeTime;;
                    en.screamCooldown = SCREAMER.screamCooldown;

                    floats.push({
                        x: en.x,
                        y: en.y - en.radius - 24,
                        vy: -45,
                        life: 0.8,
                        text: '打斷!'
                    });
                }
            }

            // 顯示攻擊傷害
            //floats.push({ x: en.x, y: en.y - en.radius - 6, vy: -40, life: 0.8, text: `-${stickDamage}` });

            healFromBloodExecutionHit();
            addBloodExecutionValue(bloodExecutionGainOnHit);

            playHitSound();
        }
    }
}


function drawAttackCooldown() {
    const cooldownRatio = 1 - attackCooldown / attackCooldownTime;

    if (attackCooldown > 0) {
        const barWidth = 34;
        const barHeight = 5;

        const barX = player.x - barWidth / 2;
        const barY = player.y + 26;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(
            barX + 1,
            barY + 1,
            (barWidth - 2) * cooldownRatio,
            barHeight - 2
        );
    }
}

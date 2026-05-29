function drawBossSkillWarning(en) {
    if (
        en.bossSkillState !== 'basicWindup' &&
        en.bossSkillState !== 'slamWindup' &&
        en.bossSkillState !== 'chargeWindup'
    ) return;

    ctx.save();

    if (en.bossSkillState === 'slamWindup') {
        const progress =
            1 - Math.max(0, en.bossSkillTimer) / bossSlamWindupTime;
        const warningArc = bossSlamArc * 1.22;

        ctx.globalAlpha = 0.24 + progress * 0.28;
        ctx.fillStyle = 'rgba(70, 0, 8, 0.58)';
        ctx.strokeStyle = 'rgba(120, 0, 18, 0.82)';
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(en.x, en.y);
        ctx.arc(
            en.x,
            en.y,
            bossSlamRange,
            en.bossSkillAngle - warningArc / 2,
            en.bossSkillAngle + warningArc / 2
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    if (en.bossSkillState === 'basicWindup') {
        const progress =
            1 - Math.max(0, en.bossBasicAttackTimer) / bossBasicAttackWindupTime;
        const range = en.radius + bossBasicAttackRange;
        const arc = Math.PI * 0.72;

        ctx.globalAlpha = 0.16 + progress * 0.28;
        ctx.fillStyle = 'rgba(90, 0, 10, 0.42)';
        ctx.strokeStyle = 'rgba(180, 20, 28, 0.62)';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(en.x, en.y);
        ctx.arc(
            en.x,
            en.y,
            range,
            en.bossBasicAttackAngle - arc / 2,
            en.bossBasicAttackAngle + arc / 2
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    if (en.bossSkillState === 'chargeWindup') {
        const progress =
            1 - Math.max(0, en.bossSkillTimer) / bossChargeWindupTime;
        const length =
            Math.min(canvas.width, canvas.height) * bossChargeDistanceRatio;
        const width = en.radius * 1.35;

        ctx.translate(en.x, en.y);
        ctx.rotate(en.bossSkillAngle);
        ctx.globalAlpha = 0.18 + progress * 0.32;
        ctx.fillStyle = 'rgba(160, 0, 16, 0.42)';
        ctx.strokeStyle = 'rgba(255, 55, 60, 0.7)';
        ctx.lineWidth = 3;
        ctx.fillRect(0, -width / 2, length, width);
        ctx.strokeRect(0, -width / 2, length, width);
    }

    ctx.restore();
}

function drawEnemies() {
    for (const en of enemies) {

        if (en.attackState === 'attacking') {

            const angle =
                Math.atan2(
                    player.y - en.y,
                    player.x - en.x
                );

            const range =
                player.radius +
                en.radius +
                enemyAttackRangeOffset;

            const arcSize =
                Math.PI / 2.2;

            const chargeProgress =
                1 - (en.attackTimer / en.attackWindup);

            const alpha =
                0.12 + chargeProgress * 0.45;

            ctx.beginPath();

            ctx.moveTo(en.x, en.y);

            ctx.arc(
                en.x,
                en.y,
                range,
                angle - arcSize / 2,
                angle + arcSize / 2
            );

            ctx.closePath();

            ctx.fillStyle =
                `rgba(255,80,80,${alpha})`;

            ctx.fill();

            ctx.strokeStyle =
                `rgba(255,140,140,${0.4 + chargeProgress * 0.6})`;

            ctx.lineWidth = 3;

            ctx.stroke();
        }

        // ================================
        // Burrower｜鑽地預警
        // ================================
        if (en.type === 'burrower' && en.burrowState === 'burrowing') {


            if (en.burrowTimer <= 0.55) {

                burrowAudio.pause();
                burrowAudio.currentTime = 0;


                // 警告圈
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 60, 60, 0.18)';
                ctx.arc(en.emergeX, en.emergeY, en.bindRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 80, 80, 0.7)';
                ctx.lineWidth = 2;
                ctx.stroke();

                const pulse = Math.sin(performance.now() * 0.02) * 8;

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 120, 120, 0.35)';
                ctx.lineWidth = 3;

                ctx.arc(
                    en.emergeX,
                    en.emergeY,
                    en.bindRadius + pulse,
                    0,
                    Math.PI * 2
                );

                ctx.stroke();
            }

            continue;
        }

        // ================================
        // Burrower｜震地預警圈
        // ================================
        if (
            en.type === 'burrower' &&
            en.quakeWarning
        ) {

            const quakeRange = player.radius + stickRange + 14;

            ctx.beginPath();

            ctx.fillStyle =
                'rgba(180, 120, 255, 0.10)';

            ctx.arc(
                en.x,
                en.y,
                quakeRange,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.strokeStyle =
                'rgba(220, 160, 255, 0.8)';

            ctx.lineWidth = 4;

            ctx.stroke();

            const pulse =
                Math.sin(performance.now() * 0.02) * 5;

            ctx.beginPath();

            ctx.strokeStyle =
                'rgba(220, 160, 255, 0.35)';

            ctx.lineWidth = 5;

            ctx.arc(
                en.x,
                en.y,
                quakeRange + pulse,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }

        // ================================
        // Burrower｜震地衝擊波
        // ================================
        if (
            en.type === 'burrower' &&
            en.quakeEffectTimer > 0
        ) {

            const progress =
                1 - (en.quakeEffectTimer / 0.25);

            ctx.beginPath();

            ctx.strokeStyle =
                `rgba(220,160,255,${1 - progress})`;

            ctx.lineWidth = 8;

            ctx.arc(
                en.x,
                en.y,
                30 + progress * 90,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }

        // ================================
        // Burrower｜鑽地蓄力動畫
        // ================================
        if (
            en.type === 'burrower' &&
            en.burrowState === 'preparingBurrow'
        ) {

            const squash =
                Math.sin(performance.now() * 0.03) * 2;

            ctx.save();

            ctx.translate(en.x, en.y);

            ctx.scale(1.15, 0.8);

            ctx.beginPath();

            ctx.fillStyle = '#8e44ad';

            ctx.arc(
                0,
                squash,
                en.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

            // 周圍土塊粒子
            for (let p = 0; p < 7; p++) {

                const angle =
                    Math.random() * Math.PI * 2;

                const dist =
                    en.radius *
                    (0.7 + Math.random() * 0.8);

                const size =
                    1 + Math.random() * 3;

                const shake =
                    Math.sin(performance.now() * 0.02 + p) * 2;

                const px =
                    Math.cos(angle) * dist + shake;

                const py =
                    Math.sin(angle) * dist;

                ctx.beginPath();

                ctx.fillStyle =
                    'rgba(90, 70, 50, 0.75)';

                ctx.arc(
                    px,
                    py,
                    size,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.restore();

            continue;
        }

        if (en.type === 'leaper' && en.preLeapTimer > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 60, 60, 0.18)';
            ctx.lineWidth = player.radius + en.radius + 24;
            ctx.lineCap = 'round';

            ctx.moveTo(en.x, en.y);
            ctx.lineTo(en.leapTargetX, en.leapTargetY);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 80, 80, 0.65)';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';

            ctx.moveTo(en.x, en.y);
            ctx.lineTo(en.leapTargetX, en.leapTargetY);
            ctx.stroke();
        }

        // ================================
        // Screamer｜遠距警戒光圈
        // ================================
        if (
            en.type === 'screamer' &&
            en.isAlerted &&
            !en.isScreaming
        ) {

            const pulse =
                Math.sin(performance.now() * 0.01) * 6;

            ctx.beginPath();

            ctx.strokeStyle =
                'rgba(255,180,80,0.25)';

            ctx.lineWidth = 3;

            ctx.arc(
                en.x,
                en.y,
                en.radius + 12 + pulse,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        // ================================
        // Screamer｜尖叫蓄力範圍
        // ================================
        if (en.type === 'screamer' && en.isScreaming) {

            const progress =
                1 - en.screamTimer / 1.0;

            // 尖叫影響範圍
            ctx.beginPath();

            ctx.fillStyle =
                `rgba(255, 140, 60, ${0.12 + progress * 0.18})`;

            ctx.arc(
                en.x,
                en.y,
                70 + progress * 45,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.beginPath();

            ctx.strokeStyle =
                `rgba(255, 220, 120, ${1 - progress * 0.4})`;

            ctx.lineWidth = 5;

            ctx.arc(
                en.x,
                en.y,
                70 + progress * 45,
                0,
                Math.PI * 2
            );

            ctx.stroke();

            // 尖叫讀條
            const barWidth = 46;
            const barHeight = 6;

            const barX =
                en.x - barWidth / 2;

            const barY =
                en.y - en.radius - 24;

            const chargeRatio =
                1 - en.screamTimer / 1.0;

            ctx.fillStyle =
                'rgba(0,0,0,0.65)';

            ctx.fillRect(
                barX,
                barY,
                barWidth,
                barHeight
            );

            ctx.fillStyle = '#ffcc66';

            ctx.fillRect(
                barX + 1,
                barY + 1,
                (barWidth - 2) * chargeRatio,
                barHeight - 2
            );

            ctx.strokeStyle =
                'rgba(255,255,255,0.6)';

            ctx.lineWidth = 1;

            ctx.strokeRect(
                barX,
                barY,
                barWidth,
                barHeight
            );
        }

        // ================================
        // 狀態效果｜Shockwave 暈眩提示
        // ================================
        if (en.stunTimer > 0) {

            const pulse =
                Math.sin(performance.now() * 0.02) * 4;

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(120,220,255,0.75)';
            ctx.lineWidth = 3;
            ctx.arc(
                en.x,
                en.y,
                en.radius + 8 + pulse,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(180,240,255,0.9)';
            ctx.fillText('暈', en.x, en.y - en.radius - 18);
        }

        // 暈眩光圈
        ctx.beginPath();

        if (en.type === 'boss') {
            drawBossSkillWarning(en);

            ctx.save();

            ctx.translate(en.x, en.y);

            const bossAngle =
                Math.atan2(
                    player.y - en.y,
                    player.x - en.x
                );

            ctx.rotate(bossAngle);

            const bossHit = en.hitTimer > 0;

            if (en.bossFrenzied) {
                ctx.save();
                ctx.rotate(-bossAngle);

                const pulse =
                    Math.sin(performance.now() * 0.012) * 0.08;

                ctx.beginPath();
                ctx.fillStyle = `rgba(150, 0, 18, ${0.10 + pulse})`;
                ctx.arc(0, 0, en.radius * 2.05, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(95, 0, 12, 0.45)';
                ctx.lineWidth = 4;
                ctx.arc(
                    0,
                    0,
                    en.radius * (2.25 + Math.abs(pulse) * 2.5),
                    0,
                    Math.PI * 2
                );
                ctx.stroke();

                ctx.restore();
            }

            ctx.save();
            ctx.rotate(-bossAngle);
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.ellipse(
                0,
                en.radius * 0.72,
                en.radius * 1.45,
                en.radius * 0.42,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();

            // 手臂｜畫在身體後面
            ctx.strokeStyle = bossHit ? '#7a1111' : '#2a0707';
            ctx.lineWidth = 13;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(-en.radius * 0.75, en.radius * 0.18);
            ctx.lineTo(-en.radius * 1.2, en.radius * 0.5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(en.radius * 0.75, en.radius * 0.18);
            ctx.lineTo(en.radius * 1.2, en.radius * 0.5);
            ctx.stroke();

            ctx.fillStyle = bossHit ? '#8f1818' : '#3a0b0b';

            ctx.beginPath();
            ctx.arc(
                -en.radius * 1.27,
                en.radius * 0.53,
                en.radius * 0.24,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
                en.radius * 1.27,
                en.radius * 0.53,
                en.radius * 0.24,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // 身體
            ctx.beginPath();

            ctx.fillStyle = bossHit ? '#9a2525' : '#5f1f1f';

            ctx.ellipse(
                0,
                0,
                en.radius * 1.25,
                en.radius * 1.15,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.strokeStyle = bossHit ? '#5c0505' : '#220000';
            ctx.lineWidth = 5;
            ctx.stroke();

            // 肩膀
            ctx.fillStyle = bossHit ? '#7a1919' : '#4a1414';

            ctx.beginPath();

            ctx.arc(
                -en.radius * 0.95,
                -en.radius * 0.15,
                en.radius * 0.48,
                0,
                Math.PI * 2
            );

            ctx.arc(
                en.radius * 0.95,
                -en.radius * 0.15,
                en.radius * 0.48,
                0,
                Math.PI * 2
            );

            ctx.fill();

            // 傷疤
            ctx.strokeStyle = '#2a0505';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(-en.radius * 0.42, -en.radius * 0.45);
            ctx.lineTo(en.radius * 0.18, en.radius * 0.08);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(en.radius * 0.38, -en.radius * 0.2);
            ctx.lineTo(-en.radius * 0.1, en.radius * 0.34);
            ctx.stroke();

            // 單眼
            ctx.beginPath();

            ctx.fillStyle = '#090000';

            ctx.arc(
                0,
                -en.radius * 0.15,
                13,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.beginPath();

            ctx.fillStyle = bossHit ? '#ff4a4a' : '#ff2222';

            ctx.arc(
                0,
                -en.radius * 0.15,
                9,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();

            if (isPracticeMode) {
                drawEnemyHealthBar(en);
            }

            continue;
        } else if (en.hitTimer > 0) {
            ctx.fillStyle = '#ff6666';
        } else if (en.type === 'burrower') {
            ctx.fillStyle = '#8e44ad';
        } else if (en.type === 'screamer') {
            if (en.isScreaming) {

                ctx.fillStyle = '#fff2a8';

            } else if (en.isAlerted) {

                const pulse =
                    Math.sin(performance.now() * 0.012) * 25;

                ctx.fillStyle =
                    `rgb(255, ${170 + pulse}, 90)`;

            } else {

                ctx.fillStyle = '#ff8844';
            }
        } else if (en.type === 'leaper') {
            ctx.fillStyle = '#bb4444';
        } else {
            ctx.fillStyle = '#999999';
        }
        ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();


        drawEnemyHealthBar(en);
    }

}
function drawEnemyHealthBar(en) {
    const barWidth = en.radius * 2;
    const barHeight = 6;

    const ratio =
        Math.max(0, Math.min(1, en.hp / en.maxHp));

    const barX =
        en.x - barWidth / 2;

    const barY =
        en.y - en.radius - 12;

    const canOneShot =
        en.hp <= stickDamage;

    ctx.fillStyle = '#333';

    ctx.fillRect(
        barX,
        barY,
        barWidth,
        barHeight
    );

    ctx.fillStyle =
        canOneShot
            ? '#fff59d'
            : '#76ff03';

    ctx.fillRect(
        barX + 1,
        barY + 1,
        Math.max(0, barWidth - 2) * ratio,
        barHeight - 2
    );

    if (showEnemyHpText) {
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';

        ctx.strokeText(
            `${Math.ceil(en.hp)} / ${en.maxHp}`,
            en.x,
            barY + barHeight / 2
        );

        ctx.fillStyle = '#ffffff';

        ctx.fillText(
            `${Math.ceil(en.hp)} / ${en.maxHp}`,
            en.x,
            barY + barHeight / 2
        );
    }
}
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

function applyScreenShake() {
    if (screenShake > 0) {

        const shakeX =
            (Math.random() - 0.5) * screenShake;

        const shakeY =
            (Math.random() - 0.5) * screenShake;

        ctx.translate(shakeX, shakeY);

        screenShake *= 0.85;
    }
}

function drawHealthPacks() {

    for (const hp of healthPacks) {
        const alpha = Math.min(1, hp.life / 2);

        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.fillStyle = '#4dd0e1';
        ctx.arc(hp.x, hp.y, hp.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(hp.x - 5, hp.y);
        ctx.lineTo(hp.x + 5, hp.y);
        ctx.moveTo(hp.x, hp.y - 5);
        ctx.lineTo(hp.x, hp.y + 5);
        ctx.stroke();

        ctx.globalAlpha = 1;
    }
}
function drawLowHealthOverlay() {
    if (gameStarted && !isGameOver && player.health < 30) {
        const intensity = Math.min(0.18, (30 - player.health) / 30 * 0.18);
        ctx.fillStyle = `rgba(255, 50, 50, ${intensity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
function updateHealthPackSpawn(dt) {
    healthPackTimer += dt;

    if (survivalTime >= 90 && healthPackTimer >= healthPackInterval) {
        healthPackTimer = 0;

        healthPacks.push({
            x: 40 + Math.random() * (canvas.width - 80),
            y: 40 + Math.random() * (canvas.height - 80),
            radius: 12,
            life: 8
        });
    }
}
function updateHealthPacks(dt) {
    for (let i = healthPacks.length - 1; i >= 0; i--) {
        const hp = healthPacks[i];

        hp.life -= dt;

        if (hp.life <= 0) {
            healthPacks.splice(i, 1);
            continue;
        }

        const dist = Math.hypot(player.x - hp.x, player.y - hp.y);

        if (dist <= player.radius + hp.radius) {
            const beforeHealth = player.health;

            player.health = Math.min(player.maxHealth, player.health + 25);

            const healedAmount = player.health - beforeHealth;
            playHealSound();

            floats.push({
                x: player.x,
                y: player.y - 28,
                vy: -45,
                life: 0.8,
                text: `+${healedAmount} HP`
            });

            player.hurtTimer = 0;

            healthPacks.splice(i, 1);
        }
    }
}

function drawAttack() {

    const baseAngle = Math.atan2(
        mouse.y - player.y,
        mouse.x - player.x
    );

    const stickLen = stickRange;
    let angle = baseAngle;

    if (isSwinging) {
        const offset = -swingArc / 2 + swingArc * swingProgress;
        angle = baseAngle + offset;
    }

    if (isSwinging) {
        const arcRadius = player.radius + stickRange;
        const startAngle = baseAngle - swingArc / 2;
        const endAngle = baseAngle - swingArc / 2 + swingArc * swingProgress;

        ctx.beginPath();

        const arcAlpha = Math.min(
            0.75,
            0.35 + (stickRange - 40) * 0.003
        );

        ctx.strokeStyle = `rgba(255,220,120,${arcAlpha})`;
        ctx.lineWidth = 12 + (stickRange - 40) * 0.08;
        ctx.lineCap = 'round';

        ctx.arc(player.x, player.y, arcRadius, startAngle, endAngle);
        ctx.stroke();
    }

    const sx = player.x + Math.cos(angle) * player.radius;
    const sy = player.y + Math.sin(angle) * player.radius;
    const ex = player.x + Math.cos(angle) * (player.radius + stickLen);
    const ey = player.y + Math.sin(angle) * (player.radius + stickLen);

    if (playerClass === 'executioner') {
        ctx.save();

        const hammerEndX = ex;
        const hammerEndY = ey;

        // 鐵鎚柄
        ctx.strokeStyle = isSwinging ? '#5c3923' : '#3e2618';
        ctx.lineWidth = 8 + (stickRange - 40) * 0.02;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(hammerEndX, hammerEndY);
        ctx.stroke();

        // 柄高光
        ctx.strokeStyle = isSwinging ? '#b9783f' : '#7c4f2a';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(hammerEndX, hammerEndY);
        ctx.stroke();

        ctx.translate(hammerEndX, hammerEndY);
        ctx.rotate(angle);

        // 鎚頭主體
        ctx.fillStyle = isSwinging ? '#707982' : '#50575e';
        ctx.strokeStyle = '#171a1d';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(-8, -12, 18, 24, 4);
        ctx.fill();
        ctx.stroke();

        // 前端重擊面
        ctx.fillStyle = isSwinging ? '#8d98a3' : '#636c75';

        ctx.beginPath();
        ctx.roundRect(6, -9, 7, 18, 3);
        ctx.fill();

        // 金屬高光
        ctx.strokeStyle = isSwinging ? '#ffd27a' : '#b7c0c7';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-3, -7);
        ctx.lineTo(6, -7);

        ctx.moveTo(-3, 7);
        ctx.lineTo(6, 7);

        ctx.stroke();

        // 血鏽感
        ctx.strokeStyle = '#7f241f';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(1, -3);
        ctx.lineTo(6, 0);

        ctx.moveTo(2, 5);
        ctx.lineTo(7, 2);

        ctx.stroke();

        ctx.restore();
        return;
    }

    ctx.strokeStyle = isSwinging ? '#ffcc66' : '#ccaa66';
    ctx.lineWidth = 6 + (stickRange - 40) * 0.03;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}
function drawAimCursor() {

    if (
        !gameStarted ||
        isPaused ||
        isUpgradeActive ||
        isGameOver
    ) {
        return;
    }

    ctx.save();

    ctx.beginPath();

    ctx.strokeStyle =
        'rgba(120, 220, 255, 0.85)';

    ctx.lineWidth = 2;

    ctx.arc(
        mouse.x,
        mouse.y,
        9,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.strokeStyle =
        'rgba(120, 220, 255, 0.35)';

    ctx.lineWidth = 4;

    ctx.arc(
        mouse.x,
        mouse.y,
        16,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.fillStyle =
        'rgba(255, 255, 255, 0.9)';

    ctx.arc(
        mouse.x,
        mouse.y,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();
    drawOrbitSkill();

    ctx.restore();
}

function drawPlayer() {
    // draw player
    ctx.save();
    if (player.hurtTimer > 0) {
        const shake = Math.sin(player.hurtTimer * 60) * 2;
        ctx.translate(shake, 0);
    }

    if (player.slowTimer > 0) {

        const slowAlpha =
            Math.min(0.35, player.slowTimer * 0.25);

        ctx.beginPath();

        ctx.fillStyle =
            `rgba(180, 120, 255, ${slowAlpha})`;

        ctx.arc(
            player.x,
            player.y,
            player.radius + 10,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.strokeStyle =
            `rgba(220, 180, 255, ${slowAlpha})`;

        ctx.lineWidth = 3;

        ctx.arc(
            player.x,
            player.y,
            player.radius + 14,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }

    if (bloodRageActive) {
        const pulse =
            4 + Math.sin(performance.now() * 0.018) * 3;

        ctx.globalCompositeOperation = 'lighter';

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 40, 70, 0.14)';
        ctx.arc(
            player.x,
            player.y,
            player.radius + 20 + pulse,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 90, 110, 0.55)';
        ctx.lineWidth = 3;
        ctx.arc(
            player.x,
            player.y,
            player.radius + 15 + pulse,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';
    }

    if (speedLevel >= 2 && player.hurtTimer > 0) {
        const boostAlpha =
            Math.min(0.45, 0.18 + player.hurtTimer * 0.8);
        const pulse =
            2 + Math.sin(performance.now() * 0.035) * 2;

        ctx.globalCompositeOperation = 'lighter';

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 95, 80, ${boostAlpha})`;
        ctx.lineWidth = 2;
        ctx.arc(
            player.x,
            player.y,
            player.radius + 12 + pulse,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        if (playerMoveDir.x !== 0 || playerMoveDir.y !== 0) {
            ctx.strokeStyle = `rgba(255, 170, 130, ${boostAlpha})`;
            ctx.lineWidth = 3;

            for (let i = -1; i <= 1; i++) {
                const sideX = -playerMoveDir.y * i * 7;
                const sideY = playerMoveDir.x * i * 7;
                const startX = player.x - playerMoveDir.x * 8 + sideX;
                const startY = player.y - playerMoveDir.y * 8 + sideY;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(
                    startX - playerMoveDir.x * 18,
                    startY - playerMoveDir.y * 18
                );
                ctx.stroke();
            }
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    if (
        playerClass === 'executioner' &&
        bloodExecutionValue >= bloodExecutionMax
    ) {
        const pulse =
            2 + Math.sin(performance.now() * 0.02) * 3;

        ctx.globalCompositeOperation = 'lighter';

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 25, 60, 0.10)';
        ctx.arc(
            player.x,
            player.y,
            player.radius + 14 + pulse,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 60, 85, 0.65)';
        ctx.lineWidth = 3;
        ctx.arc(
            player.x,
            player.y,
            player.radius + 18 + pulse,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';
    }

    ctx.fillStyle = player.hurtTimer > 0 ? '#ff4444' : '#4caf50';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Bot 標記
    if (botMode) {
        drawBotLabel();
    }


    // overlay hurt tint if damaged
    if (player.hurtTimer > 0) {
        ctx.fillStyle = 'rgba(255,0,0,0.28)';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// ================================
// Orbit Skill
// 繪製量子刃輪
// ================================
function drawOrbitSkill() {
    if (!orbitUnlocked || orbitLevel <= 0) return;

    const orbitCount = orbitLevel >= 2 ? 2 : 1;

    for (let i = 0; i < orbitCount; i++) {
        const angle = orbitAngle + (Math.PI * 2 / orbitCount) * i;
        const orbitX = player.x + Math.cos(angle) * orbitRadius;
        const orbitY = player.y + Math.sin(angle) * orbitRadius;

        ctx.save();
        ctx.translate(orbitX, orbitY);
        ctx.rotate(angle + Math.PI / 2);

        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(120,220,255,0.9)';

        ctx.beginPath();
        ctx.fillStyle = 'rgba(120,220,255,0.85)';
        ctx.moveTo(0, -26);
        ctx.lineTo(9, 8);
        ctx.lineTo(0, 18);
        ctx.lineTo(-9, 8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, -20);
        ctx.lineTo(0, 14);
        ctx.stroke();

        ctx.restore();
    }
}




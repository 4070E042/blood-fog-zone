// ================================
// 爆炸 Build 系統
// ================================



// 效果
const impactEffects = [];
const deathEffects = [];

const groundCracks = [];


function addFloatText(text, life = 1) {
    floats.push({
        x: player.x,
        y: player.y - 45,
        vy: -30,
        life: life,
        text: text
    });
}

function drawGameBackground() {
    const time = performance.now() * 0.001;
    const boss =
        enemies.find(en => en.type === 'boss' && en.hp > 0);
    const bossAtmosphere =
        bossIntroActive || bossFightStarted;
    const bossFrenzy =
        boss && boss.bossFrenzied;
    const timePressure =
        Math.min(1, Math.max(0, survivalTime) / BOSS_BASE.spawnTime);
    const phasePressure =
        Math.min(1, Math.max(0, currentThreatPhase) / 4);
    const pressure =
        isPracticeMode
            ? 0
            : Math.max(timePressure * 0.65, phasePressure * 0.75);
    const bossBoost =
        bossAtmosphere ? 1 : 0;
    const frenzyBoost =
        bossFrenzy ? 1 : 0;
    const baseColor =
        isPracticeMode
            ? '#202123'
            : '#181719';
    const topHazeAlpha =
        isPracticeMode
            ? 0.025
            : 0.025 + pressure * 0.055 + bossBoost * 0.075 + frenzyBoost * 0.03;
    const lowHazeAlpha =
        isPracticeMode
            ? 0.02
            : 0.018 + pressure * 0.05 + bossBoost * 0.07 + frenzyBoost * 0.03;
    const gridAlpha =
        isPracticeMode
            ? 0.025
            : 0.018 + pressure * 0.02 + bossBoost * 0.01;
    const vignetteAlpha =
        isPracticeMode
            ? 0.14
            : 0.14 + pressure * 0.08 + bossBoost * 0.08 + frenzyBoost * 0.03;

    ctx.save();

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let haze = ctx.createRadialGradient(
        canvas.width * 0.48,
        canvas.height * 0.18,
        0,
        canvas.width * 0.48,
        canvas.height * 0.18,
        canvas.width * 0.58
    );
    haze.addColorStop(0, `rgba(120, 0, 22, ${topHazeAlpha})`);
    haze.addColorStop(1, 'rgba(120, 0, 22, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    haze = ctx.createRadialGradient(
        canvas.width * (0.2 + Math.sin(time * 0.18) * 0.03),
        canvas.height * 0.72,
        0,
        canvas.width * 0.2,
        canvas.height * 0.72,
        canvas.width * 0.42
    );
    haze.addColorStop(0, `rgba(95, 0, 18, ${lowHazeAlpha})`);
    haze.addColorStop(1, 'rgba(95, 0, 18, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle =
        isPracticeMode
            ? `rgba(160, 170, 180, ${gridAlpha})`
            : `rgba(255, 70, 90, ${gridAlpha})`;
    ctx.lineWidth = 1;

    for (let y = 0; y <= canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    for (let x = 0; x <= canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    const vignette = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.45,
        canvas.width * 0.16,
        canvas.width * 0.5,
        canvas.height * 0.45,
        canvas.width * 0.68
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, `rgba(0, 0, 0, ${vignetteAlpha})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

function drawGroundCracks() {
    for (let i = groundCracks.length - 1; i >= 0; i--) {

        const crack = groundCracks[i];

        const alpha =
            crack.life / crack.maxLife;

        const progress =
            1 - alpha;

        // 主裂圈
        ctx.beginPath();

        ctx.strokeStyle =
            `rgba(120,220,255,${alpha * 0.55})`;

        ctx.lineWidth = 5;

        ctx.arc(
            crack.x,
            crack.y,
            crack.radius * 0.45 + progress * 70,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        // 裂紋線
        for (let s = 0; s < 10; s++) {

            const angle =
                (Math.PI * 2 / 10) * s;

            const inner =
                30 + progress * 25;

            const outer =
                crack.radius * 0.55 + progress * 60;

            const x1 =
                crack.x + Math.cos(angle) * inner;

            const y1 =
                crack.y + Math.sin(angle) * inner;

            const x2 =
                crack.x + Math.cos(angle) * outer;

            const y2 =
                crack.y + Math.sin(angle) * outer;

            ctx.beginPath();

            ctx.strokeStyle =
                `rgba(180,240,255,${alpha * 0.22})`;

            ctx.lineWidth = 2;

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            ctx.stroke();
        }

        crack.life -= 0.016;

        if (crack.life <= 0) {
            groundCracks.splice(i, 1);
        }
    }
}

function drawExplosions() {
    for (const ex of explosions) {

        const progress =
            1 - ex.life / ex.maxLife;

        const alpha =
            ex.life / ex.maxLife;

        const radius = Math.max(20, ex.radius * progress);

        ctx.globalCompositeOperation = 'lighter';

        // 外圈光暈
        ctx.beginPath();

        ctx.fillStyle =
            `rgba(255,120,40,${alpha * 0.22})`;

        ctx.arc(
            ex.x,
            ex.y,
            radius + 18,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // 主爆炸
        ctx.beginPath();

        ctx.fillStyle =
            `rgba(255,180,60,${alpha * 0.45})`;

        ctx.arc(
            ex.x,
            ex.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // 爆炸描邊
        ctx.beginPath();

        ctx.strokeStyle =
            `rgba(255,240,160,${alpha})`;

        ctx.lineWidth = 6;

        ctx.arc(
            ex.x,
            ex.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';
    }
}

function drawImpactEffects() {
    for (let i = impactEffects.length - 1; i >= 0; i--) {

        const fx = impactEffects[i];

        const progress =
            1 - fx.life / fx.maxLife;

        const alpha =
            fx.life / fx.maxLife;

        if (fx.bloodRage) {

            ctx.globalCompositeOperation = 'lighter';

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,40,70,${alpha})`;
            ctx.lineWidth = 10;
            ctx.arc(
                fx.x,
                fx.y,
                fx.radius + progress * 80,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = `rgba(255,40,70,${alpha * 0.18})`;
            ctx.arc(
                fx.x,
                fx.y,
                fx.radius + progress * 55,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.globalCompositeOperation = 'source-over';

        } else if (fx.bloodStep) {

            ctx.globalCompositeOperation = 'lighter';

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,60,100,${alpha * 0.75})`;
            ctx.lineWidth = 9;
            ctx.lineCap = 'round';
            ctx.moveTo(fx.fromX, fx.fromY);
            ctx.lineTo(fx.x, fx.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,230,235,${alpha})`;
            ctx.lineWidth = 3;
            ctx.arc(
                fx.x,
                fx.y,
                fx.radius + progress * 18,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            ctx.globalCompositeOperation = 'source-over';

        } else if (fx.shockwave) {

            ctx.globalCompositeOperation = 'lighter';

            // 外圈震波
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120,220,255,${alpha})`;
            ctx.lineWidth = 12;
            ctx.arc(
                fx.x,
                fx.y,
                fx.radius + progress * 120,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            // 內圈白光
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.8})`;
            ctx.lineWidth = 5;
            ctx.arc(
                fx.x,
                fx.y,
                fx.radius * 0.6 + progress * 80,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            // 中心光暈
            ctx.beginPath();
            ctx.fillStyle = `rgba(120,220,255,${alpha * 0.12})`;
            ctx.arc(
                fx.x,
                fx.y,
                35 + progress * 40,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.globalCompositeOperation = 'source-over';

        } else if (fx.boneBreaker) {

            const startAngle = fx.angle - fx.arc / 2;
            const endAngle = fx.angle + fx.arc / 2;
            const hitLineLength =
                fx.range * (0.55 + progress * 0.45);
            const fillAlpha =
                fx.preview ? 0.08 : alpha * 0.16;
            const edgeAlpha =
                fx.preview ? 0.35 : alpha * 0.85;
            const lineAlpha =
                fx.preview ? 0.25 : alpha * 0.7;

            ctx.globalCompositeOperation = 'lighter';

            ctx.beginPath();
            ctx.moveTo(fx.x, fx.y);
            ctx.arc(
                fx.x,
                fx.y,
                fx.range,
                startAngle,
                endAngle
            );
            ctx.closePath();
            ctx.fillStyle = `rgba(255,210,90,${fillAlpha})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
                fx.x,
                fx.y,
                fx.range,
                startAngle,
                endAngle
            );
            ctx.strokeStyle = `rgba(255,245,180,${edgeAlpha})`;
            ctx.lineWidth = fx.preview ? 4 : 8;
            ctx.lineCap = 'round';
            ctx.stroke();

            if (!fx.preview) {
                const impactAngles = [
                    startAngle,
                    fx.angle,
                    endAngle
                ];

                for (const angle of impactAngles) {
                    const inner = fx.range * 0.22;
                    const outer = hitLineLength;

                    ctx.beginPath();
                    ctx.moveTo(
                        fx.x + Math.cos(angle) * inner,
                        fx.y + Math.sin(angle) * inner
                    );
                    ctx.lineTo(
                        fx.x + Math.cos(angle) * outer,
                        fx.y + Math.sin(angle) * outer
                    );
                    ctx.strokeStyle = `rgba(255,235,160,${lineAlpha})`;
                    ctx.lineWidth = angle === fx.angle ? 6 : 3;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }

            ctx.globalCompositeOperation = 'source-over';

        } else {

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,220,120,${alpha})`;
            ctx.lineWidth = 6;
            ctx.arc(
                fx.x,
                fx.y,
                fx.radius + progress * 35,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }

        fx.life -= 0.016;

        if (fx.life <= 0) {
            impactEffects.splice(i, 1);
        }
    }
}

function drawDeathEffects() {
    for (const effect of deathEffects) {
        const progress = 1 - effect.life / effect.maxLife;
        const alpha = Math.max(0, effect.life / effect.maxLife);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 220, 120, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.arc(effect.x, effect.y, effect.radius + progress * 26, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawUpgradeEffect() {

    if (upgradeEffectTimer > 0) {

        const effectDuration = 2;

        const progress =
            1 - (upgradeEffectTimer / effectDuration);

        const alpha =
            upgradeEffectTimer / effectDuration;

        ctx.save();

        ctx.globalCompositeOperation = 'lighter';

        // 升等光柱
        const beamHeight =
            220 + progress * 80;

        const beamWidth =
            55 - progress * 15;

        const gradient =
            ctx.createLinearGradient(
                player.x,
                player.y - beamHeight,
                player.x,
                player.y + beamHeight
            );

        gradient.addColorStop(0, `rgba(255,255,255,0)`);
        gradient.addColorStop(0.5, `rgba(255,230,160,${alpha * 0.32})`);
        gradient.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.fillStyle = gradient;

        ctx.fillRect(
            player.x - beamWidth / 2,
            player.y - beamHeight,
            beamWidth,
            beamHeight * 2
        );

        // 外圈升等光環
        ctx.beginPath();

        ctx.strokeStyle =
            `rgba(255,220,120,${alpha})`;

        ctx.lineWidth =
            9 - progress * 5;

        ctx.arc(
            player.x,
            player.y,
            player.radius + 22 + progress * 95,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        // 第二層白色光圈
        ctx.beginPath();

        ctx.strokeStyle =
            `rgba(255,255,255,${alpha * 0.75})`;

        ctx.lineWidth = 4;

        ctx.arc(
            player.x,
            player.y,
            player.radius + 10 + progress * 50,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        // 中心升等爆光
        ctx.beginPath();

        ctx.fillStyle =
            `rgba(255,240,180,${alpha * 0.25})`;

        ctx.arc(
            player.x,
            player.y,
            player.radius + 15 + progress * 24,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // 上升光點
        for (let i = 0; i < 8; i++) {

            const angle =
                (Math.PI * 2 / 8) * i;

            const distance =
                18 + progress * 45;

            const particleX =
                player.x + Math.cos(angle) * distance;

            const particleY =
                player.y + Math.sin(angle) * distance - progress * 55;

            ctx.beginPath();

            ctx.fillStyle =
                `rgba(255,245,190,${alpha})`;

            ctx.arc(
                particleX,
                particleY,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        // 十字閃光
        const flashSize =
            20 + progress * 35;

        ctx.strokeStyle =
            `rgba(255,255,255,${alpha})`;

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(player.x - flashSize, player.y);
        ctx.lineTo(player.x + flashSize, player.y);

        ctx.moveTo(player.x, player.y - flashSize);
        ctx.lineTo(player.x, player.y + flashSize);

        ctx.stroke();

        ctx.restore();
    }
}

function drawFloatingTexts() {

    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    ctx.restore();
    for (const f of floats) {
        const alpha = Math.max(0, f.life / 0.8);

        if (f.text.includes('COMBO')) {

            ctx.font = '24px sans-serif';

        } else {

            ctx.font = '18px sans-serif';
        }

        ctx.fillStyle = f.color
            ? `rgba(${f.color},${alpha})`
            : `rgba(255,200,80,${alpha})`;

        ctx.fillText(
            f.text,
            f.x,
            f.y
        );
    }
}

function updateFloatingTexts(dt) {
    for (let i = floats.length - 1; i >= 0; i--) {
        const f = floats[i];
        f.life -= dt;
        f.y += f.vy * dt;
        if (f.life <= 0) floats.splice(i, 1);
    }
}

function updateExplosions(dt) {
    for (let i = explosions.length - 1; i >= 0; i--) {

        const ex = explosions[i];

        ex.life -= dt;

        if (ex.life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

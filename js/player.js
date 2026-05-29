const LEVEL_EXP_TABLE = [0, 8, 9, 10, 11, 12, 13, 14];
const PLAYER_MAX_SPEED = 150;
// ================================
// 玩家基礎數值
// ================================
const PLAYER_BASE = {
    speed: 100,
    health: 300,
    maxHealth: 300,
    radius: 16,

    level: 1,
    exp: 0,
    nextExp: LEVEL_EXP_TABLE[1]
};

// ================================
// 玩家目前狀態
// ================================
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,

    radius: PLAYER_BASE.radius,
    speed: PLAYER_BASE.speed,
    health: PLAYER_BASE.health,
    maxHealth: PLAYER_BASE.maxHealth,
    level: PLAYER_BASE.level,
    exp: PLAYER_BASE.exp,
    nextExp: PLAYER_BASE.nextExp,

    hitCooldown: 0,
    hurtTimer: 0,
    isBound: false,
    boundEnemyId: null,
    slowTimer: 0,
    slowMultiplier: 1,
    speedBoostTimer: 0,
    speedBoostMultiplier: 1,
    knockbackX: 0,
    knockbackY: 0
};



const playerMoveDir = {
    x: 0,
    y: 0
};

function resetPlayer() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    player.health = PLAYER_BASE.health;
    player.maxHealth = PLAYER_BASE.maxHealth;
    player.speed = PLAYER_BASE.speed;
    player.radius = PLAYER_BASE.radius;
    player.level = PLAYER_BASE.level;
    player.exp = PLAYER_BASE.exp;
    player.nextExp = PLAYER_BASE.nextExp;

    player.hitCooldown = 0;
    player.hurtTimer = 0;

    player.isBound = false;
    player.boundEnemyId = null;

    player.slowTimer = 0;
    player.slowMultiplier = 1;

    player.speedBoostTimer = 0;
    player.speedBoostMultiplier = 1;

    player.knockbackX = 0;
    player.knockbackY = 0;

    playerMoveDir.x = 0;
    playerMoveDir.y = 0;
}

function updatePlayerInput() {
    let dx = 0;
    let dy = 0;

    if (botMode) {
        const botMove = updateBotControl();

        dx = botMove.dx;
        dy = botMove.dy;

    } else {
        if (!player.isBound) {
            if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
            if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
        }
    }

    return { dx, dy };
}
function updatePlayerMovement(dt, dx, dy) {
    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;

        dx /= len;
        dy /= len;

        playerMoveDir.x = dx;
        playerMoveDir.y = dy;

        const boneBreakerMoveScale =
            boneBreakerPending && boneBreakerWindupTimer > 0
                ? boneBreakerMoveMultiplier
                : 1;

        let adrenalineMultiplier = 1;

        if (speedLevel >= 2 && player.hurtTimer > 0) {
            adrenalineMultiplier += 0.25;
        }

        if (
            speedLevel >= 3 &&
            player.health <= player.maxHealth * 0.35
            
        ) {
            adrenalineMultiplier += 0.2;
        }

        const currentSpeed =
            player.speed *
            player.slowMultiplier *
            player.speedBoostMultiplier *
            adrenalineMultiplier *
            boneBreakerMoveScale;

        player.x += dx * currentSpeed * dt;
        player.y += dy * currentSpeed * dt;
    }

    // 玩家擊退位移
    player.x += player.knockbackX * dt;
    player.y += player.knockbackY * dt;

    // 擊退衰減
    player.knockbackX *= 0.84;
    player.knockbackY *= 0.84;
}
function updatePlayerPositionClamp() {
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
}
function updatePlayerStatusEffects(dt) {

    // 緩速效果
    if (player.slowTimer > 0) {

        player.slowTimer =
            Math.max(0, player.slowTimer - dt);

        if (player.slowTimer <= 0) {
            player.slowMultiplier = 1;
        }
    }

}



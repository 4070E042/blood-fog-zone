// ================================
// Player 宣告
// ================================
const PLAYER_BASE = {
    speed: 100,
    health: 1000,
    radius: 16
};

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,

    radius: PLAYER_BASE.radius,
    speed: PLAYER_BASE.speed,
    health: PLAYER_BASE.health,
    maxHealth: PLAYER_BASE.health,

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

//const LEVEL_EXP_TABLE = [ 0,8,14,22,32,45,60,78 ];
const LEVEL_EXP_TABLE = [ 0,8,9,10,11,12,13,14 ];

function resetPlayer() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    player.health = PLAYER_BASE.health;
    player.maxHealth = PLAYER_BASE.health;
    player.speed = PLAYER_BASE.speed;
    player.radius = PLAYER_BASE.radius;

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

function triggerGameOver() {

    if (isGameOver) return;

    isGameOver = true;
    gameStarted = false;

    gameOverMenu.style.display = 'flex';

    canvas.style.cursor = 'auto';

    document.body.classList.remove('game-playing');

    gameOverTime.textContent = `生存時間: ${Math.floor(survivalTime)}s`;
    gameOverKills.textContent = `擊殺數: ${killCount}`;
    gameOverScore.textContent = `分數: ${score}`;

    playDeathSound();
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
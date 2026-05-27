// ================================
// 遊戲狀態
// ================================

// 遊戲流程
let gameStarted = false;
let isGameOver = false;
let isVictory = false;
let isPaused = false;
let isPracticeMode = false;
let isPracticePanelOpen = false;
let isPracticeExitMenuOpen = false;
let practiceSelectedEnemyType = 'normal';
let currentThreatPhase = 0;
let phaseAlertTimer = 0;
let bossSpawned = false;
let bossIntroActive = false;
let bossIntroTimer = 0;
let bossFightStarted = false;
const bossIntroDuration = 3.0;
let bossHealthBarVisible = false;
let bossHealthBarAnim = 0;
const bossSlamCooldownTime = 6.0;
const bossSlamWindupTime = 1.0;
const bossSlamRange = 145;
const bossSlamArc = Math.PI * 0.78;
const bossSlamDamage = 28;
const bossChargeCooldownTime = 12.0;
const bossChargeWindupTime = 0.8;
const bossChargeDistanceRatio = 0.35;
const bossChargeSpeed = 340;
const bossChargeDamage = 22;
const bossBasicAttackCooldownTime = 1.8;
const bossBasicAttackWindupTime = 0.45;
const bossBasicAttackRange = 78;
const bossBasicAttackDamage = 16;

const CLASSES = {
    executioner: {
        id: 'executioner',
        skillPool: [
            'bloodStep',
            'bloodRage',
            'boneBreaker'
        ],
        skills: {
            bloodExecution: {
                id: 'bloodExecution',
                name: '血性處決',
                type: 'passive',
                key: null,
                description: '近距離持續戰鬥時累積處決值，提升攻速、揮擊範圍與流血效果。'
            },
            bloodStep: {
                id: 'bloodStep',
                name: '血步突進',
                type: 'active',
                key: 'SPACE',
                description: '短距離突進，作為保命、切入、脫離包圍用途。'
            },
            bloodRage: {
                id: 'bloodRage',
                name: '血怒狂暴',
                type: 'active',
                key: 'E',
                description: '短時間提升攻速與揮擊範圍，擊殺敵人可微量回血。'
            },
            boneBreaker: {
                id: 'boneBreaker',
                name: '裂骨重擊',
                type: 'active',
                key: 'R',
                description: '向前方重砍，造成高傷害、擊退與流血。'
            }
        },
        name: '處刑者',
        role: '近戰 Build 生存職業',
        description: '以近距離戰鬥成形的殭屍生存職業'
    }
};

let playerClass = null;

// 分數 / 時間
let score = 0;
let survivalTime = 0;
let killCount = 0;

// 畫面效果
let screenShake = 0;

// Combo
let comboCount = 0;
let comboTimer = 0;

// Build / 技能
const activeBuilds = [];
const activeSkills = [];

// 升級系統
let isUpgradeActive = false;

let playerLevel = 1;
let playerExp = 0;
let playerNextExp = 20;

// 能力卡等級
let speedLevel = 0;
let damageLevel = 0;
let attackSpeedLevel = 0;
let rangeLevel = 0;

const TRAIT_MAX_LEVEL = 3;

// 升級特效
let upgradeEffectTimer = 0;

// 怪物攻擊範圍
let enemyAttackRangeOffset = 25;


// ================================
// Attack 設定
// ================================

// 武器數值
let stickDamage = 10;
let stickRange = 26;

// 攻擊模式
let autoAttackMode = false;

// 揮擊設定
const swingDuration = 0.35;
const swingArc = Math.PI / 3;

// 攻擊冷卻
let baseAttackCooldownTime = 0.9;
let attackCooldownTime = 0.8;
let attackCooldown = 0;


// ================================
// Attack 狀態
// ================================

// 揮擊狀態
let isSwinging = false;
let swingProgress = 0;

// 本次揮擊命中列表
const swingHitSet = new Set();

// ================================
// Build
// ================================
activeBuilds.length = 0;
activeSkills.length = 0;


// ================================
// Explosion Build
// ================================
let explosionEnabled = false;
let explosionLevel = 0;
let explosionRadius = 70;
let explosionDamage = 4;

const explosions = [];



// ================================
// Shockwave Build
// ================================
shockwaveUnlocked = false;
shockwaveCooldown = 0;

// ================================
// Orbit Skill
// 旋轉棍棒
// ================================
let orbitUnlocked = false;

let orbitLevel = 0;
let orbitAngle = 0;
let orbitRadius = 72;
let orbitDamage = 6;
let orbitRotateSpeed = 2.4;

// ================================
// Stretch Build
// ================================
stretchUnlocked = false;
stretchLevel = 0;
stretchCooldown = 0;

// ================================
// Blood Rage
// ================================
let bloodRageActive = false;
let bloodRageUnlocked = false;
let bloodRageLevel = 0;
const bloodRageMaxLevel = 5;
let bloodRageTimer = 0;
const bloodRageDuration = 4;
const bloodRageDurationPerLevel = 0.4;
const bloodRageCooldown = 10;
const bloodRageCooldownByLevel = [0, 10, 9, 8, 7, 6];
let bloodRageCooldownTimer = 0;
let bloodRageBaseStickRange = 0;

// ================================
// Blood Execution
// ================================
let bloodExecutionValue = 0;
let bloodExecutionWasFull = false;

// 血決最大值
const bloodExecutionMax = 100;

// 每次命中增加血決
const bloodExecutionGainOnHit = 10;

// 血決衰退速度（每秒）
const bloodExecutionDecayRate = 18;

// 脫離戰鬥後幾秒才開始衰退
const bloodExecutionCombatGrace = 3.0;

// 滿血決時最大攻速加成
const bloodExecutionAttackSpeedBonus = 0.18;

// 戰鬥保留計時器
let bloodExecutionCombatTimer = 0;

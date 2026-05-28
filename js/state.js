// ================================
// 遊戲狀態
// ================================

// 遊戲流程
let gameStarted = false;               // 是否已開始遊戲
let isGameOver = false;                // 是否遊戲失敗
let isVictory = false;                 // 是否勝利
let isPaused = false;                  // 是否暫停
let isPracticeMode = false;            // 是否練習模式
let isPracticePanelOpen = false;       // 練習選單開啟
let isPracticeExitMenuOpen = false;    // 練習離開選單開啟

// 練習模式設定
let practiceSelectedEnemyType = 'normal'; 

// 威脅階段
let currentThreatPhase = 0;            // 當前威脅階段
let phaseAlertTimer = 0;               // 階段提示計時


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
const GAME_BASE = {
    survivalTime: 0,
    score: 0,
}

// ================================
// Boss 固定資料
// ================================
const BOSS_STATE = {
    spawned: false,

    introActive: false,
    introTimer: 0,

    fightStarted: false,

    healthBarVisible: false,
    healthBarAnim: 0
}

const BOSS_BASE = {
    hp: 600,
    radius: 48,
    speed: 60,
    damage: 20,
    spawnTime: 300
}

// ================================
// Boss 宣告參數
// ================================
// Boss 狀態
let bossSpawned = false;               // Boss 是否已生成
let bossIntroActive = false;           // Boss 登場動畫中
let bossIntroTimer = 0;                // Boss 登場計時
let bossFightStarted = false;          // Boss 戰是否正式開始
const bossIntroDuration = 3.0;         // Boss 登場持續時間

// Boss 血條 UI
let bossHealthBarVisible = false;      // Boss 血條顯示中
let bossHealthBarAnim = 0;             // Boss 血條動畫進度
// 巨斧重擊
const bossSlamCooldownTime = 6.0;      // 技能冷卻
const bossSlamWindupTime = 1.0;        // 前搖時間
const bossSlamRange = 160;             // 重擊距離
const bossSlamArc = Math.PI * 1.05;    // 扇形範圍
const bossSlamDamage = 54;             // 重擊傷害

// 衝鋒踐踏
const bossChargeCooldownTime = 12.0;   // 技能冷卻
const bossChargeWindupTime = 0.8;      // 衝鋒前搖
const bossChargeDistanceRatio = 0.35;  // 衝鋒距離比例
const bossChargeSpeed = 340;           // 衝鋒速度
const bossChargeDamage = 80;           // 衝鋒傷害

// Boss 普攻
const bossBasicAttackCooldownTime = 1.8; // 普攻冷卻
const bossBasicAttackWindupTime = 0.55;  // 普攻前搖
const bossBasicAttackRange = 54;         // 普攻距離
const bossBasicAttackDamage = BOSS_BASE.damage;


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



// 能力卡等級
let speedLevel = 0;
let damageLevel = 0;
let attackSpeedLevel = 0;
let rangeLevel = 0;

const TRAIT_MAX_LEVEL = 3;
const rangeBonusByLevel = [0, 10, 7, 5];
const attackSpeedBonusByLevel = [0, 0.9, 0.85, 0.8];

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
let explosionChance = 0.35;

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
const bloodExecutionCombatGrace = 2.4;

// 滿血決時最大攻速加成
const bloodExecutionAttackSpeedBonus = 0.18;

// 戰鬥保留計時器
let bloodExecutionCombatTimer = 0;

const hitAudio = new Audio('sounds/hit.mp3');

const zombieAudios = [
    new Audio('sounds/zombie1.mp3'),
    new Audio('sounds/zombie2.mp3')
];

const hurtAudio = new Audio('sounds/hurt.mp3');
const swingAudio = new Audio('sounds/swing.mp3');
const deathAudio = new Audio('sounds/death.mp3');
const burrowAudio = new Audio('sounds/burrow.mp3');
const screamAudio = new Audio('sounds/scream.mp3');
const levelUpAudio = new Audio('sounds/levelup.mp3');

// 回血音效
const healAudio = new Audio('sounds/heal.mp3');

// BOOS 音效技能 / 造成傷害
const heavy_swingAudio = new Audio('sounds/heavy_swing.mp3');
const heavy_hurtAudio = new Audio('sounds/heavy_hurt.mp3');

// 技能音效
const dashAudio = new Audio('sounds/dash.mp3');
const bloodRageAudio = new Audio('sounds/blood_rage.mp3');

const heavyCleaveAudio = new Audio('sounds/heavy_cleave.mp3');
const heavyDamageAudio = new Audio('sounds/heavy_damage.mp3');

function playLevelUpSound() {

    try {

        levelUpAudio.currentTime = 0;

        levelUpAudio.play().catch(() => { });

    } catch (e) { }

}

function playZombieSound() {

    const audio = zombieAudios[Math.floor(Math.random() * zombieAudios.length)];

    try {

        audio.currentTime = 0;

        audio.play().catch(() => { });

    } catch (e) { }

}

function playHitSound() {

    try {

        hitAudio.currentTime = 0;

        hitAudio.play().catch(() => { });

    } catch (e) { }

}
function playHurtSound() {

    try {

        hurtAudio.currentTime = 0;

        hurtAudio.play().catch(() => { });

    } catch (e) { }

}

function playDeathSound() {

    try {

        deathAudio.currentTime = 0;

        deathAudio.play().catch(() => { });

    } catch (e) { }

}

function playBurrowSound() {

    try {

        burrowAudio.currentTime = 0;

        burrowAudio.play().catch(() => { });

    } catch (e) { }

}

function playScreamSound() {

    try {

        screamAudio.currentTime = 0;

        screamAudio.play().catch(() => { });

    } catch (e) { }

}

// 播放回血音效
function playHealSound() {

    try {

        healAudio.currentTime = 0;

        healAudio.play().catch(() => { });

    } catch (e) { }

}

function playdashSound() {

    try {

        dashAudio.currentTime = 0;

        dashAudio.play().catch(() => { });

    } catch (e) { }

}
function playBloodRageSound() {

    try {

        bloodRageAudio.currentTime = 0;

        bloodRageAudio.play().catch(() => { });

    } catch (e) { }

}
function playHeavyCleaveSound() {

    try {

        heavyCleaveAudio.currentTime = 0;

        heavyCleaveAudio.play().catch(() => { });

    } catch (e) { }

}
function playHeavyDamageSound() {

    try {

        heavyDamageAudio.currentTime = 0;

        heavyDamageAudio.play().catch(() => { });

    } catch (e) { }

}

// BOOS 揮斧音效
function bossHeavySwingSound() {

    try {

        heavy_swingAudio.currentTime = 0;

        heavy_swingAudio.play().catch(() => { });

    } catch (e) { }

}
function playHeavyHurtSound() {

    try {

        heavy_hurtAudio.currentTime = 0;

        heavy_hurtAudio.play().catch(() => { });

    } catch (e) { }

}


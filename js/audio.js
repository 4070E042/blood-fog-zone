const hitAudio = new Audio('sounds/hit.mp3');

const zombieAudios = [
    new Audio('sounds/zombie1.mp3'),
    new Audio('sounds/zombie2.mp3')
];

const bgm = new Audio('sounds/bgm.mp3');
const bossBgm = new Audio('sounds/boss_bgm.mp3');

const hurtAudio = new Audio('sounds/hurt.mp3');
const swingAudio = new Audio('sounds/swing.mp3');
const deathAudio = new Audio('sounds/death.mp3');
const burrowAudio = new Audio('sounds/burrow.mp3');
const screamAudio = new Audio('sounds/scream.mp3');
const levelUpAudio = new Audio('sounds/levelup.mp3');
const uiHoverAudio = new Audio('sounds/ui_hover.mp3');
let lastUIHoverSoundTime = 0;

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

// BOSS 音效
const bossRoarAudio = new Audio('sounds/boss_roar.mp3');

let bgmVolume = 0.4;
let sfxVolume = 0.6;

function applyBGMVolume() {
    bgm.volume = bgmVolume;
    bossBgm.volume = bgmVolume;
}

function setBGMVolume(value) {
    bgmVolume = Math.max(0, Math.min(1, Number(value)));
    applyBGMVolume();
}

function setSFXVolume(value) {
    sfxVolume = Math.max(0, Math.min(1, Number(value)));
}

function playSFX(audio) {
    audio.volume = sfxVolume;
    audio.currentTime = 0;
    audio.play().catch(() => { });
}

applyBGMVolume();

function playBGM() {

    try {

        bgm.loop = true;
        bgm.volume = bgmVolume;

        bgm.play().catch(() => { });

    } catch (e) { }

}

function stopBGM() {

    try {

        bgm.pause();
        bgm.currentTime = 0;

    } catch (e) { }

}

function playBossBGM() {

    try {

        bossBgm.loop = true;
        bossBgm.volume = bgmVolume;

        bossBgm.play().catch(() => { });

    } catch (e) { }

}
function stopBossBGM() {

    try {

        bossBgm.pause();
        bossBgm.currentTime = 0;

    } catch (e) { }

}

function playBossRoarSound() {

    try {
        playSFX(bossRoarAudio);

    } catch (e) { }

}

function playLevelUpSound() {

    try {
        playSFX(levelUpAudio);

    } catch (e) { }

}

function playUIHoverSound(force = false) {

    const now = performance.now();

    if (!force && now - lastUIHoverSoundTime < 90) return;

    lastUIHoverSoundTime = now;

    try {
        playSFX(uiHoverAudio);

    } catch (e) { }

}

function playZombieSound() {

    const audio = zombieAudios[Math.floor(Math.random() * zombieAudios.length)];

    try {
        playSFX(audio);

    } catch (e) { }

}

function playHitSound() {

    try {
        playSFX(hitAudio);

    } catch (e) { }

}

function playSwingSound() {

    try {
        playSFX(swingAudio);

    } catch (e) { }

}

function playHurtSound() {

    try {
        playSFX(hurtAudio);

    } catch (e) { }

}

function playDeathSound() {

    try {
        playSFX(deathAudio);

    } catch (e) { }

}

function playBurrowSound() {

    try {
        playSFX(burrowAudio);

    } catch (e) { }

}

function playScreamSound() {

    try {
        playSFX(screamAudio);

    } catch (e) { }

}

// 播放回血音效
function playHealSound() {

    try {
        playSFX(healAudio);

    } catch (e) { }

}

function playdashSound() {

    try {
        playSFX(dashAudio);

    } catch (e) { }

}
function playBloodRageSound() {

    try {
        playSFX(bloodRageAudio);

    } catch (e) { }

}
function playHeavyCleaveSound() {

    try {
        playSFX(heavyCleaveAudio);

    } catch (e) { }

}
function playHeavyDamageSound() {

    try {
        playSFX(heavyDamageAudio);

    } catch (e) { }

}

// BOOS 揮斧音效
function bossHeavySwingSound() {

    try {
        playSFX(heavy_swingAudio);

    } catch (e) { }

}
function playHeavyHurtSound() {

    try {
        playSFX(heavy_hurtAudio);

    } catch (e) { }

}


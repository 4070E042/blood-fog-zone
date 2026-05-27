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

function playLevelUpSound() {

    try {

        levelUpAudio.currentTime = 0;

        levelUpAudio.play().catch(() => { });

    } catch (e) { }

}

function playZombieSound() {
    const audio = zombieAudios[Math.floor(Math.random() * zombieAudios.length)];
    try { audio.currentTime = 0; audio.play().catch(() => { }); } catch (e) { }
}
function playHurtSound() {
    try { hurtAudio.currentTime = 0; hurtAudio.play().catch(() => { }); } catch (e) { }
}
function playDeathSound() {
    try { deathAudio.currentTime = 0; deathAudio.play().catch(() => { }); } catch (e) { }
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
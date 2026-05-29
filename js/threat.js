// ================================
// 威脅階段
// ================================
function updateThreatPhase(dt) {
    if (isPracticeMode) return;

    for (let phase = 4; phase >= 1; phase--) {
        const phaseInfo = THREAT_PHASE_ALERTS[phase];

        if (
            survivalTime >= phaseInfo.time &&
            currentThreatPhase < phase
        ) {
            currentThreatPhase = phase;
            playZombieMutationSound();
            showPhaseAlert(phaseInfo.title, phaseInfo.message);
            break;
        }
    }

    if (phaseAlertTimer > 0) {
        phaseAlertTimer = Math.max(0, phaseAlertTimer - dt);
        updatePhaseAlert();
    }
}
function showPhaseAlert(title, message) {
    phaseAlertTitle.textContent = `【${title}】`;
    phaseAlertMessage.textContent = message;
    phaseAlertTimer = 3;
    updatePhaseAlert();
}
function updatePhaseAlert() {
    phaseAlert.style.display =
        phaseAlertTimer > 0 ? 'block' : 'none';
}



function getCurrentSpawnInterval() {

    switch (currentThreatPhase) {
        case 0:
            return 1.8;
        case 1:
            return 1.6;
        case 2:
            return 1.35;
        case 3:
            return 1.1;
        default:
            return 1.0;
    }
}
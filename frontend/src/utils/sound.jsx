// frontend/src/utils/sound.js
let audioCtx = null;
let unlockBound = false;

function getAudioCtx() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = Ctx ? new Ctx() : null;
    }
    return audioCtx;
}

// Gọi 1 lần để "unlock" audio sau khi user click/press key (browser policy)
export function bindTingUnlockOnce() {
    if (unlockBound) return;
    unlockBound = true;

    const unlock = async () => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        try {
            if (ctx.state === "suspended") await ctx.resume();
        } catch {
            // ignore
        } finally {
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        }
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
}

// Phát tiếng "ting" bằng WebAudio (không cần file mp3)
export function playTingSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    // nếu bị suspend mà không có gesture -> resume có thể fail, nhưng vẫn ok
    if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);

    osc.onended = () => {
        try {
            osc.disconnect();
            gain.disconnect();
        } catch {
            // ignore
        }
    };
}

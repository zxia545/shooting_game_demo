export class Loop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.lastTime = 0;
        this.isRunning = false;
        this.rafId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }

    animate(time) {
        if (!this.isRunning) return;

        const now = time || performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap dt at 0.1s
        this.lastTime = now;

        this.updateFn(dt);
        if (this.renderFn) this.renderFn();

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }
}

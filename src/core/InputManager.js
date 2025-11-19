export class InputManager {
    constructor() {
        this.deltaX = 0;
        this.isDragging = false;
        this.lastX = 0;

        // Bind methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        // Add listeners
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        window.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd);
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.lastX = e.clientX;
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        const currentX = e.clientX;
        this.deltaX += (currentX - this.lastX) / window.innerWidth; // Normalize
        this.lastX = currentX;
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onTouchStart(e) {
        this.isDragging = true;
        this.lastX = e.touches[0].clientX;
    }

    onTouchMove(e) {
        if (!this.isDragging) return;
        // e.preventDefault(); // Prevent scrolling while playing
        const currentX = e.touches[0].clientX;
        this.deltaX += (currentX - this.lastX) / window.innerWidth;
        this.lastX = currentX;
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    getDeltaX() {
        const d = this.deltaX;
        this.deltaX = 0; // Consume delta
        return d;
    }
}

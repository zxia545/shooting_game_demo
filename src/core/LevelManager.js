export class LevelManager {
    constructor(firebaseManager) {
        this.firebaseManager = firebaseManager;
        this.currentLevel = 1;
        this.levelDistance = 1000; // Meters per level
        this.currentDistance = 0;
        this.checkpointDistance = 0;
    }

    reset() {
        this.currentDistance = this.checkpointDistance;
    }

    update(dt, speed) {
        this.currentDistance += speed * dt;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const level = Math.floor(this.currentDistance / this.levelDistance) + 1;
        if (level > this.currentLevel) {
            this.currentLevel = level;
            this.checkpointDistance = (this.currentLevel - 1) * this.levelDistance;
            console.log(`Level Up! Now Level ${this.currentLevel}`);
            // Could trigger UI notification here
            return true;
        }
        return false;
    }

    getLevelProgress() {
        const start = (this.currentLevel - 1) * this.levelDistance;
        const end = this.currentLevel * this.levelDistance;
        const progress = (this.currentDistance - start) / (end - start);
        return Math.min(Math.max(progress, 0), 1);
    }

    getDifficultyMultiplier() {
        // Increase difficulty by 20% per level
        return 1 + (this.currentLevel - 1) * 0.2;
    }
}

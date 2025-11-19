export class UIManager {
    constructor() {
        // Elements
        this.hud = document.getElementById('hud');
        this.mainMenu = document.getElementById('main-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOver = document.getElementById('game-over');

        this.scoreDisplay = document.getElementById('score-display');
        this.coinsDisplay = document.getElementById('coins-display');
        this.powerDisplay = document.getElementById('power-display');

        this.finalScore = document.getElementById('final-score');
        this.finalCoins = document.getElementById('final-coins');

        // Upgrade Buttons
        this.btnUpgradeDmg = document.getElementById('btn-upgrade-dmg');
        this.btnUpgradeCount = document.getElementById('btn-upgrade-count');
        this.btnStart = document.getElementById('btn-start');
        this.btnRestart = document.getElementById('btn-restart');
        this.btnPause = document.getElementById('btn-pause');
        this.btnResume = document.getElementById('btn-resume');
        this.btnQuit = document.getElementById('btn-quit');

        this.levelBanner = document.getElementById('level-banner');
        this.levelNumber = document.getElementById('level-number');

        this.lvlDmg = document.getElementById('lvl-dmg');
        this.priceDmg = document.getElementById('price-dmg');
        this.lvlCount = document.getElementById('lvl-count');
        this.priceCount = document.getElementById('price-count');

        this.leaderboardList = document.getElementById('leaderboard-list');

        this.initListeners();
    }

    initListeners() {
        // These will be overridden by GameApp or assigned callbacks
    }

    showMainMenu() {
        this.mainMenu.classList.remove('hidden');
        this.hud.classList.add('hidden');
        this.pauseMenu.classList.add('hidden');
        this.gameOver.classList.add('hidden');
    }

    showGame() {
        this.mainMenu.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.pauseMenu.classList.add('hidden');
        this.gameOver.classList.add('hidden');
    }

    showPauseMenu() {
        this.mainMenu.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.pauseMenu.classList.remove('hidden');
        this.gameOver.classList.add('hidden');
    }

    showGameOver(score, coins) {
        this.mainMenu.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.gameOver.classList.remove('hidden');

        this.finalScore.innerText = score;
        this.finalCoins.innerText = coins;
    }

    updateSquadCount(count) {
        if (this.powerDisplay) this.powerDisplay.innerText = count;
    }

    updateDistance(dist) {
        if (this.scoreDisplay) this.scoreDisplay.innerText = dist;
    }

    updateCoins(coins) {
        if (this.coinsDisplay) this.coinsDisplay.innerText = coins;
    }

    updateShop(state) {
        // state = { money, upgradeDmg, upgradeCount }
        this.lvlDmg.innerText = state.upgradeDmg;
        this.priceDmg.innerText = Math.floor(100 * Math.pow(1.5, state.upgradeDmg - 1));

        this.lvlCount.innerText = state.upgradeCount;
        this.priceCount.innerText = Math.floor(200 * Math.pow(1.5, state.upgradeCount - 1));

        this.updateCoins(state.money);
    }

    showFloatingText(text, x, y, color = '#fbbf24') {
        const el = document.createElement('div');
        el.className = 'damage-text';
        el.innerText = text;
        el.style.color = color;
        el.style.left = x + 'px';
        el.style.top = y + 'px';

        // Add animation class styles if not present (handled in CSS)
        // We need to ensure CSS has .damage-text

        document.body.appendChild(el);
        setTimeout(() => el.remove(), 600);
    }

    updateLeaderboard(data) {
        if (!data) return;
        this.leaderboardList.innerHTML = data.map((e, i) =>
            `<div class="flex justify-between"><span>${i + 1}. ${e.name || 'Player'}</span><span>${e.score}m</span></div>`
        ).join('');
    }

    showLevelUp(level) {
        if (!this.levelBanner || !this.levelNumber) return;
        this.levelNumber.innerText = level;
        this.levelBanner.classList.remove('hidden');
        setTimeout(() => {
            this.levelBanner.classList.add('hidden');
        }, 3000); // Show for 3 seconds
    }
}

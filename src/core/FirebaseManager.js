// import { initializeApp } from 'firebase/app';
// import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export class FirebaseManager {
    constructor() {
        // Placeholder Config
        this.firebaseConfig = {
            apiKey: "API_KEY",
            authDomain: "project-id.firebaseapp.com",
            projectId: "project-id",
            storageBucket: "project-id.appspot.com",
            messagingSenderId: "sender-id",
            appId: "app-id"
        };

        // this.app = initializeApp(this.firebaseConfig);
        // this.db = getFirestore(this.app);

        this.userId = 'user_' + Math.floor(Math.random() * 10000);
        this.data = {
            money: 0,
            lvl_dmg: 1,
            lvl_count: 1,
            high_score: 0
        };

        this.loadLocal();
    }

    loadLocal() {
        const saved = localStorage.getItem('zombie_shooter_save');
        if (saved) {
            this.data = JSON.parse(saved);
            console.log('Loaded save:', this.data);
        }
    }

    saveLocal() {
        localStorage.setItem('zombie_shooter_save', JSON.stringify(this.data));
        console.log('Saved:', this.data);
    }

    async loadUserData() {
        // Mock Async Load
        return new Promise((resolve) => {
            setTimeout(() => {
                this.loadLocal();
                resolve(this.data);
            }, 500);
        });
    }

    async saveUserData() {
        // Mock Async Save
        return new Promise((resolve) => {
            setTimeout(() => {
                this.saveLocal();
                resolve(true);
            }, 500);
        });
    }

    updateMoney(amount) {
        this.data.money += amount;
        this.saveLocal();
    }

    updateScore(score) {
        if (score > this.data.high_score) {
            this.data.high_score = score;
            this.saveLocal();
        }
    }

    saveUpgrades(dmg, count) {
        this.data.lvl_dmg = dmg;
        this.data.lvl_count = count;
        this.saveLocal();
    }

    async getLeaderboard() {
        // Mock Leaderboard
        return [
            { name: 'Player1', score: 5000 },
            { name: 'Player2', score: 4500 },
            { name: 'Player3', score: 3000 },
            { name: 'You', score: this.data.high_score }
        ].sort((a, b) => b.score - a.score);
    }
}

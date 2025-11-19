import * as THREE from 'three';
import { Loop } from './Loop.js';
import { InputManager } from './InputManager.js';
import { RoadSystem } from '../systems/RoadSystem.js';
import { SquadSystem } from '../systems/SquadSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { FirebaseManager } from './FirebaseManager.js';
import { LevelManager } from './LevelManager.js';
import { AudioManager } from './AudioManager.js';

export class GameApp {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a202c);
        this.scene.fog = new THREE.Fog(0x1a202c, 30, 90);

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 150);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 30, -10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Systems
        this.inputManager = new InputManager();
        this.roadSystem = new RoadSystem(this.scene);
        this.squadSystem = new SquadSystem(this.scene, this.inputManager);
        this.combatSystem = new CombatSystem(this.scene);
        this.uiManager = new UIManager();
        this.firebaseManager = new FirebaseManager();
        this.levelManager = new LevelManager(this.firebaseManager);
        this.audioManager = new AudioManager();

        // Initial Render Setup
        this.squadSystem.centerPosition.set(0, 0, 0);
        this.camera.position.set(0, 20, 22);
        this.camera.lookAt(0, 0, -10);

        this.loop = new Loop(this.update.bind(this));

        window.addEventListener('resize', this.onResize.bind(this));

        // Game State
        this.state = {
            money: 0,
            upgradeDmg: 1,
            upgradeCount: 1,
            isPlaying: false
        };

        this.initUIEvents();

        // Load Data
        this.firebaseManager.loadUserData().then(data => {
            this.state.money = data.money;
            this.state.upgradeDmg = data.lvl_dmg;
            this.state.upgradeCount = data.lvl_count;
            this.uiManager.updateShop(this.state);
        });
    }

    initUIEvents() {
        this.uiManager.btnStart.onclick = () => this.startGame();
        this.uiManager.btnRestart.onclick = () => this.resetGame();

        this.uiManager.btnUpgradeDmg.onclick = () => {
            const price = Math.floor(100 * Math.pow(1.5, this.state.upgradeDmg - 1));
            if (this.state.money >= price) {
                this.state.money -= price;
                this.state.upgradeDmg++;
                this.firebaseManager.updateMoney(-price);
                this.firebaseManager.saveUpgrades(this.state.upgradeDmg, this.state.upgradeCount);
                this.uiManager.updateShop(this.state);
            }
        };

        this.uiManager.btnUpgradeCount.onclick = () => {
            const price = Math.floor(200 * Math.pow(1.5, this.state.upgradeCount - 1));
            if (this.state.money >= price) {
                this.state.money -= price;
                this.state.upgradeCount++;
                this.firebaseManager.updateMoney(-price);
                this.firebaseManager.saveUpgrades(this.state.upgradeDmg, this.state.upgradeCount);
                this.uiManager.updateShop(this.state);
            }
        };

        this.uiManager.btnPause.onclick = () => {
            if (this.state.isPlaying && !this.state.isPaused) {
                this.loop.stop();
                this.state.isPaused = true;
                this.uiManager.showPauseMenu();
            }
        };

        // Add resume handler
        if (this.uiManager.btnResume) {
            this.uiManager.btnResume.onclick = () => {
                if (this.state.isPaused) {
                    this.state.isPaused = false;
                    this.loop.start();
                    this.uiManager.showGame();
                }
            };
        }

        // Add quit handler
        if (this.uiManager.btnQuit) {
            this.uiManager.btnQuit.onclick = () => {
                this.resetGame();
            };
        }
    }

    startGame() {
        this.audioManager.init(); // Init audio on user gesture
        this.state.isPlaying = true;
        this.uiManager.showGame();

        // Reset Level
        this.levelManager.reset();
        const startZ = -this.levelManager.currentDistance;

        // Reset World
        this.squadSystem.units.forEach(u => u.dispose());
        this.squadSystem.units = [];
        this.squadSystem.centerPosition.set(0, 0, startZ);
        this.roadSystem.reset(startZ);

        // Add initial units based on upgrade
        for (let i = 0; i < this.state.upgradeCount; i++) {
            this.squadSystem.addUnit(0);
        }

        this.loop.start();
    }

    resetGame() {
        this.uiManager.showMainMenu();
        this.state.isPlaying = false;
        this.loop.stop();
    }

    start() {
        // this.loop.start(); // Don't auto start, wait for UI
        this.uiManager.showMainMenu();
        this.renderer.render(this.scene, this.camera); // Render initial frame
    }

    update(dt) {
        // Game Logic
        const squadPos = this.squadSystem.getPosition();

        // Update Systems
        this.levelManager.update(dt, this.squadSystem.moveSpeed);

        // Sync squad Z with level distance
        this.levelManager.currentDistance = Math.abs(squadPos.z);
        const leveledUp = this.levelManager.checkLevelUp();
        if (leveledUp) {
            this.uiManager.showLevelUp(this.levelManager.currentLevel);
            this.audioManager.playMerge(); // Play level-up sound
        }

        this.roadSystem.update(dt, squadPos.z);

        this.squadSystem.update(dt, this.roadSystem.gates, (type, pos, val) => {
            if (type === 'gate') {
                const screenPos = this.toScreenPosition(pos);
                const color = val > 0 ? '#4ade80' : '#f87171';
                const text = val > 0 ? `+${val}` : `${val}`;
                this.uiManager.showFloatingText(text, screenPos.x, screenPos.y, color);
                this.audioManager.playGate();
            }
        });

        this.combatSystem.update(dt, this.squadSystem, this.roadSystem, (type, pos, val) => {
            if (type === 'kill') {
                const screenPos = this.toScreenPosition(pos);
                this.uiManager.showFloatingText(`+${val}$`, screenPos.x, screenPos.y, '#fbbf24');
                this.state.money += val;
                this.firebaseManager.updateMoney(val);
                this.uiManager.updateCoins(this.state.money);
                this.audioManager.playHit();
            } else if (type === 'upgrade') {
                const screenPos = this.toScreenPosition(pos);
                this.uiManager.showFloatingText("UPGRADE!", screenPos.x, screenPos.y, '#F59E0B');
                this.audioManager.playMerge();
            } else if (type === 'shoot') {
                // Optional: too noisy if every shot plays
            }
        });

        // Camera Follow
        this.camera.position.z = squadPos.z + 22;
        this.camera.position.y = 20;
        this.camera.position.x = squadPos.x * 0.5;
        this.camera.lookAt(0, 0, squadPos.z - 10);

        // UI Update
        this.uiManager.updateSquadCount(this.squadSystem.getUnitCount());
        this.uiManager.updateDistance(Math.floor(this.levelManager.currentDistance));

        if (this.squadSystem.getUnitCount() <= 0) {
            this.state.isPlaying = false;
            const score = Math.floor(this.levelManager.currentDistance);
            this.uiManager.showGameOver(score, this.state.money);
            this.firebaseManager.updateScore(score);
            this.loop.stop();
        }

        this.renderer.render(this.scene, this.camera);
    }

    toScreenPosition(objPos) {
        const vector = objPos.clone();
        vector.project(this.camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
        return { x, y };
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

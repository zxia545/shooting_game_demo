import * as THREE from 'three';
import { Enemy } from '../entities/Enemy.js';
import { Gate } from '../entities/Gate.js';
import { WeaponBox } from '../entities/WeaponBox.js';

export class RoadSystem {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.enemies = []; // Track active enemies
        this.gates = []; // Track active gates
        this.boxes = []; // Track active boxes
        this.segmentLength = 20;
        this.roadWidth = 16; // Wider road
        this.visibleSegments = 15;
        this.lastZ = 0;

        // Road Material
        this.roadMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a5568,
        });

        // Line Material
        this.lineMaterial = new THREE.MeshBasicMaterial({ color: 0xF6E05E });

        // Rail Material
        this.railMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3748 });

        this.init();
    }

    init() {
        for (let i = 0; i < this.visibleSegments; i++) {
            this.spawnSegment();
        }
    }

    spawnSegment() {
        const group = new THREE.Group();
        group.position.z = this.lastZ - this.segmentLength / 2;

        // Road Base
        const geometry = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
        const mesh = new THREE.Mesh(geometry, this.roadMaterial);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        group.add(mesh);

        // Center Line (Dashed)
        const dashLen = 2;
        const gapLen = 2;
        const numDashes = this.segmentLength / (dashLen + gapLen);

        for (let i = 0; i < numDashes; i++) {
            const dash = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, dashLen),
                this.lineMaterial
            );
            dash.rotation.x = -Math.PI / 2;
            const z = -this.segmentLength / 2 + i * (dashLen + gapLen) + dashLen / 2;
            dash.position.set(0, 0.02, z);
            group.add(dash);
        }

        // Side Rails
        const railGeo = new THREE.BoxGeometry(0.5, 1, this.segmentLength);
        const leftRail = new THREE.Mesh(railGeo, this.railMaterial);
        leftRail.position.set(-this.roadWidth / 2 - 0.25, 0.5, 0);
        group.add(leftRail);

        const rightRail = new THREE.Mesh(railGeo, this.railMaterial);
        rightRail.position.set(this.roadWidth / 2 + 0.25, 0.5, 0);
        group.add(rightRail);

        this.scene.add(group);
        this.segments.push(group);

        this.lastZ -= this.segmentLength;
    }

    spawnGameElements(z) {
        const seed = Math.random();

        if (seed < 0.4) {
            // Gates
            const v1 = Math.floor(Math.random() * 20) + 5;
            const v2 = -Math.floor(Math.random() * 10) - 5;
            const flip = Math.random() > 0.5;

            const g1 = new Gate(this.scene, z, flip ? v1 : v2, true);
            const g2 = new Gate(this.scene, z, flip ? v2 : v1, false);
            this.gates.push(g1, g2);
        } else if (seed < 0.6) {
            // Weapon Box
            const box = new WeaponBox(this.scene, z);
            this.boxes.push(box);
        } else {
            // Enemies
            const count = 3;
            for (let i = 0; i < count; i++) {
                const enemy = new Enemy(this.scene, z + Math.random() * 10 - 5);
                this.enemies.push(enemy);
            }
        }
    }

    update(dt, playerZ) {
        // Check if we need to spawn new segment
        if (playerZ + 120 > this.lastZ) {
            this.spawnSegment();
            this.spawnGameElements(this.lastZ - this.segmentLength / 2);
        }

        // Cleanup old segments
        while (this.segments.length > 0 && this.segments[0].position.z > playerZ + 50) { // Logic check: player moves -Z. old segments are +Z (behind).
            // Wait, if player moves -Z (e.g. -100), segments at 0 are > -100.
            // So segments with Z > playerZ + buffer are behind.
            const seg = this.segments.shift();
            this.scene.remove(seg);
        }

        // Cleanup Gates
        this.gates = this.gates.filter(g => {
            if (g.isDead) {
                g.dispose();
                return false;
            }
            if (g.position.z > playerZ + 50) {
                g.dispose();
                return false;
            }
            return true;
        });

        // Cleanup Enemies
        this.enemies = this.enemies.filter(e => {
            // Enemies might die from combat, handled there?
            // Or here if they fall behind
            if (e.position.z > playerZ + 50) {
                e.dispose();
                return false;
            }
            return true;
        });

        // Cleanup Boxes
        this.boxes = this.boxes.filter(b => {
            if (!b.active) return false;
            if (b.position.z > playerZ + 50) {
                b.dispose();
                return false;
            }
            return true;
        });
    }

    reset() {
        // Clear all
        this.segments.forEach(s => this.scene.remove(s));
        this.segments = [];

        this.enemies.forEach(e => e.dispose());
        this.enemies = [];

        this.gates.forEach(g => g.dispose());
        this.gates = [];

        this.boxes.forEach(b => b.dispose());
        this.boxes = [];

        this.lastZ = 0;
        this.init();
    }
}

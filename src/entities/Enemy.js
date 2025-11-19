import * as THREE from 'three';
import { Unit } from './Unit.js';

export class Enemy {
    constructor(scene, z, tier = 0) {
        this.scene = scene;
        this.tier = tier;

        // Use Unit class for mesh generation but with isPlayer=false
        // We wrap it to manage HP and logic
        this.unit = new Unit(scene, new THREE.Vector3(0, 0, z), tier, false);
        this.mesh = this.unit.mesh;

        // Random X
        const laneWidth = 16;
        const x = (Math.random() - 0.5) * (laneWidth - 2);
        this.mesh.position.set(x, 0, z);
        this.mesh.rotation.y = Math.PI; // Face player

        this.hp = this.unit.config.hp;
        this.maxHp = this.hp;
    }

    get position() {
        return this.mesh.position;
    }

    hit(dmg) {
        this.hp -= dmg;

        // Flash Red
        this.mesh.traverse(c => {
            if (c.material && c.material.emissive) {
                const old = c.material.emissive.getHex();
                c.material.emissive.setHex(0xff0000);
                setTimeout(() => {
                    if (c.material) c.material.emissive.setHex(old);
                }, 50);
            }
        });

        // Update HP Bar
        if (this.unit.hpBar) {
            const scale = Math.max(0, this.hp / this.maxHp);
            this.unit.hpBar.scale.x = scale;
        }

        if (this.hp <= 0) {
            this.dispose();
            return true; // Dead
        }
        return false;
    }

    update(dt) {
        this.unit.update(dt, Date.now() / 1000);
    }

    dispose() {
        this.unit.dispose();
    }
}

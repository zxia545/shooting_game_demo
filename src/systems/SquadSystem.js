import * as THREE from 'three';
import { Unit } from '../entities/Unit.js';

export class SquadSystem {
    constructor(scene, input) {
        this.scene = scene;
        this.input = input;
        this.units = [];
        this.centerPosition = new THREE.Vector3(0, 0, 0);
        this.moveSpeed = 14;
        this.swerveSpeed = 20;
        this.maxSide = 6;

        // Initial Squad
        this.addUnit(0);
    }

    getPosition() {
        return this.centerPosition;
    }

    getUnitCount() {
        // Count weighted by tier: Basic=1, Elite=1, Commander=1, Titan=50, Tank=500
        return this.units.reduce((acc, u) => {
            if (u.tier === 3) return acc + 50;  // Titan = 50
            if (u.tier === 4) return acc + 500; // Tank = 500
            return acc + 1;
        }, 0);
    }

    addUnit(tier = 0) {
        // if (this.titan) return; // Allow adding units even with Titan

        const unit = new Unit(this.scene, this.centerPosition, tier, true);
        this.units.push(unit);
        this.checkMerge();
        this.arrangeUnits();
    }

    removeUnit() {
        if (this.titan) return; // Titan logic separate

        if (this.units.length === 0) return;

        // Remove lowest tier first
        this.units.sort((a, b) => a.tier - b.tier);
        const unit = this.units.shift();
        unit.dispose();
        this.arrangeUnits();
    }

    checkMerge() {
        // Continuous merging system:
        // Every 50 tier-0 (basic) units → 1 tier-3 (Titan) unit
        // Every 10 tier-3 (Titan) units → 1 tier-4 (Tank) unit

        let didMerge = false;

        // Check for Titan → Tank merge (10 Titans = 1 Tank)
        const titans = this.units.filter(u => u.tier === 3);
        if (titans.length >= 10) {
            const toRemove = titans.slice(0, 10);
            toRemove.forEach(u => {
                u.dispose();
                const idx = this.units.indexOf(u);
                if (idx > -1) this.units.splice(idx, 1);
            });

            // Create new Tank
            const tank = new Unit(this.scene, this.centerPosition, 4, true);
            this.units.push(tank);
            console.log("TANK MERGE! (10 Titans → 1 Tank)");
            didMerge = true;
        }

        // Check for Basic → Titan merge (50 Basics = 1 Titan)
        const basics = this.units.filter(u => u.tier === 0);
        if (basics.length >= 50) {
            const toRemove = basics.slice(0, 50);
            toRemove.forEach(u => {
                u.dispose();
                const idx = this.units.indexOf(u);
                if (idx > -1) this.units.splice(idx, 1);
            });

            // Create new Titan
            const titan = new Unit(this.scene, this.centerPosition, 3, true);
            this.units.push(titan);
            console.log("TITAN MERGE! (50 Basics → 1 Titan)");
            didMerge = true;
        }

        // If we merged, check again (might have enough for another merge)
        if (didMerge) {
            this.checkMerge();
        }
    }

    arrangeUnits() {
        if (this.units.length === 0) return;

        // Separate by tier - large units (Titan, Tank) go to back
        const bigUnits = this.units.filter(u => u.tier >= 3); // Titans and Tanks
        const smallUnits = this.units.filter(u => u.tier < 3);

        // Arrange big units at back center
        bigUnits.forEach((u, i) => {
            u.targetLocalPos = { x: (i % 3 - 1) * 2, z: 3 + Math.floor(i / 3) * 4 };
        });

        // Arrange small units in spiral formation
        const spacing = 0.8;
        smallUnits.forEach((u, i) => {
            const angle = i * 2.4;
            const r = 0.5 * spacing * Math.sqrt(i);
            u.targetLocalPos = {
                x: r * Math.cos(angle),
                z: r * Math.sin(angle)
            };
        });
    }

    applyGateEffect(gate) {
        const val = gate.value;
        let diff = 0;

        const currentCount = this.getUnitCount();

        if (gate.type === 'add') {
            diff = val;
        } else if (gate.type === 'multiply') {
            const target = Math.floor(currentCount * val);
            diff = target - currentCount;
        }

        if (diff > 0) {
            for (let i = 0; i < diff; i++) this.addUnit(0);
        } else {
            for (let i = 0; i < Math.abs(diff); i++) this.removeUnit();
        }

        return diff;
    }

    triggerEvolution() {
        // Upgrade all Tier 0 to Tier 1
        let upgraded = false;
        const newUnits = [];
        this.units.forEach(u => {
            if (u.tier === 0) {
                u.dispose();
                const newU = new Unit(this.scene, this.centerPosition, 1, true);
                newUnits.push(newU);
                upgraded = true;
            } else {
                newUnits.push(u);
            }
        });
        this.units = newUnits;

        if (upgraded) this.arrangeUnits();
        return upgraded;
    }

    update(dt, gates, onEvent) {
        // 1. Move Forward
        this.centerPosition.z -= this.moveSpeed * dt;

        // 2. Swerve Control
        const deltaX = this.input.getDeltaX();
        this.centerPosition.x += deltaX * this.swerveSpeed;

        // 3. Clamp
        this.centerPosition.x = Math.max(-this.maxSide, Math.min(this.maxSide, this.centerPosition.x));

        // 4. Gate Collision
        if (gates) {
            for (const gate of gates) {
                if (gate.isDead) continue;

                if (Math.abs(this.centerPosition.z - gate.position.z) < 1.0 &&
                    Math.abs(this.centerPosition.x - gate.position.x) < 3.0) {

                    const diff = this.applyGateEffect(gate);
                    if (onEvent) onEvent('gate', gate.position, diff);

                    gate.dispose();
                }
            }
        }

        // 5. Update Units
        const time = Date.now() / 1000;

        this.units.forEach(u => {
            if (u.targetLocalPos) {
                const tx = this.centerPosition.x + u.targetLocalPos.x;
                const tz = this.centerPosition.z + u.targetLocalPos.z;

                u.mesh.position.x += (tx - u.mesh.position.x) * 5 * dt;
                u.mesh.position.z += (tz - u.mesh.position.z) * 5 * dt;
            }
            u.update(dt, time);
        });
    }
}

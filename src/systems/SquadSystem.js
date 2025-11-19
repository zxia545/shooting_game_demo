import * as THREE from 'three';
import { Unit } from '../entities/Unit.js';

export class SquadSystem {
    constructor(scene, input) {
        this.scene = scene;
        this.input = input;
        this.units = [];
        this.titan = null;
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
        // Weighted count: Titan = 50
        return this.units.reduce((acc, u) => acc + (u.tier === 3 ? 50 : 1), 0);
    }

    addUnit(tier = 0) {
        if (this.titan) return; // No adding units if Titan is active

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
        const mergeThreshold = 50;
        const basics = this.units.filter(u => u.tier === 0);

        if (basics.length >= mergeThreshold) {
            // Remove 50 basics
            let removed = 0;
            const toRemove = [];

            for (const u of basics) {
                if (removed < mergeThreshold) {
                    toRemove.push(u);
                    removed++;
                } else {
                    break;
                }
            }

            toRemove.forEach(u => {
                u.dispose();
                const idx = this.units.indexOf(u);
                if (idx > -1) this.units.splice(idx, 1);
            });

            // Add Titan (Tier 3)
            this.titan = new Unit(this.scene, this.centerPosition, 3, true);
            console.log("TITAN MERGE!");
        }
    }

    arrangeUnits() {
        if (this.units.length === 0) return;

        // Titans go to back center, others swarm
        const titans = this.units.filter(u => u.tier === 3);
        const others = this.units.filter(u => u.tier !== 3);

        // Arrange Titans
        titans.forEach((u, i) => {
            u.targetLocalPos = { x: 0, z: 2 + i * 3 };
        });

        // Arrange Others (Fermat's Spiral)
        const spacing = 0.8;
        others.forEach((u, i) => {
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

        if (this.titan) {
            this.titan.mesh.position.x = this.centerPosition.x;
            this.titan.mesh.position.z = this.centerPosition.z;
            this.titan.update(dt, time);
        }

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

import * as THREE from 'three';

export class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
        this.bulletSpeed = 40;
        this.fireTimer = 0;

        // Bullet Pool
        this.bulletPool = [];
    }

    getBullet() {
        if (this.bulletPool.length > 0) {
            const b = this.bulletPool.pop();
            b.mesh.visible = true;
            return b;
        }
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2),
            new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
        );
        this.scene.add(mesh);
        return { mesh, life: 0, dmg: 1 };
    }

    recycleBullet(b) {
        b.mesh.visible = false;
        this.bulletPool.push(b);
    }

    spawnBullet(x, y, z, size, dmg) {
        const b = this.getBullet();
        b.mesh.position.set(x, y, z);
        b.mesh.scale.setScalar(size / 0.2); // Adjust scale based on base size
        b.dmg = dmg;
        b.life = 1.5;
        this.bullets.push(b);
    }

    update(dt, squadSystem, roadSystem, onEvent) {
        // 1. Shooting Logic
        this.fireTimer += dt;
        if (this.fireTimer > 0.25) {
            this.fireTimer = 0;

            // Squad shoots
            // Titans and Tanks shoot bigger bullets
            const bigUnits = squadSystem.units.filter(u => u.tier >= 3);
            bigUnits.forEach(u => {
                const pos = u.mesh.position;
                const dmg = u.tier === 4 ? 200 : 50; // Tank does more damage
                const size = u.tier === 4 ? 1.5 : 1.0;
                this.spawnBullet(pos.x, pos.y + 1, pos.z - 1, size, dmg);
            });

            // Small units shoot smaller bullets
            const smallUnits = squadSystem.units.filter(u => u.tier < 3);
            smallUnits.forEach(u => {
                if (Math.random() > 0.3) { // Stagger fire
                    const pos = u.mesh.position;
                    const dmg = u.config.dmg;
                    this.spawnBullet(pos.x, pos.y + 0.8, pos.z - 0.5, 0.2, dmg);
                }
            });
        }

        // 2. Update Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.mesh.position.z -= this.bulletSpeed * dt; // Move forward (-Z)
            b.life -= dt;

            if (b.life <= 0) {
                this.recycleBullet(b);
                this.bullets.splice(i, 1);
                continue;
            }

            let hit = false;

            // Hit Enemies
            for (const e of roadSystem.enemies) {
                if (Math.abs(e.position.z - b.mesh.position.z) < 1.5 &&
                    Math.abs(e.position.x - b.mesh.position.x) < 1.0) {

                    const dead = e.hit(b.dmg);
                    if (dead) {
                        const idx = roadSystem.enemies.indexOf(e);
                        if (idx > -1) roadSystem.enemies.splice(idx, 1);
                        if (onEvent) onEvent('kill', e.position, 5);
                    }
                    hit = true;
                    break;
                }
            }

            // Hit Gates
            if (!hit) {
                for (const g of roadSystem.gates) {
                    if (Math.abs(g.position.z - b.mesh.position.z) < 1.0 &&
                        Math.abs(g.position.x - b.mesh.position.x) < 3.0) {

                        g.hit();
                        hit = true;
                        break;
                    }
                }
            }

            // Hit Boxes
            if (!hit) {
                for (const box of roadSystem.boxes) {
                    if (box.active && Math.abs(box.position.z - b.mesh.position.z) < 2.0 &&
                        Math.abs(box.position.x - b.mesh.position.x) < 2.0) {

                        const destroyed = box.hit(b.dmg);
                        if (destroyed) {
                            squadSystem.triggerEvolution();
                            if (onEvent) onEvent('upgrade', box.position);
                        }
                        hit = true;
                        break;
                    }
                }
            }

            if (hit) {
                this.recycleBullet(b);
                this.bullets.splice(i, 1);
            }
        }

        // 3. Squad Collisions (Enemies)
        const squadPos = squadSystem.getPosition();
        for (let i = roadSystem.enemies.length - 1; i >= 0; i--) {
            const e = roadSystem.enemies[i];

            // Ignore enemies behind the squad (z > squadPos.z)
            // Squad moves -Z. Enemies at -100 are ahead. Enemies at 0 are behind.
            // So if e.z > squadPos.z + 2, it's behind.
            if (e.position.z > squadPos.z + 2) continue;

            if (Math.abs(e.position.z - squadPos.z) < 1.5 &&
                Math.abs(e.position.x - squadPos.x) < 2.0) {

                // Collision!
                // Remove units
                squadSystem.removeUnit();
                squadSystem.removeUnit();
                squadSystem.removeUnit();

                e.dispose();
                roadSystem.enemies.splice(i, 1);

                if (onEvent) onEvent('damage', squadPos);
            }
        }
    }
}

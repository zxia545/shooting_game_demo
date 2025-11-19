import * as THREE from 'three';

export class Unit {
    constructor(scene, position, tier = 0, isPlayer = true) {
        this.scene = scene;
        this.tier = tier;
        this.isPlayer = isPlayer;
        this.isDead = false;

        // Config based on tier
        this.config = this.getTierConfig(tier);

        this.mesh = this.createMesh();
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);

        // Animation state
        this.animOffset = Math.random() * 100;
    }

    getTierConfig(tier) {
        const tiers = [
            { scale: 1.0, color: 0xFFFF00, hp: 1, dmg: 1 },      // 0: Basic (Yellow)
            { scale: 1.3, color: 0xFFA500, hp: 5, dmg: 5 },      // 1: Elite (Orange)
            { scale: 1.6, color: 0xFF0000, hp: 20, dmg: 20 },    // 2: Commander (Red)
            { scale: 3.0, color: 0x00FFFF, hp: 100, dmg: 100 }   // 3: TITAN (Cyan)
        ];
        // Enemy overrides
        if (!this.isPlayer) {
            return {
                scale: 1.0 + tier * 0.5,
                color: 0xef4444, // Reddish for enemies
                hp: 10 + tier * 10,
                dmg: 1
            };
        }
        return tiers[Math.min(tier, tiers.length - 1)];
    }

    createMesh() {
        const group = new THREE.Group();
        const { scale, color } = this.config;

        const matBody = new THREE.MeshLambertMaterial({ color: color });
        const matDark = new THREE.MeshLambertMaterial({ color: 0x111111 }); // Gun/Vest

        group.scale.setScalar(scale);

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), matDark);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), matBody);
        head.position.y = 1.55;
        head.castShadow = true;
        group.add(head);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const lArm = new THREE.Mesh(armGeo, matBody);
        lArm.position.set(-0.35, 1.1, 0);
        group.add(lArm);

        const rArm = new THREE.Mesh(armGeo, matBody);
        rArm.position.set(0.35, 1.1, 0);

        // Gun attached to right arm (only for player or armed enemies)
        if (this.isPlayer) {
            const gun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.6), matDark);
            gun.position.set(0, -0.2, 0.3);
            rArm.add(gun);
            rArm.rotation.x = -Math.PI / 2;
        }
        group.add(rArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
        const lLeg = new THREE.Mesh(legGeo, matDark);
        lLeg.position.set(-0.15, 0.3, 0);
        group.add(lLeg);
        const rLeg = new THREE.Mesh(legGeo, matDark);
        rLeg.position.set(0.15, 0.3, 0);
        group.add(rLeg);

        // Store references for animation
        group.userData = { lLeg, rLeg, rArm, lArm };

        // Titan Glow
        if (this.tier === 3 && this.isPlayer) {
            const light = new THREE.PointLight(0x00FFFF, 2, 10);
            light.position.y = 2;
            group.add(light);
        }

        // HP Bar for enemies
        if (!this.isPlayer) {
            // Simple HP Bar
            const bgGeo = new THREE.PlaneGeometry(1, 0.1);
            const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const bg = new THREE.Mesh(bgGeo, bgMat);
            bg.position.y = 2.2;
            group.add(bg);

            const hpGeo = new THREE.PlaneGeometry(1, 0.1);
            const hpMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            this.hpBar = new THREE.Mesh(hpGeo, hpMat);
            this.hpBar.position.y = 2.2;
            this.hpBar.position.z = 0.01;
            group.add(this.hpBar);
        }

        return group;
    }

    update(dt, time) {
        // Walking Animation
        const t = time * 15;
        const ud = this.mesh.userData;
        const rot = Math.sin(t + this.animOffset) * 0.5;

        if (ud.lLeg) ud.lLeg.rotation.x = rot;
        if (ud.rLeg) ud.rLeg.rotation.x = -rot;
        if (ud.lArm) ud.lArm.rotation.x = -rot;
        if (ud.rArm && !this.isPlayer) ud.rArm.rotation.x = rot; // Player arm is fixed for gun
    }

    dispose() {
        this.isDead = true;
        this.scene.remove(this.mesh);
    }
}

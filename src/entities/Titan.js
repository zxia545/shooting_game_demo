import * as THREE from 'three';

export class Titan {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.isDead = false;

        // Titan Model - Bigger, cooler
        this.mesh = new THREE.Group();

        // Body
        const bodyGeo = new THREE.BoxGeometry(1.5, 3.0, 1.0);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x004444 }); // Cyan + Glow
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.y = 1.5;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Head
        const headGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.head = new THREE.Mesh(headGeo, headMat);
        this.head.position.y = 3.5;
        this.head.castShadow = true;
        this.mesh.add(this.head);

        // Arms (Cannons)
        const armGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.5);
        const armMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        this.leftArm = new THREE.Mesh(armGeo, armMat);
        this.leftArm.rotation.x = Math.PI / 2;
        this.leftArm.position.set(-1.2, 2.5, 0.5);
        this.mesh.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeo, armMat);
        this.rightArm.rotation.x = Math.PI / 2;
        this.rightArm.position.set(1.2, 2.5, 0.5);
        this.mesh.add(this.rightArm);

        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    update(dt) {
        if (this.isDead) return;

        // Stomp animation
        const time = performance.now() / 1000;
        this.mesh.position.y = Math.abs(Math.sin(time * 5)) * 0.2;

        // Arms recoil
        this.leftArm.position.z = 0.5 + Math.sin(time * 10) * 0.2;
        this.rightArm.position.z = 0.5 + Math.cos(time * 10) * 0.2;
    }

    dispose() {
        this.scene.remove(this.mesh);
        this.isDead = true;
    }
}

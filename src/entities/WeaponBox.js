import * as THREE from 'three';

export class WeaponBox {
    constructor(scene, z) {
        this.scene = scene;
        this.hp = 20;
        this.maxHp = 20;
        this.active = true;

        this.laneWidth = 16;

        this.mesh = this.createMesh();
        // Always Left
        this.mesh.position.set(-this.laneWidth / 3, 0, z);
        this.scene.add(this.mesh);
    }

    get position() {
        return this.mesh.position;
    }

    createMesh() {
        const group = new THREE.Group();

        // Crate
        const boxGeo = new THREE.BoxGeometry(3, 3, 3);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B }); // Orange
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.y = 1.5;
        group.add(box);

        // Question Mark Texture
        const qTex = this.createTextTexture("?", "#F59E0B", false);
        box.material.map = qTex;

        // HP Text above
        this.hpTex = this.createTextTexture("20", "#000000", true);
        const hpMat = new THREE.MeshBasicMaterial({ map: this.hpTex, transparent: true });
        this.hpMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hpMat);
        this.hpMesh.position.set(0, 4.5, 0);
        group.add(this.hpMesh);

        return group;
    }

    createTextTexture(text, color, isTextOnly) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        if (!isTextOnly) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 256, 256);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 10;
            ctx.strokeRect(5, 5, 246, 246);
        }

        ctx.fillStyle = isTextOnly ? 'white' : 'white';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
        ctx.strokeText(text, 128, 128);
        ctx.fillText(text, 128, 128);

        return new THREE.CanvasTexture(canvas);
    }

    hit(dmg) {
        if (!this.active) return;

        this.hp -= dmg;

        // Scale effect
        this.mesh.scale.setScalar(1.1);
        setTimeout(() => {
            if (this.mesh) this.mesh.scale.setScalar(1.0);
        }, 50);

        // Update HP Text
        const displayHp = Math.max(0, Math.ceil(this.hp));
        this.hpMesh.material.map = this.createTextTexture(displayHp.toString(), "#000000", true);

        if (this.hp <= 0) {
            this.active = false;
            this.dispose();
            return true; // Destroyed
        }
        return false;
    }

    dispose() {
        this.active = false;
        this.scene.remove(this.mesh);
    }
}

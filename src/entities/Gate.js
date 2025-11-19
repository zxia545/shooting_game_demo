import * as THREE from 'three';

export class Gate {
    constructor(scene, z, value, isLeft) {
        this.scene = scene;
        this.value = value;
        this.isLeft = isLeft;
        this.isDead = false;
        this.type = value >= 0 ? 'add' : 'add'; // Simplify to add/sub for now, can add multiply later if needed
        // Or detect multiply if value is float? For now integer add/sub.

        // Config
        this.laneWidth = 16; // Match CONFIG.laneWidth

        this.mesh = this.createMesh();
        this.mesh.position.set(isLeft ? -this.laneWidth / 4 : this.laneWidth / 4, 0, z);
        this.scene.add(this.mesh);
    }

    get position() {
        return this.mesh.position;
    }

    createMesh() {
        const group = new THREE.Group();
        const isGood = this.value > 0;
        const colorHex = isGood ? 0x3b82f6 : 0xef4444; // Blue / Red

        // 1. Neon Glass Frame
        const frameGeo = new THREE.PlaneGeometry(6, 8);
        const frameMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.glassMat = frameMat;
        const glass = new THREE.Mesh(frameGeo, frameMat);
        glass.position.y = 4;
        group.add(glass);

        // 2. Solid Borders
        const borderGeo = new THREE.BoxGeometry(6.2, 0.5, 0.5);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const topB = new THREE.Mesh(borderGeo, borderMat); topB.position.y = 8;
        const botB = new THREE.Mesh(borderGeo, borderMat); botB.position.y = 0;
        group.add(topB); group.add(botB);

        const sideGeo = new THREE.BoxGeometry(0.5, 8, 0.5);
        const lB = new THREE.Mesh(sideGeo, borderMat); lB.position.set(-3, 4, 0);
        const rB = new THREE.Mesh(sideGeo, borderMat); rB.position.set(3, 4, 0);
        group.add(lB); group.add(rB);

        // 3. Text
        this.textMesh = this.createTextMesh();
        this.textMesh.position.set(0, 4, 0.5);
        group.add(this.textMesh);

        return group;
    }

    createTextMesh() {
        const signStr = this.value > 0 ? `+${this.value}` : `${this.value}`;
        const tex = this.createTextTexture(signStr);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        return new THREE.Mesh(new THREE.PlaneGeometry(5, 5), mat);
    }

    createTextTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, 512, 512);

        // Text
        ctx.fillStyle = 'white';
        ctx.font = '900 250px Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Stroke
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 30;
        ctx.strokeText(text, 256, 256);
        ctx.fillText(text, 256, 256);

        return new THREE.CanvasTexture(canvas);
    }

    updateVisuals() {
        const isGood = this.value > 0;
        const colorHex = isGood ? 0x3b82f6 : 0xef4444;
        this.glassMat.color.setHex(colorHex);

        const signStr = this.value > 0 ? `+${this.value}` : `${this.value}`;
        this.textMesh.material.map = this.createTextTexture(signStr);
    }

    hit() {
        this.value += 1;
        this.updateVisuals();
    }

    dispose() {
        this.isDead = true;
        this.scene.remove(this.mesh);
    }
}

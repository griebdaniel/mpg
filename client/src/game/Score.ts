import * as THREE from 'three';
import { Vector3 } from 'three';

export class Score extends THREE.Mesh {
    lifeSpan = 1000;
    age = 0;

    constructor(private score: number, private pos: Vector3) {
        super();

        const loader = new THREE.FontLoader();

        loader.load('fonts/gentilis_regular.typeface.json', font => {
            const color = 0x006699;

            const matPositive = new THREE.MeshBasicMaterial({
                color: 'green',
                transparent: true,
                
                side: THREE.DoubleSide
            });

            const matNegative = new THREE.MeshBasicMaterial({
                color: 'red',
                transparent: true,
                side: THREE.DoubleSide
            });

            const shapes = font.generateShapes(score < 0 ? `${score}` : `+${score}`, 100);
            const geometry = new THREE.ShapeGeometry(shapes);
            geometry.computeBoundingBox();

            // geometry.translate

            const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            const yMid = - 0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
            geometry.translate(xMid, yMid, 0);


            this.material = score > 0 ? matPositive : matNegative;

            geometry.translate(pos.x, pos.y, pos.z);

            this.scale.set(0.001, 0.001, 1);

            this.position.set(pos.x, pos.y, pos.z);

            this.geometry = geometry;
        });
    }

    update(time) {
        this.age += time;
        (this.material as any).opacity = 0.7 - (this.age / this.lifeSpan) * 0.7;
    }


}
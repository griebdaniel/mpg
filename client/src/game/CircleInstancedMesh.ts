import { CircleBufferGeometry, Color, InstancedMesh, Matrix4, MeshBasicMaterial, Vector3 } from 'three';

interface Target {
  position: Vector3;
  size: number;
}

interface Click extends Target {
  opacity: number;
}

interface Circle {
  position: Vector3;
  size: number;
  color: Color;
}

class CircleInstancedMesh extends InstancedMesh {
  circles: Circle[] = [];
  constructor() {
    super(new CircleBufferGeometry(1, 50), new MeshBasicMaterial(), 200);
    this.setColorAt(0, new Color());  // not setting color in constructor couses the colors to not update correctly.
    // this.instanceColor.needsUpdate = true;
  }

  update(circles: Circle[]) {
    circles.forEach((circle, i) => {
      const matrix = new Matrix4();
      matrix.setPosition(circle.position);
      matrix.scale(new Vector3(circle.size, circle.size, 1));
      this.setMatrixAt(i, matrix);
      this.setColorAt(i, circle.color);
    });

    for (let i = circles.length; i < this.count; i++) {
      const matrix = new Matrix4();
      this.getMatrixAt(i, matrix);
      const scale = new Vector3();
      scale.setFromMatrixScale(matrix);
      if (scale.x === 0) {
        break;
      }
      matrix.scale(new Vector3(0, 0, 0));
      this.setMatrixAt(i, matrix);
    }
    
    this.instanceMatrix.needsUpdate = true;
    this.instanceColor.needsUpdate = true;
  }
}

export default CircleInstancedMesh;
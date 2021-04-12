import { MathUtils as ThreeMath, BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, LineBasicMaterial, Matrix4, MeshBasicMaterial, PlaneGeometry, Vector3, Group } from 'three';

interface Target {
  position: Vector3;
  size: number;
  direction: Vector3;
  speed: number;
}

interface Line {
  position: Vector3;
  length: number;
  angle: number;
}

interface Triangle {
  position: Vector3;
  length: number;
  angle: number;
}

const lineGeometry = new BufferGeometry();
const lineWidth = 0.07;
const vertices = new Float32Array([
  0,  lineWidth / 2, 0,
  0, -lineWidth / 2, 0,
  1, -lineWidth / 2, 0,

  0,  lineWidth / 2, 0,
  1,  lineWidth / 2, 0,
  1, -lineWidth / 2, 0,
]);
lineGeometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );

class LineInstancedMesh extends InstancedMesh {
  constructor() {
    super(
      lineGeometry,
      new MeshBasicMaterial({ color: 0xff0000, side: DoubleSide  }),
      200
    );
  }
  update(lines: Line[]) {
    lines.forEach((line, i) => {
      const matrix = new Matrix4();
      matrix.makeRotationAxis(new Vector3(0, 0, 1), line.angle);
      matrix.scale(new Vector3(line.length, 0.2, 1));
      matrix.setPosition(line.position);
      
      this.setMatrixAt(i, matrix);
    });

    for (let i = lines.length; i < this.count; i++) {
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
  }
}

class TriangleInstancedMesh extends InstancedMesh {
  constructor() {
    super(
      new BufferGeometry().setFromPoints([new Vector3(0, 0.5, 0), new Vector3(0, -0.5, 0), new Vector3(1, 0, 0)]),
      new MeshBasicMaterial({ color: 0xff0000, side: DoubleSide }),
      200
    );
  }
  update(triangles: Triangle[]) {
    triangles.forEach((triangle, i) => {
      const matrix = new Matrix4();
      matrix.makeRotationAxis(new Vector3(0, 0, 1), triangle.angle);
      matrix.setPosition(triangle.position);
      matrix.scale(new Vector3(0.06, 0.06, 1));
      this.setMatrixAt(i, matrix);
    });

    for (let i = triangles.length; i < this.count; i++) {
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
  }
}

export class DirectionInstancedMesh extends Group {
  lines = new LineInstancedMesh();
  triangles = new TriangleInstancedMesh();

  constructor() {
    super();
    this.add(this.lines, this.triangles);
  }

  update(targets: Target[]) {
    const lines: Line[] = [];
    const triangles: Triangle[] = [];

    targets.forEach(target => {
      let angle = target.direction.angleTo(new Vector3(1, 0, 0));
      if (target.direction.y < 0) {
        angle = -angle;
      }
      lines.push({ position: target.position.clone(), length: target.speed - 0.06, angle });
      triangles.push({ position: target.position.clone().add(target.direction.clone().multiplyScalar(target.speed - 0.06)), length: target.speed * 0.2, angle });
    });

    this.lines.update(lines);
    this.triangles.update(triangles);
  }
}

export default DirectionInstancedMesh;

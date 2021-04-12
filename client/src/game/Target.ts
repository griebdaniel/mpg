/* eslint-disable no-self-assign */
import { Mesh, Vector3, CircleGeometry, MeshBasicMaterial, Color } from 'three';
import _ from 'lodash';
import { ThreeSixty } from '@material-ui/icons';

const circleGeomety = new CircleGeometry(1, 50);
const circleMaterial = new MeshBasicMaterial({ color: new Color(0x143170) });

export interface TargetSettings {
  duration?: number;
  speed?: number;
  position?: Vector3;
  maxSize?: number;
  direction?: Vector3;
}

export class Target extends Mesh {
  maxSize = 50;
  sizeChangeValue = 0;
  size = 0;
  duration = 4;
  speed = 200;
  direction = new Vector3(1, 1, 0).normalize();

  private savedSizeCangeValue = 0;
  private savedPosition = new Vector3(0, 0, 0);
  private savedDirection = new Vector3(0, 0, 0);
  private savedSize = 0;

  constructor(settings?: TargetSettings) {
    super();

    this.geometry = circleGeomety;
    this.material = circleMaterial;

    this.setSettings(settings);
  }

  reset(): void {
    this.sizeChangeValue = 0;
    this.size = 0;
  }

  updatePosition(time: number): void {
    const distance = time * (this.speed / 1000);
    this.position.add(this.direction.clone().multiplyScalar(distance));
  }

  getPosition(time?: number): Vector3 {
    return this.direction.clone().multiplyScalar(time * (this.speed / 1000));
  }

  updateSize(time: number): void {
    this.savedSize = this.size;
    this.sizeChangeValue += time / this.duration;
    this.size = this.sizeChangeFunction(this.sizeChangeValue) * this.maxSize;
    this.size = Math.max(1e-5, this.size);
    this.scale.set(this.size, this.size, 1);
  }

  getSize(time?: number): number {
    return this.sizeChangeFunction(this.sizeChangeValue + time / this.duration) * this.maxSize;
  }

  saveState() {
    this.savedSizeCangeValue = this.sizeChangeValue;
    this.savedPosition = this.position.clone();
    this.savedDirection = this.direction.clone();
  }

  restoreState() {
    this.sizeChangeValue = this.savedSizeCangeValue;
    this.size = this.savedSize;
    this.scale.set(this.size, this.size, 1);
    this.position.set(this.savedPosition.x, this.savedPosition.y, this.savedPosition.z);
    this.direction = this.savedDirection;
  }

  sizeChangeFunction = (x: number) => {
    if (x < 0) {
      return 0;
    }
    if (x > 1) {
      return 1;
    }
    return 1 - Math.abs(2 * x - 1);
  }

  setSettings(settings: TargetSettings) {
    _.forOwn(settings, (value: any, key) => {
      if (key === 'position') {
        this[key].set(value.x, value.y, 0);
      } else {
        this[key] = value;
      }
    });
  }

}
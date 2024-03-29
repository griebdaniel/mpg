import _ from 'lodash';
import { Color, Vector3 } from 'three';

export interface Circle {
  size: number;
  position: Vector3;
  color: Color;
}

export interface TargetSettings {
  duration?: number;
  speed?: number;
  position?: Vector3;
  maxSize?: number;
  age?: number;
  direction?: Vector3;
  color?: Color;
}

export class Target implements Circle {
  maxSize = 0.2;
  age = 0;
  size = 0;
  duration = 4000;
  speed = 200;
  position = new Vector3();
  direction =  new Vector3(_.random(-1, 1, true), _.random(-1, 1, true), 0).normalize();
  color = new Color('#08415d');

  constructor(settings?: TargetSettings) {
    this.setSettings(settings);
    this.size = this.getSize(0);
  }

  reset(): void {
    this.age = 0;
  }

  updatePosition(time: number): void {
    this.position = this.getPosition(time);
  }

  getPosition(time?: number): Vector3 {
    return this.position.clone().add(this.direction.clone().multiplyScalar(time * (this.speed / 1000)));
  }

  updateSize(time: number): void {
    this.size = this.getSize(time);
  }

  getSize(time?: number): number {
    if (!time) {
      time = 0;
    }
    if (this.age + time > this.duration) {
      return 0;
    }
    if (this.duration === Infinity) {
      return this.maxSize;
    }
    return this.sizeChangeFunction((this.age + time) / this.duration) * this.maxSize;
  }

  updateAge(time: number): void {
    this.age += time;
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
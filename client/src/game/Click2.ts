import { Color, Vector3 } from 'three';
import _ from 'lodash';
import { Circle } from './Target2';


export interface ClickSettings {
  position?: Vector3;
  maxSize?: number;
  duration?: number;
  backgroundColor?: Color;
  baseColor?: Color;
}

export class Click implements Circle {
  position = new Vector3(0, 0, 0);
  age: number = 0;
  duration: number = 500;
  maxSize: number = 0.2;
  size: number = 0;
  opacity: number = 1;
  baseColor = new Color('red');
  backgroundColor = new Color('white');
  color = this.baseColor.clone();

  constructor(settings?: ClickSettings) {
    this.setSettings(settings);
  }

  get sizeDistribution() {
    return (x: number): number => {
      if (x < 0) {
        return 0;
      }
      if (x > 1) {
        return 1;
      }
      return x;
    };
  }

  get opacityDistribution() {
    return (x: number): number => {
      if (x < 0) {
        return 1;
      }
      if (x > 1) {
        return 0;
      }
      return 1 - x;
    };
  }

  update(time: number): void {
    this.age += time;
    this.size = this.sizeDistribution(this.age / this.duration) * this.maxSize;
    this.opacity = this.opacityDistribution(this.age / this.duration);
    const rgb1 = new Vector3(this.baseColor.r, this.baseColor.g, this.baseColor.b);
    const rgb2 = new Vector3(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b);
    const rgb3 = rgb2.add(rgb1.sub(rgb2).multiplyScalar(this.opacity));
    this.color = new Color(rgb3.x, rgb3.y, rgb3.z);
  }

  setSettings(settings: ClickSettings) {
    _.forOwn(settings, (value, key) => this[key] = value);
  }
}
import { Vector3 } from 'three';
import { Target } from './Target2';
import _ from 'lodash';

export class GamePhysics {
  width: number;
  height: number;
  targets: Target[];

  update(time: number): void {  
    this.targets.forEach(target => this.updatePosition(target, time));
    this.targets.forEach(target => this.updateSize(target, time));
  }
  
  updatePosition(target: Target, time: number) {
    const preUpdatePosition = target.position.clone();
    target.updatePosition(time);
    if (this.handleCollision(target)) {
      target.position = preUpdatePosition;
    }
  }
  
  handleCollision(target: Target) {
    if (Math.abs(target.position.x) + target.size - this.width / 2 > 0) {
      target.direction = new Vector3(-target.direction.x, target.direction.y, 0).normalize();
      return true;
    }
    if (Math.abs(target.position.y) + target.size - this.height / 2 > 0) {
      target.direction = new Vector3(target.direction.x, -target.position.y, 0).normalize();
      return true;
    }
    for (let i = 0; i < this.targets.length; i++) {
      const target2 = this.targets[i];
      if (target === target2) {
        continue;
      }
      if (target.size + target2.size - target.position.distanceTo(target2.position) > 0) {
        const v1 = target.direction.clone();
        const v2 = target2.direction.clone();
        const x1 = target.position.clone();
        const x2 = target2.position.clone();
        const d1 = v1.clone().sub(x1.clone().sub(x2).multiplyScalar(v1.clone().sub(v2).dot(x1.clone().sub(x2)) / Math.pow(x1.clone().sub(x2).length(), 2)));
        const d2 = v2.clone().sub(x2.clone().sub(x1).multiplyScalar(v2.clone().sub(v1).dot(x2.clone().sub(x1)) / Math.pow(x2.clone().sub(x1).length(), 2)));
        target.direction = d1.normalize();
        target2.direction = d2.normalize();
        return true;
      }
    }
    return false;
  }

  updateSize(target: Target, time: number) {
    const preUpdateSize = target.size;
    target.updateSize(time);
    if (this.separateTarget(target)) {
      target.updateAge(time);
    } else {
      target.size = preUpdateSize;
    }
  }
  
  separateTarget(target: Target) {
    type SeparateTarget = Target & { separateCount: number, originalPosition: Vector3 };
    let updatedTargets = [target] as SeparateTarget[];
    let separable = true;
  
    while (separable) {
      if (updatedTargets.length === 0) {
        break;
      }
      
      const targetsToSeparate = _.uniq([...updatedTargets]);
      updatedTargets = [];
  
      for (const target of [...targetsToSeparate]) {
        if (!target.separateCount) {
          target.separateCount = 1;
        }
        if (!target.originalPosition) {
          target.originalPosition = target.position.clone();
        }
        if (target.separateCount++ > 2) {
          separable = false;
          break;
        }
        const xdiff = Math.abs(target.position.x) + target.size - this.width / 2;
        if (xdiff > 0) {
          target.position.x -= (xdiff) * Math.sign(target.position.x);
          updatedTargets.push(target);
        }
        const ydiff = Math.abs(target.position.y) + target.size - this.height / 2;
        if (ydiff > 0) {
          target.position.y -= (ydiff) * Math.sign(target.position.y);
          updatedTargets.push(target);
        }
        for (const target2 of this.targets as SeparateTarget[]) {
          if (target === target2) {
            continue;
          }
          const overlapSize = target.size + target2.size - target.position.distanceTo(target2.position);
          if (overlapSize > 0) {
            if (!target2.originalPosition) {
              target2.originalPosition = target2.position.clone();
            }
            const v1 = target2.position.clone().sub(target.position).normalize().multiplyScalar(overlapSize + 1e-10);
            target2.position.add(v1);
            updatedTargets.push(target2);
          }
        }
      }
    }
    (this.targets as SeparateTarget[]).forEach((target, i) => {
      if (!separable && target.originalPosition) {
        target.position = target.originalPosition;
      }
      delete target.originalPosition;
      delete target.separateCount;
    });
  
    return separable;
  }
}

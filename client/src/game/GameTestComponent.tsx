import React, { RefObject, ReactNode } from 'react';

import * as Three from 'three';
import { PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';
import { Target } from './Target2';
import './GameComponent.css';
import GameScene from './GameScene';
import GameComponent from './GameComponent';

interface Props {
  onTargetClick?: (target: Target, position: Vector3) => void;
  onBackgroundClick?: (position: Vector3) => void;
  onTargetDrag?: (target: Target, dragVector: Vector3) => void;
  onDirectionDrag?: (target: Target, dragVector: Vector3) => void;
  onClick?: (position: Vector3) => void
}


class GameTestComponent extends GameComponent {


  private selectedTarget: Target;
  private shouldDragTarget = false;
  private shouldDragDirection = false;
  private shouldDragSize = false;

  mouseDownPosition: Vector3;
  previousMousePosition: Vector3;

  onMouseDown = (event: React.MouseEvent): void => {
    const mousePosition = this.previousMousePosition = this.mouseDownPosition = this.clickToScenePos(event.pageX, event.pageY);
    this.selectedTarget = this.game.getTargetAt(mousePosition);



    for (const target of this.game.targets) {
      const directionEnd = target.position.clone().add(target.direction.clone().normalize().multiplyScalar(target.speed));
      if (mousePosition.distanceTo(directionEnd) < this.pxToScene(20)) {
        this.selectedTarget = target;
        this.shouldDragDirection = true;
        return;
      }
      if (mousePosition.distanceTo(target.position) > target.size - this.pxToScene(5) && mousePosition.distanceTo(target.position) < target.size + this.pxToScene(5)) {
        this.selectedTarget = target;
        this.shouldDragSize = true;
        return;
      }
    }

    if (this.selectedTarget) {
      this.shouldDragTarget = true;
    }
  }


  onMouseMove = (event: React.MouseEvent): void => {
    const currentMousePosition = this.clickToScenePos(event.pageX, event.pageY);

    if (this.shouldDragTarget || this.shouldDragDirection) {
      const dragVec = currentMousePosition.clone().sub(this.previousMousePosition);
      if (this.shouldDragTarget && this.props.onTargetDrag) {
        this.props.onTargetDrag(this.selectedTarget, dragVec);
      }
      if (this.shouldDragDirection && this.props.onDirectionDrag) {
        this.props.onDirectionDrag(this.selectedTarget, dragVec);
      }
      // if (this.shouldDragSize && this.props.onSizeDrag) {
      //   this.props.onSizeChange();
      // }
    }

    this.previousMousePosition = currentMousePosition;
  }

  onClick = (event: React.MouseEvent): void => {
    super.onClick(event);
    this.shouldDragTarget = false;
    this.shouldDragDirection = false;
  }

  render(): ReactNode {
    return (
      <canvas
        ref={this.canvasRef}
        onClick={this.onClick}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
      >
      </canvas>
    );
  }

}

export default GameComponent;

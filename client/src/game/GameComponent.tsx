import React, { RefObject, ReactNode } from 'react';

import * as Three from 'three';
import { PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';
import { Target } from './Target2';
import './GameComponent.css';
import GameScene from './GameScene';

interface Props {
  onTargetClick?: (target: Target, position: Vector3) => void;
  onBackgroundClick?: (position: Vector3) => void;
  onTargetDrag?: (target: Target, dragVector: Vector3) => void;
  onDirectionDrag?: (target: Target, dragVector: Vector3) => void;
  onClick?: (position: Vector3) => void
}

class GameComponent extends React.Component<Props> {
  game: GameScene;
  canvasRef: RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement

  renderer: WebGLRenderer;
  camera: PerspectiveCamera;

  lastUpdateTime = null;
  paused = false;

  constructor(props: Props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount(): void {
    this.canvas = this.canvasRef.current;
    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.camera = new PerspectiveCamera(50, this.canvas.width / this.canvas.height, 0.1, 2000);
    this.camera.position.z = 5;

    this.game = new GameScene();

    this.onWindowResize();
    window.onresize = this.onWindowResize;
    window.addEventListener('beforeunload', this.cleanup);
    this.renderer.setAnimationLoop(this.animate);

    this.onClick.bind(this);
  }

  componentWillUnmount(): void {
    this.renderer.setAnimationLoop(null);
    this.cleanup();
  }

  cleanup() {
    this.game.cleanup();
  }

  animate = (time?: number): void => {
    if (this.lastUpdateTime === null) {
      this.lastUpdateTime = time ? time : null;
      return;
    }

    if (!this.paused) {
      this.game.update(time - this.lastUpdateTime);
    }

    this.renderer.render(this.game, this.camera);
    this.lastUpdateTime = time;
  }

  reset(): void {
    this.game.reset();
    this.renderer.setAnimationLoop(null);
    this.renderer.setAnimationLoop(this.animate);
  }

  stop(): void {
    this.lastUpdateTime = null;
    this.renderer.setAnimationLoop(null);
  }

  start(): void {
    this.renderer.setAnimationLoop(this.animate);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  onWindowResize = (): void => {
    const canvasWidth = this.canvas.parentElement.clientWidth;
    const canvasHeight = this.canvas.parentElement.clientHeight;

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    this.camera.aspect = canvasWidth / canvasHeight;
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.camera.updateProjectionMatrix();

    const height = 2 * Math.tan(Three.MathUtils.degToRad(this.camera.fov) / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.game.width = width;
    this.game.height = height;
  }

  clickToScenePos(clickX: number, clickY: number): Vector3 {
    const canvasLeft = this.canvas.offsetLeft;
    const canvasTop = this.canvas.offsetTop;

    const canvasPosX = clickX - canvasLeft;
    const canvasPosY = clickY - canvasTop;

    return new Vector3(
      this.pxToScene(canvasPosX - this.canvas.width / 2),
      -1 * this.pxToScene(canvasPosY - this.canvas.height / 2),
      0
    );
  }

  pxToScene(value: number): number {
    return value / this.canvasSceneRatio;
  }

  sceneToPx(value: number): number {
    return value * this.canvasSceneRatio;
  }

  get canvasSceneRatio() {
    return this.canvas.width / this.game.width;
  }

  onClick(event: React.MouseEvent) {
    const position = this.clickToScenePos(event.pageX, event.pageY);
    const target = this.game.getTargetAt(position);

    if (target) {
      if (this.props.onTargetClick) {
        this.props.onTargetClick(target, position);
      }
    } else {
      if (this.props.onBackgroundClick) {
        this.props.onBackgroundClick(position);
      }
    }
  }

  render(): ReactNode {
    return (
      <canvas
        ref={this.canvasRef}
    
      >
      </canvas>
    );
  }

}

export default GameComponent;

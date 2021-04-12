import React, { RefObject, ReactNode } from 'react';

import * as Three from 'three';
import { PerspectiveCamera, WebGLRenderer, Vector3, Scene } from 'three';
import './GameComponent.css';

class Game {
  scene = new Scene();
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;

  width: number;
  height: number;
  lastUpdateTime = null;
  paused = false;


  constructor(
    public canvas: HTMLCanvasElement,
    public onAnimate: (time: number) => void,
    public onResize: (width: number, height: number) => void
  ) {
    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.camera = new PerspectiveCamera(50, this.canvas.width / this.canvas.height, 0.1, 2000);
    this.camera.position.z = 5;

    this.windowResize();
    window.onresize = this.windowResize;
  }

  animate = (time?: number): void => {
    if (this.lastUpdateTime === null) {
      this.lastUpdateTime = time ? time : null;
      return;
    }
    this.renderer.render(this.scene, this.camera);
    this.onAnimate(time - this.lastUpdateTime);
    this.lastUpdateTime = time;
  }

  add(...objects: Three.Object3D[]) {
    this.scene.add(...objects);

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

  windowResize = (): void => {
    const canvasWidth = this.canvas.parentElement.clientWidth;
    const canvasHeight = this.canvas.parentElement.clientHeight;

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    this.camera.aspect = canvasWidth / canvasHeight;
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.camera.updateProjectionMatrix();

    this.height = 2 * Math.tan(Three.MathUtils.degToRad(this.camera.fov) / 2) * this.camera.position.z;
    this.width = this.height * this.camera.aspect;

    this.onResize(this.width, this.height);
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
    return this.canvas.width / this.width;
  }
}

export default Game;

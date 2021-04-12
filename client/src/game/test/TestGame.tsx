import React from 'react';
import CircleInstancedMesh from '../CircleInstancedMesh';
import Game from '../Game';
import { GamePhysics } from '../GamePhysics';
import { Target } from '../Target2';
import _ from 'lodash';
import { Color, Vector3 } from 'three';
import { createStyles, Drawer, IconButton, WithStyles, withStyles } from '@material-ui/core';
import { ArrowForward, ReportRounded } from '@material-ui/icons';
import TestSettings from './TestSettings';
import DirectionInstancedMesh from '../DirectionInstencedMesh';

export type SizeDistribution = 'constant' | 'linear';

interface State {
  open: boolean;
  xPosition: number;
  yPosition: number;
  size: number;
  duration: number;
  age: number;
  speed: number;
  direction: number;
  sizeDistribution: SizeDistribution;
  limits: { maxX: number, maxY: number, maxSize: number, maxSpeed: number, maxDuration: number };
  cursor: string;
}

const drawerWidth = 240;

const styles = createStyles({
  drawerPaper: {
    width: drawerWidth
  }
});


class PracticeGame extends React.Component<WithStyles<typeof styles>, State> {
  game: Game;
  gamePhysics = new GamePhysics();
  canvasRef = React.createRef<HTMLCanvasElement>();

  targets: Target[] = [];
  circleMeshes = new CircleInstancedMesh();
  arrowMeshes = new DirectionInstancedMesh();

  selectedTarget: Target = null;
  targetToChange: Target = null;

  paused = true;

  dragSize = false;
  dragDirection = false;
  dragPosition = false;
  threshold: number;

  mouseTargetVector: Vector3;
  mouseDownPosition: Vector3;
  disableClick: boolean;
  mouseMoveUpdateTime: number = 0;


  constructor(props) {
    super(props);
    this.state = {
      open: true, size: 50, duration: Infinity, age: 0, speed: 50, xPosition: 0, yPosition: 0, direction: 0, cursor: 'auto', sizeDistribution: 'constant',
      limits: { maxX: 400, maxY: 400, maxSize: 400, maxSpeed: 400, maxDuration: 10 }
    };
  }

  async componentDidMount() {
    this.game = new Game(this.canvasRef.current, this.onAnimate, this.onResize);
    const limits = {
      maxX: this.game.sceneToPx(this.game.width / 2),
      maxY: this.game.sceneToPx(this.game.height / 2),
      maxSize: this.game.sceneToPx(Math.min(this.game.width / 4, this.game.height / 4)),
      maxSpeed: this.game.sceneToPx(Math.min(this.game.width / 4, this.game.height / 4)),
      maxDuration: 10,
    };
    this.setState({ limits });
    this.threshold = this.game.pxToScene(20);
    this.game.scene.background = new Color('#dfe3ee');
    this.gamePhysics.targets = this.targets;
    this.game.add(this.circleMeshes, this.arrowMeshes);
    this.game.start();
  }

  onResize = (width: number, height: number) => {
    this.gamePhysics.width = width;
    this.gamePhysics.height = height;
  }

  onAnimate = (time: number) => {
    this.circleMeshes.update(this.targets);
    this.arrowMeshes.update(this.targets);

    if (this.paused) {
      this.targets.forEach(target => target.size = target.getSize());
      return;
    }
    this.targets.forEach(target => {
      if (target.age > target.duration) {
        target.age = 0;
      }
    });
    this.gamePhysics.update(time);
  }

  syncSettingsWihtSelectedTarget = (): void => {
    if (!this.selectedTarget) {
      return;
    }
    let { size, speed, direction, position, duration, age } = this.selectedTarget;
    let angle = direction.angleTo(new Vector3(1, 0, 0));
    if (direction.y < 0) {
      angle = 2 * Math.PI - angle;
    }
    size = this.game.sceneToPx(size);
    speed = this.game.sceneToPx(speed);
    const xPosition = this.game.sceneToPx(position.x);
    const yPosition = this.game.sceneToPx(position.y);
    let sizeDistribution: SizeDistribution = 'constant';
    if (duration !== Infinity) {
      sizeDistribution = 'linear';
    }
    this.setState({ size, speed, direction: angle * (180 / Math.PI), xPosition, yPosition, duration: duration / 1000, age: age / 1000, sizeDistribution });
  }

  addTarget = (position: Vector3): void => {
    const { size, speed, duration, age, direction, sizeDistribution } = this.state;

    let maxSize = this.game.pxToScene(size);
    if (sizeDistribution === 'linear') {
      maxSize = this.game.pxToScene(size) / (1 - Math.abs(2 * (age / duration) - 1));
    }

    const target = new Target({
      speed: this.game.pxToScene(speed),
      maxSize,
      duration: duration * 1000,
      age: age * 1000,
      direction: new Vector3(Math.cos(direction * Math.PI / 180), Math.sin(direction * Math.PI / 180), 0),
      position
    });
    this.targets.push(target);
  }

  onClick = (event: React.MouseEvent) => {
    const position = this.game.clickToScenePos(event.pageX, event.pageY);
    const target = this.targets.find(target => target.position.distanceTo(position) < target.size);
    if (target) {
      if (this.selectedTarget) {
        this.selectedTarget.color.multiplyScalar(1 / 3);
      }
      this.selectedTarget = target;
      this.selectedTarget.color.multiplyScalar(3);
      this.syncSettingsWihtSelectedTarget();
    } else if (this.selectedTarget) {
      this.selectedTarget.color.multiplyScalar(1 / 3);
      this.selectedTarget = null;
    } else {
      this.addTarget(position);
    }
  }

  onMouseDown = (event: React.MouseEvent) => {
    const position = this.mouseDownPosition = this.game.clickToScenePos(event.pageX, event.pageY);

    let target = this.targets.find(target =>
      target.position.clone().add(target.direction.clone().multiplyScalar(target.speed)).distanceTo(position) < this.threshold
    );

    if (target) {
      this.dragDirection = true;
    } else {
      target = this.targets.find(target => {
        return target.position.distanceTo(position) > target.size - this.threshold / 2 && target.position.distanceTo(position) < target.size + this.threshold / 2;
      });
      if (target) {
        this.dragSize = true;
      } else {
        target = this.targets.find(target => target.position.distanceTo(position) < target.size);
        if (target) {
          this.dragPosition = true;
          this.mouseTargetVector = target.position.clone().sub(position).normalize().multiplyScalar(target.position.distanceTo(position));
        }
      }
    }

    if (target) {
      this.targetToChange = target;
    }
  }

  onMouseUp = (event: React.MouseEvent) => {
    this.mouseDownPosition = null;
    if (!this.disableClick) {
      this.onClick(event);
    }
    this.dragDirection = this.dragPosition = this.dragSize = false;
    this.targetToChange = null;
    this.disableClick = false;
    this.syncSettingsWihtSelectedTarget();
  }

  positionAboveTarget(position: Vector3) {
    return this.targets.find(target => target.position.distanceTo(position) < target.size);
  }

  positionAboveSize(position: Vector3) {
    return this.targets.find(target =>
      position.distanceTo(target.position) > (target.size - this.threshold / 2) && position.distanceTo(target.position) < target.size + this.threshold / 2
    );
  }

  positionAboveDirection(position: Vector3) {
    return this.targets.find(
      target => target.position.clone().add(target.direction.clone().multiplyScalar(target.speed)).distanceTo(position) < this.threshold
    );
  }


  onMouseMove = (event: React.MouseEvent) => {
    if (Date.now() - this.mouseMoveUpdateTime < 40) {
      return;
    }
    this.mouseMoveUpdateTime = Date.now();
    const position = this.game.clickToScenePos(event.pageX, event.pageY);
    const targetAboveSize = this.positionAboveSize(position);

    if (this.positionAboveDirection(position)) {
      this.setState({ cursor: 'grabbing' });
    } else if (targetAboveSize) {
      const direction = position.clone().sub(targetAboveSize.position);
      let angle = direction.angleTo(new Vector3(1, 0, 0));
      angle *= 180 / Math.PI;
      if (direction.y < 0) {
        angle = 360 - angle;
      }
      if (angle < 20 || angle > 340) {
        this.setState({ cursor: 'ew-resize' });
      } else if (angle > 20 && angle < 70) {
        this.setState({ cursor: 'nesw-resize' });
      } else if (angle > 70 && angle < 110) {
        this.setState({ cursor: 'ns-resize' });
      } else if (angle > 110 && angle < 160) {
        this.setState({ cursor: 'nwse-resize' });
      } else if (angle > 160 && angle < 200) {
        this.setState({ cursor: 'ew-resize' });
      } else if (angle > 200 && angle < 250) {
        this.setState({ cursor: 'nesw-resize' });
      } else if (angle > 250 && angle < 290) {
        this.setState({ cursor: 'ns-resize' });
      } else if (angle > 280 && angle < 340) {
        this.setState({ cursor: 'nwse-resize' });
      }
    } else if (this.positionAboveTarget(position)) {
      this.setState({ cursor: 'move' });
    } else {
      this.setState({ cursor: 'crosshair' });
    }

    if (this.disableClick) {
      if (this.dragPosition) {
        this.targetToChange.position = position.clone().add(this.mouseTargetVector);
      } else if (this.dragSize) {
        this.onSizeChange(this.game.sceneToPx(position.distanceTo(this.targetToChange.position)));
        // this.targetToChange.maxSize = position.distanceTo(this.targetToChange.position);
      } else if (this.dragDirection) {
        this.targetToChange.direction = position.clone().sub(this.targetToChange.position).normalize();
        this.targetToChange.speed = position.distanceTo(this.targetToChange.position);
      }
    } else if (this.mouseDownPosition && position.distanceTo(this.mouseDownPosition) > this.game.pxToScene(20)) {
      this.disableClick = true;
    }
  }

  hideDrawer = (): void => {
    this.setState({ open: false });
    setTimeout(this.game.onResize, 0);
  }

  showDrawer = (): void => {
    this.setState({ open: true });
    setTimeout(this.game.onResize, 0);
  }

  onXPositionChange = (xPosition: number) => {
    this.setState({ xPosition });
    if (this.selectedTarget) {
      this.selectedTarget.position.setX(this.game.pxToScene(xPosition));
    }
  }

  onYPositionChange = (yPosition: number) => {
    this.setState({ yPosition });
    if (this.selectedTarget) {
      this.selectedTarget.position.setY(this.game.pxToScene(yPosition));
    }
  }

  onSizeChange = (size: number) => {
    this.setState({ size });

    let target = this.targetToChange;

    if (!target) {
      target = this.selectedTarget;
    }

    if (!target)  {
      return;
    }

    if (target.duration !== Infinity) {
      target.age = target.duration / 2;
      this.setState({ age: target.age / 1000 });
    }

    target.maxSize = this.game.pxToScene(size);
  }

  onDurationChange = (duration: number) => {
    this.setState({ duration });
    if (this.selectedTarget) {
      this.selectedTarget.duration = duration * 1000;
    }
  }

  onAgeChange = (age: number) => {
    this.setState({ age });
    if (this.selectedTarget) {
      this.selectedTarget.age = age * 1000;
    }
  }

  onSpeedChange = (speed: number) => {
    this.setState({ speed });
    if (this.selectedTarget) {
      this.selectedTarget.speed = this.game.pxToScene(speed);
    }
  }

  onDirectionChange = (angle: number) => {
    this.setState({ direction: angle });
    if (this.selectedTarget) {
      this.selectedTarget.direction.set(Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180), 0);
    }
  }

  onSizeDistributionChange = (sizeDistribution: SizeDistribution) => {
    this.setState({ sizeDistribution });
    if (this.selectedTarget) {
      if (sizeDistribution === 'linear') {
        this.selectedTarget.duration = 4 * 1000;
        this.selectedTarget.age = 2 * 1000;
        this.setState({ duration: this.selectedTarget.duration / 1000, age: this.selectedTarget.age / 1000 });
      } else if (sizeDistribution === 'constant') {
        this.selectedTarget.duration = Infinity;
      }
    } else {
      this.setState({ duration: 4, age: 2 });
    }
  }

  onDelete = () => {
    _.remove(this.targets, this.selectedTarget);
    this.selectedTarget = null;
  }

  onPause = (): void => {
    this.paused = true;
    this.syncSettingsWihtSelectedTarget();
  }

  onResume = (): void => {
    this.paused = false;
  }

  render() {
    const { open, xPosition, yPosition, size, duration, age, speed, direction, limits, cursor, sizeDistribution } = this.state;
    const { classes } = this.props;

    return (
      <div>
        <IconButton
          style={{ position: 'absolute' }}
          onClick={this.showDrawer}
        >
          <ArrowForward />
        </IconButton>
        <Drawer classes={{ paper: classes.drawerPaper }} variant="persistent" anchor="left" open={open}>
          <TestSettings
            limits={limits}
            xPosition={xPosition}
            yPosition={yPosition}
            size={size}
            duration={duration}
            age={age}
            speed={speed}
            direction={direction}
            sizeDistribution={sizeDistribution}
            onDelete={this.onDelete}
            onXPositionChange={this.onXPositionChange}
            onYPositionChange={this.onYPositionChange}
            onSizeChange={this.onSizeChange}
            onDurationChange={this.onDurationChange}
            onAgeChange={this.onAgeChange}
            onSpeedChange={this.onSpeedChange}
            onDirectionChange={this.onDirectionChange}
            onSizeDistributionChange={this.onSizeDistributionChange}
            onPause={this.onPause}
            onResume={this.onResume}
          />
        </Drawer>
        <main style={{ marginLeft: open ? drawerWidth : 0, height: '100vh' }}>
          <canvas
            style={{ cursor }}
            ref={this.canvasRef}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
          >
          </canvas>
        </main>

      </div>
    );
  }
}

export default withStyles(styles)(PracticeGame);
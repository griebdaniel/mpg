import React from 'react';
import CircleInstancedMesh from '../CircleInstancedMesh';
import { Click } from '../Click2';
import Game from '../Game';
import { GamePhysics } from '../GamePhysics';
import { Target } from '../Target2';
import _ from 'lodash';
import { Color, Vector3 } from 'three';
import PracticeSettings from './PracticeSettings';
import { createStyles, Drawer, IconButton, WithStyles, withStyles } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import { genericService } from '../../services/generic-service';

interface State {
  open: boolean;
  pace: number,
  size: number,
  speed: number,
  duration: number
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
  clicks: Click[] = [];
  circleMeshes = new CircleInstancedMesh();
  user: any;
  timer: NodeJS.Timeout;
  addTargetTime: number;
  gameTime = 0;
  nextTargetTime = 0;

  constructor(props) {
    super(props);
    this.state = { open: true, pace: 1, size: 50, speed: 50, duration: 4 };
  }
  async componentDidMount() {
    this.game = new Game(this.canvasRef.current, this.onAnimate, this.onResize);
    this.game.scene.background = new Color('#dfe3ee');
    this.gamePhysics.targets = this.targets;

    this.game.add(this.circleMeshes);
    this.game.start();

    try {
      this.user = await genericService.getUser();
      this.setState({ ...this.user.settings });
    } catch (e) { }
  }

  componentWillUnmount() {
    this.game.stop();
    this.circleMeshes.dispose();
  }

  onResize = (width: number, height: number) => {
    this.gamePhysics.width = width;
    this.gamePhysics.height = height;
  }

  onAnimate = (time: number) => {
    _.remove(this.targets, target => {
      if (target.age + time > target.duration) return true;
      return false;
    } );
    _.remove(this.clicks, click => click.age + time > click.duration);
    this.gamePhysics.update(time);
    this.clicks.forEach(click => click.update(time));
    this.circleMeshes.update([...this.clicks, ...this.targets]);
    this.gameTime += time;
    if (this.gameTime > this.nextTargetTime) {
      this.addTarget();
      this.nextTargetTime += 1 / this.state.pace * 1000;
    }
  }

  addTarget = (): void => {
    const position = new Vector3();
    for (; ;) {
      position.set(_.random(-this.game.width / 2, this.game.width / 2), _.random(-this.game.height / 2, this.game.height / 2), 0);
      if (!this.targets.find(target => target.position.distanceTo(position) < target.size)) {
        break;
      }
    }
    const { size, duration, speed } = this.state;
    const target = new Target({
      speed: this.game.pxToScene(speed),
      maxSize: this.game.pxToScene(size),
      duration: duration * 1000,
      position
    });
    this.targets.push(target);
  }

  onClick = (event: React.MouseEvent) => {
    const position = this.game.clickToScenePos(event.pageX, event.pageY);
    const target = this.targets.find(target => target.position.distanceTo(position) < target.size);
    if (target) {
      _.remove(this.targets, target);
      this.clicks.push(new Click({ position, baseColor: new Color('green'), backgroundColor: this.game.scene.background as Color }));
    } else {
      this.clicks.push(new Click({ position, baseColor: new Color('red'), backgroundColor: this.game.scene.background as Color }));
    }
  }

  hideDrawer = (): void => {
    this.setState({ open: false });
    setTimeout(this.game.windowResize, 0);
  }

  showDrawer = (): void => {
    this.setState({ open: true });
    setTimeout(this.game.windowResize, 0);
  }

  onPaceChange = (pace: number) => {
    this.setState({ pace });
    clearTimeout(this.timer);
    if (pace > 0) {
      this.timer = setTimeout(this.addTarget, (1000 / pace) - (Date.now() - this.addTargetTime));
    }
  }

  onSizeChange = (size: number) => {
    this.setState({ size });
    this.targets.forEach(target => target.maxSize = this.game.pxToScene(size));
  }

  onDurationChange = (duration: number) => {
    this.setState({ duration });
    this.targets.forEach(target => target.duration = duration * 1000);
  }

  onSpeedChange = (speed: number) => {
    this.setState({ speed });
    this.targets.forEach(target => target.speed = this.game.pxToScene(speed));
  }

  onSaveSettings = async () => {
    const { pace, size, duration, speed } = this.state;
    await genericService.updateSettings({ pace, size, duration, speed });
  }

  onLoadSettings = () => {
    this.setState({ ...this.user.settings });
  }

  onPause = (): void => {
    this.game.stop();
  }

  onResume = (): void => {
    this.game.start();
  }


  render() {
    const { open, pace, size, duration, speed } = this.state;

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
          <PracticeSettings
            pace={pace}
            size={size}
            duration={duration}
            speed={speed}
            onPaceChange={this.onPaceChange}
            onSizeChange={this.onSizeChange}
            onDurationChange={this.onDurationChange}
            onSpeedChange={this.onSpeedChange}
            onPause={this.onPause}
            onResume={this.onResume}
            onSaveSettings={this.onSaveSettings}
            onLoadSettings={this.onLoadSettings}
            onHide={this.hideDrawer}
          />
        </Drawer>
        <main  style={{ marginLeft: open ? drawerWidth : 0, height: '100vh' }}>
        <canvas
          // style={{ display: 'block', width: '100%', height: '100%' }}
          ref={this.canvasRef}
          onClick={this.onClick}
        >
        </canvas>
        </main>

      </div>
    );
  }
}

export default withStyles(styles)(PracticeGame);
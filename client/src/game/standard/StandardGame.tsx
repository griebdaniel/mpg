import React from 'react';
import CircleInstancedMesh from '../CircleInstancedMesh';
import { Click } from '../Click2';
import Game from '../Game';
import { GamePhysics } from '../GamePhysics';
import { Target } from '../Target2';
import _ from 'lodash';
import { Color, Vector3 } from 'three';
import { Button, Dialog, DialogTitle, Typography, withStyles } from '@material-ui/core';
import { genericService } from '../../services/generic-service';
import { Link } from 'react-router-dom';
import { Score } from '../Score';

interface State {
  dialogOpen: boolean;
  score: number;
  time: number;
  pace: number;
  size: number;
  speed: number;
  duration: number;
}

interface SpecialTarget {
  count: number;
  color: Color;
  score: number;
  remaining?: number;
}

class StandardGame extends React.Component<{}, State> {
  game: Game;
  gamePhysics = new GamePhysics();
  canvasRef = React.createRef<HTMLCanvasElement>();

  targets: Target[] = [];
  clicks: Click[] = [];
  // scores: Score[] = [];
  circleMeshes = new CircleInstancedMesh();
  user: any;
  timer: NodeJS.Timeout;
  addTargetTime: number;
  gameTime = 0;
  gameDuration = 60;
  nextTargetTime = 0;
  targetCount = 0;

  defaultTargetColor = new Color('#08415d');

  specialTargetPace = 0;
  nextSpecialTargetTime = 0;

  specialTargets: SpecialTarget[] = [
    { color: new Color('#ed6d6d'), score: 2, count: 40 },
    { color: new Color('#ffb300'), score: 3, count: 20 },
    { color: new Color('#f7ff0a'), score: 4, count: 5 },
  ];

  constructor(props) {
    super(props);
    this.state = { dialogOpen: false, pace: 10, size: 50, speed: 200, duration: 4, score: 0, time: this.gameDuration };
    this.specialTargets.forEach(target => target.remaining = target.count);
    window.onkeydown = this.onKeypress;
  }
  async componentDidMount() {
    this.game = new Game(this.canvasRef.current, this.onAnimate, this.onResize);
    this.game.scene.background = new Color('#dfe3ee');
    this.gamePhysics.targets = this.targets;

    this.game.add(this.circleMeshes);
    this.game.start();



    this.specialTargetPace = this.specialTargets.reduce((previous, current) => previous + current.count, 0) / (this.gameDuration - this.state.duration);
    try {
      this.user = await genericService.getUser();
    } catch (e) { }
  }

  componentWillUnmount() {
    this.game.stop();
    this.circleMeshes.dispose();
  }

  onKeypress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.onTimeout();
    }
  }

  onResize = (width: number, height: number) => {
    this.gamePhysics.width = width;
    this.gamePhysics.height = height;
    this.targets.forEach(target => {
      target.maxSize = this.pxToSceneSize(this.state.size);
      target.speed = this.pxToSceneSpeed(this.state.speed);
    });
  }

  onAnimate = (time: number) => {
    if (this.state.dialogOpen) {
      return;
    }

    this.gameTime += time;

    this.game.scene.children.forEach(child => {
      if (child instanceof Score) {
        child.update(time);
        if ( child.age > child.lifeSpan) {
          this.game.scene.remove(child);
        }
      }
    });

    if (this.gameTime >= this.gameDuration * 1000) {
      this.onTimeout();
      return;
    }
    _.remove(this.targets, target => {
      if (target.age + time > target.duration) return true;
      return false;
    });
    _.remove(this.clicks, click => click.age + time > click.duration);
    this.gamePhysics.update(time);
    this.clicks.forEach(click => click.update(time));
    this.circleMeshes.update([...this.clicks, ...this.targets]);

    this.setState({ time: Math.trunc(this.gameDuration - this.gameTime / 1000) });

    if (this.gameTime > this.nextSpecialTargetTime) {
      const specialTarget = this.getRandomSpecialTarget();
      if (specialTarget) {
        this.addTarget({ color: specialTarget.color });
        specialTarget.remaining--;
        this.nextSpecialTargetTime += 1000 / this.specialTargetPace;
      } else {
        this.nextSpecialTargetTime = Infinity;
      }
    }

    if (this.gameTime > this.nextTargetTime) {
      this.addTarget({ color: this.defaultTargetColor });
      this.nextTargetTime = this.gameTime + 1 / this.state.pace * 1000;
    }
  }

  onTimeout = async () => {
    this.setState({ dialogOpen: true });
    const user = await genericService.getLoggedInUser();
    if (user && this.state.score > user.highscore) {
      genericService.setHighscore(this.state.score);
    }
  }

  addTarget = ({ color }): void => {
    const position = new Vector3();
    for (; ;) {
      position.set(_.random(-this.game.width / 2, this.game.width / 2), _.random(-this.game.height / 2, this.game.height / 2), 0);
      if (!this.targets.find(target => target.position.distanceTo(position) < target.size)) {
        break;
      }
    }
    const { size, duration, speed } = this.state;
    const target = new Target({
      speed: this.pxToSceneSpeed(speed),
      maxSize: this.pxToSceneSize(size),
      duration: duration * 1000,
      position,
      color
    });
    this.targets.push(target);
  }

  pxToSceneSize(value: number) {
    const scaler = (window.screen.width * window.screen.height) / (window.innerWidth * window.innerHeight);
    return this.game.pxToScene(value / scaler);
  }

  pxToSceneSpeed(value: number) {
    const scaler = (window.screen.width * window.screen.height) / (window.innerWidth * window.innerHeight);
    return this.game.pxToScene(value / Math.sqrt(scaler));
  }

  onClick = (event: React.MouseEvent) => {
    const position = this.game.clickToScenePos(event.pageX, event.pageY);
    const target = this.targets.find(target => target.position.distanceTo(position) < target.size);
    if (target) {
      const specialTarget = this.specialTargets.find(specialTarget => specialTarget.color.equals(target.color));
      this.setState({ score: this.state.score + (specialTarget ? specialTarget.score : 1) });

      this.game.add(new Score(specialTarget?.score ?? 1, position));

      _.remove(this.targets, target);
      // this.clicks.push(new Click({ position, baseColor: new Color('green'), backgroundColor: this.game.scene.background as Color }));
      
    } else {
      this.setState({ score: this.state.score - 1 });
      // this.clicks.push(new Click({ position, baseColor: new Color('red'), backgroundColor: this.game.scene.background as Color }));
      this.game.add(new Score(-1, position));
      // this.scores.push(new Score(-1, position));
    }
  }

  getRandomSpecialTarget() {
    const totalSpecialRemaining = this.specialTargets.reduce((previous, current) => previous + current.remaining, 0);
    if (totalSpecialRemaining < 1) {
      return;
    }
    let r = _.random(1, totalSpecialRemaining);
    for (const specialTarget of this.specialTargets) {
      if (r <= specialTarget.remaining) {
        return specialTarget;
      }
      r -= specialTarget.remaining;
    }
  }

  tryAgain = () => {
    this.gameTime = this.nextSpecialTargetTime = this.nextTargetTime = 0;
    this.specialTargets.forEach(specialTarget => specialTarget.remaining = specialTarget.count);
    _.remove(this.targets);
    _.remove(this.clicks);

    this.setState({ dialogOpen: false, score: 0, });
  }

  render() {
    const { score, time, dialogOpen } = this.state;
    return (
      <div style={{ height: '100vh' }}>
        <div style={{ userSelect: 'none', position: 'absolute', margin: 15, pointerEvents: 'none', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '50vw' }}>
          <Typography variant="h3" color='primary' style={{ opacity: 0.6 }}>{time}</Typography>
          <Typography variant="h3" color='primary' style={{ opacity: 0.6 }}>{score}</Typography>
        </div>

        <canvas
          ref={this.canvasRef}
          onClick={this.onClick}
        >
        </canvas>
        <Dialog open={dialogOpen} >
          <div style={{ padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* <DialogTitle> */}
            <Typography color="primary" variant="h5" style={{ marginTop: 10, marginBottom: 20 }}>You scored {this.state.score}</Typography>
            {/* </DialogTitle> */}
            <div style={{ display: 'flex', alignContent: 'center', marginTop: 20 }}>
              <Button variant="contained" size="small" color="primary" onClick={this.tryAgain} style={{ marginRight: 10 }}>Try Again</Button>
              <Button component={Link} size="small" to="/" variant="contained" color="primary">Quit</Button>
            </div>

          </div>

        </Dialog>
      </div>

    );
  }
}

export default withStyles({})(StandardGame);
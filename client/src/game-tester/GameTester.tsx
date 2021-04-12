// import _ from 'lodash';
import React, { RefObject, ReactNode } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { Pause, PlayArrow, Delete } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import { withStyles, WithStyles, createStyles, FormGroup, TextField, InputAdornment } from '@material-ui/core';

import './GameTester.css';
import GameComponent from '../game/GameComponent';
import { TestTarget as Target, TargetSizeDistribution, TargetSettings } from '../game/TestTarget';
import GameScene from '../game/GameScene';
import { Vector3 } from 'three';
import { TestSettings } from './Settings';

const drawerWidth = 240;

const styles = createStyles({
  drawerPaper: {
    width: drawerWidth,
  },
  mainContent: {
    height: '100vh',
    marginLeft: drawerWidth,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
});

type Props = WithStyles<typeof styles>;

interface State {
  open: boolean;
  size: number;
  input: number;
  duration: number;
  speed: number;
  distribution: TargetSizeDistribution;
}

class GameTester extends React.Component<Props, State> {
  selectedTarget: Target;
  game: GameScene;

  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  ignoreClick = false;

  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();

    this.state = {
      open: true,
      size: 150,
      duration: 6,
      input: 0.5,
      speed: 150,
      distribution: 'Constant'
    };
  }

  componentDidMount(): void {
    this.gameComponent = this.gameComponentRef.current;
    this.game = this.gameComponent.game;
  }

  onSizeChange = (size: number): void => {
    this.setState({ size });
    if (this.selectedTarget) {
      this.selectedTarget.maxSize = this.gameComponent.pxToScene(size);
    }
  };

  onInputChange = (input: number): void => {
    this.setState({ input });
    if (this.selectedTarget) {
      this.selectedTarget.sizeChangeValue = input;
    }
  }

  onSpeedChange = (speed: number): void => {
    this.setState({ speed });
    if (this.selectedTarget) {
      this.selectedTarget.speed = speed ? this.gameComponent.pxToScene(speed) : 0;
    }
  }

  onDurationChange = (duration: number): void => {
    this.setState({ duration });
    if (this.selectedTarget) {
      this.selectedTarget.sizeChangeDuration = duration ? duration * 1000 : 0;
    }
  }

  onDistributionChange = (distribution: TargetSizeDistribution): void => {
    this.setState({ distribution });
    if (this.selectedTarget) {
      this.selectedTarget.sizeChangeDistribution = distribution;
    }
  }

  onDelete = (): void => {
    if (this.selectedTarget) {
      this.game.removeTarget(this.selectedTarget as any);
    } else {
      this.game.targets.forEach(target => this.game.removeTarget(target));
    }
    this.selectedTarget = undefined;
  }

  onPause = (): void => {
    this.gameComponent.pause();
  }

  onResume = (): void => {
    this.gameComponent.resume();
  }

  onTargetSelect = (target: Target): void => {
    this.setState({
      size: this.gameComponent.sceneToPx(target.maxSize),
      duration: target.sizeChangeDuration / 1000,
      input: target.sizeChangeValue,
      speed: this.gameComponent.sceneToPx(target.speed),
      distribution: target.sizeChangeDistribution
    });

    if (this.selectedTarget) {
      this.selectedTarget.isSelected = false;
    }

    this.selectedTarget = target;
    this.selectedTarget.isSelected = true;
  }

  onTargetClick = (target: Target): void => {
    if (this.ignoreClick) {
      this.ignoreClick = false;
      return;
    }

    if (target === this.selectedTarget) {
      this.selectedTarget.isSelected = false;
      this.selectedTarget = null;
    } else {
      this.onTargetSelect(target);
    }
  }

  onBackgroundClick = (position: Vector3): void => {
    if (this.ignoreClick) {
      this.ignoreClick = false;
      return;
    }

    if (this.selectedTarget) {
      this.selectedTarget.isSelected = false;
      this.selectedTarget = null;
    } else {
      const { size, duration, input: value, speed, distribution } = this.state;

      this.game.addTarget({
        pos: position,
        maxSize: this.gameComponent.pxToScene(size),
        sizeChangeDuration: duration * 1000,
        sizeChangeValue: value,
        speed: this.gameComponent.pxToScene(speed),
        sizeChangeDistribution: distribution,
        showDirection: true,
        repeating: true
      } as any);
    }
  }

  onTargetDrag = (target: Target, dragVec: Vector3): void => {
    target.position.add(dragVec);
    this.ignoreClick = true;
  }

  onDirectionDrag = (target: Target, dragVec: Vector3): void => {
    const directionEnd = target.position.clone().add(target.direction.clone().multiplyScalar(target.speed));
    target.direction = directionEnd.clone().add(dragVec).sub(target.position);
    target.speed = target.position.distanceTo(directionEnd.clone().add(dragVec));
    this.setState({ speed: this.gameComponent.sceneToPx(target.speed) });
    this.ignoreClick = true;
  }

  render(): ReactNode {
    const { classes } = this.props;
    const { open, size, input, duration, speed, distribution } = this.state;

    return (
      <div>
        <Drawer classes={{ paper: classes.drawerPaper }} variant="persistent" anchor="left" open={open}>
          <IconButton onClick={this.onDelete} color="primary"><Delete /></IconButton>
          <Divider />
          <TestSettings
            size={size}
            speed={speed}
            duration={duration}
            input={input}
            distribution={distribution}
            onSizeChange={this.onSizeChange}
            onSpeedChange={this.onSpeedChange}
            onDurationChange={this.onDurationChange}
            onInputChange={this.onInputChange}
            onDistributionChange={this.onDistributionChange}
            onPause={this.onPause}
            onResume={this.onResume}
          />
        </Drawer>
        <main className={classes.mainContent}>
          <GameComponent
            ref={this.gameComponentRef}
            onTargetClick={this.onTargetClick as any}
            onBackgroundClick={this.onBackgroundClick}
            onTargetDrag={this.onTargetDrag as any}
            onDirectionDrag={this.onDirectionDrag as any}
          >
          </GameComponent>
        </main>
      </div >
    );
  }
}

export default withStyles(styles)(GameTester);
import React, { RefObject, ReactNode } from 'react';

import clsx from 'clsx';

import Game from '../game/Game2';
import GameComponent from '../game/GameComponent';
import { Target } from '../game/Target2';
import './CustomComponent.css';
// import _ from 'lodash';

import { IconButton, withStyles, WithStyles, createStyles, Drawer, FormControl, TextField, FormGroup, InputAdornment, Slider, Typography, Tooltip, Divider } from '@material-ui/core';
import { ArrowBack, ArrowForward, HelpOutline, Info, InfoOutlined, InfoRounded, InfoTwoTone } from '@material-ui/icons';
import { Vector3 } from 'three';
import CustomSettingComponent, { CustomSetting } from './CustomSetting';
import { settingsAtScore, settingsAtTime } from '../normal/difficulty';
import { genericService } from '../services/generic-service';

const drawerWidth = 240;

const styles = createStyles({
  drawerPaper: {
    // display: 'initial',
    width: drawerWidth,
    overflow: 'visible'
  },
  mainContent: {
    height: '100vh',
    marginLeft: drawerWidth,
  },
  mainContentShift: {
    marginLeft: 0,
  },
  settingsControl: {
    padding: 12,
  },
  settingInput: {
    margin: '12px 0px',
  },
});

type Props = WithStyles<typeof styles>

interface State {
  open: boolean;
  difficulty: number,
  pace: number,
  size: number,
  speed: number,
  duration: number
}

class CustomComponent extends React.Component<Props, State> {
  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;
  game: Game;
  timer: NodeJS.Timeout;
  addTargetTime: number;
  user = null;

  constructor(props: Props) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.state = {
      open: true,
      difficulty: 40,
      pace: 2,
      size: 50,
      speed: 50,
      duration: 4
    };
  }

  async componentDidMount() {
    this.gameComponent = this.gameComponentRef.current;
    this.game = this.gameComponent.game;
    
    try {
      this.user =  await genericService.getUser();
      this.setState({ ...this.user.settings });
    } catch (e) { }

    this.addTarget();
  }

  componentWillUnmount(): void {
    clearTimeout(this.timer);
  }

  addTarget = (): void => {
    const { pace, size, duration, speed } = this.state;
    this.game.addTarget({
      speed: this.gameComponent.pxToScene(speed),
      maxSize: this.gameComponent.pxToScene(size),
      duration: duration * 1000
    });
    if (pace > 0) {
      this.addTargetTime = Date.now();
      this.timer = setTimeout(this.addTarget, 1000 / pace);
    }
  }

  hideDrawer = (): void => {
    this.setState({ open: false });
    setTimeout(this.gameComponent.onWindowResize, 0);
  }

  showDrawer = (): void => {
    this.setState({ open: true });
    setTimeout(this.gameComponent.onWindowResize, 0);
  }

  onTargetClick = (target: Target, position: Vector3): void => {
    this.game.removeTarget(target);
    this.game.addSuccessClick({ position });
  }

  onBackgroudClick = (position: Vector3): void => {
    this.game.addMissClick({ position });
  }

  onDifficultyChange = (difficulty: number) => {
    this.setState({ difficulty });
    const { pace, size, duration, speed } = settingsAtTime(difficulty);
    this.onPaceChange(pace);
    this.onSizeChange(size);
    this.onDurationChange(duration);
    this.onSpeedChange(speed);
  }

  onPaceChange = (pace: number) => {
    this.setState({ pace });
    if (this.gameComponent.paused) {
      return;
    }
    clearTimeout(this.timer);
    if (pace > 0) {
      this.timer = setTimeout(this.addTarget, (1000 / pace) - (Date.now() - this.addTargetTime));
    }
  }

  onSizeChange = (size: number) => {
    this.setState({ size });
    this.game.targets.forEach(target => target.maxSize = this.gameComponent.pxToScene(size));
  }

  onDurationChange = (duration: number) => {
    this.setState({ duration });
    this.game.targets.forEach(target => target.duration = duration * 1000);
  }

  onSpeedChange = (speed: number) => {
    this.setState({ speed });
    this.game.targets.forEach(target => target.speed = this.gameComponent.pxToScene(speed));
  }

  onSaveSettings = async () => {
    const { pace, size, duration, speed } = this.state;
    const res = await genericService.updateSettings({ pace, size, duration, speed });
  }

  onLoadSettings = () => {
    this.setState({ ...this.user.settings });
  }

  onPause = (): void => {
    clearInterval(this.timer);
    this.gameComponent.pause();
  }

  onResume = (): void => {
    this.gameComponent.resume();
    this.addTarget();
  }

  render(): ReactNode {
    const { open, difficulty, pace, size, duration, speed } = this.state;
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
          <CustomSettingComponent
            difficulty={difficulty}
            pace={pace}
            size={size}
            duration={duration}
            speed={speed}
            onDifficultyChange={this.onDifficultyChange}
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
        <main className={clsx(classes.mainContent, { [classes.mainContentShift]: !open })}>
          <GameComponent
            ref={this.gameComponentRef}
            onTargetClick={this.onTargetClick}
            onBackgroundClick={this.onBackgroudClick}
          >
          </GameComponent>
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(CustomComponent);
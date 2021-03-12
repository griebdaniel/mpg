import React, { RefObject, ReactNode } from 'react';
import Game from '../game/Game2';
import { Target } from '../game/Target2';
import GameComponent from '../game/GameComponent';
import { Vector3 } from 'three';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { genericService } from '../services/generic-service';

import './NormalComponent.css';
import { settingsAtTime } from './difficulty';

interface State {
  open: boolean;
  score: number;
}

class NormalComponent extends React.Component<{}, State> {
  loggedInUser: any;
  game: Game;
  gameComponentRef: RefObject<GameComponent>;
  gameComponent: GameComponent;

  timer: NodeJS.Timeout;
  gameStartTime: number;

  constructor(props: {}) {
    super(props);
    this.gameComponentRef = React.createRef();
    this.state = { score: 0, open: false };
  }

  componentDidMount(): void {
    this.gameComponent = this.gameComponentRef.current;
    this.game = this.gameComponent.game;
    // this.game.showLifes = true;
    // this.game.onLifeOut.subscribe(this.onLifeOut);
    this.game.onTargetMiss = this.onTargetMiss;
    this.start();
  }

  componentWillUnmount(): void {
    clearTimeout(this.timer);
  }

  start = (): void => {
    this.gameStartTime = performance.now();
    this.addTarget();
  }

  addTarget = (): void => {
    const settings = settingsAtTime(this.gameTime / 1000);

    const speed = this.gameComponent.pxToScene(settings.speed);
    const maxSize = this.gameComponent.pxToScene(settings.size);
    const duration = settings.duration * 1000;

    this.game.addTarget({ speed, maxSize, duration });
    this.timer = setTimeout(this.addTarget, 1000 / settings.pace);
  }

  onLifeOut = async () => {
    try {
      const loggedInUser = await genericService.getLoggedInUser();
      if (this.state.score > loggedInUser.highscore) {
        genericService.setHighscore(this.state.score);
      }
    } catch (e) { }
    this.setState({ open: true });
    setTimeout(() => this.gameComponent.stop(), 0);
    clearTimeout(this.timer);
  }

  tryAgain = (): void => {
    this.setState({ open: false });
    this.game.reset();
    this.gameComponent.start();
    this.start();
  }

  get gameTime(): number {
    return performance.now() - this.gameStartTime;
  }

  onTargetClick = (target: Target, position: Vector3): void => {
    this.game.removeTarget(target);
    this.game.addSuccessClick({ position });
    this.setState({ score: this.state.score + 1 });
  }

  onBackgroudClick = (position: Vector3): void => {
    this.game.addMissClick({ position });
    // this.game.removeLife();
  }

  onTargetMiss = (target: Target): void => {
    // this.game.removeLife();
  }

  render(): ReactNode {
    const { open, score } = this.state;

    return (
      <div style={{ height: '100vh' }}>
        <Typography variant="h3" color='primary' style={{position: 'absolute', margin: 15, pointerEvents: 'none' }}> { score }</Typography>
        <GameComponent
          ref={this.gameComponentRef}
          onTargetClick={this.onTargetClick}
          onBackgroundClick={this.onBackgroudClick}
        >
        </GameComponent>
        <Modal
          open={open}
          onClose={(): void => this.setState({ open: false })}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          disableBackdropClick={true}
        >
          <div className="paper">
            <Typography style={{ paddingBottom: '20px' }} variant="h6" id="modal-title">
              Your score is: {score}
            </Typography>
            <Button variant="contained" color="primary" onClick={this.tryAgain}> Try Again </Button>
            <Button component={Link} to="/" variant="contained" color="primary" style={{ marginTop: 10 }}>Quit</Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default NormalComponent;
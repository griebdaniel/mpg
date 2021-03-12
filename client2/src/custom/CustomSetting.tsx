import React from 'react';
import { createStyles, Divider, Grid, IconButton, Input, List, ListItem, ListItemText, Slider, Tooltip, Typography, WithStyles, withStyles } from "@material-ui/core";
import { Pause, PlayArrow, Info, Backup, Cached, ArrowBack } from '@material-ui/icons';
import { genericService } from '../services/generic-service';

const styles = createStyles({
  settingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 350,
    padding: 12,
    // '& > *': { marginTop: 15 }
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
  }
});

interface State { 
  user: any;
}

interface Props extends WithStyles<typeof styles> {
  difficulty: number;
  pace: number;
  size: number;
  duration: number;
  speed: number;
  onDifficultyChange?: (difficulty: number) => void;
  onPaceChange?: (pace: number) => void;
  onSizeChange?: (size: number) => void;
  onSpeedChange?: (speed: number) => void;
  onDurationChange?: (duration: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  onSaveSettings?: () => void;
  onLoadSettings?: () => void;
  onHide?: () => void;
}

export class CustomSetting extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  async componentDidMount() {
    try {
      const user = await genericService.getLoggedInUser();
      this.setState({ user });
    } catch (e) { }
  }

  render() {
    const { classes,
      difficulty, pace, size, duration, speed,
      onDifficultyChange, onPaceChange, onSizeChange, onDurationChange, onSpeedChange, onHide
    } = this.props;
    const { user } = this.state;
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip
            title={
              <List>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography style={{textDecoration: 'underline'}}>Difficulty</Typography>
                    }
                    secondary={
                      <Typography variant="body2">
                        As time progresses the difficulty of the game increases. The value of this input resembles the difficulty at a given time in seconds.
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography style={{textDecoration: 'underline'}}>Pace</Typography>
                    }
                    secondary={
                      <Typography variant="body2">
                        How fast the targets appear in target/seconds.
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography style={{textDecoration: 'underline'}}>Size</Typography>
                    }
                    secondary={
                      <Typography variant="body2">
                      onSaveSettings  How big each target will grow in pixels.
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography style={{textDecoration: 'underline'}}>Duration</Typography>
                    }
                    secondary={
                      <Typography variant="body2">
                        How long each target lasts in seconds.
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography style={{textDecoration: 'underline'}}>Speed</Typography>
                    }
                    secondary={
                      <Typography variant="body2">
                        How fast the targets move in pixel/seconds.
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            }
          >
            <Info color="primary" style={{ marginLeft: 12 }} />
          </Tooltip>

          <IconButton
            style={{ alignSelf: 'flex-start' }}
            color="primary"
            onClick={onHide}
          >
            <ArrowBack />
          </IconButton>
        </div>
        <div className={classes.buttonContainer} style={{ marginTop: 20 }}>
          <Tooltip 
            title={'Saves your current settings as default' + (user === null ? '. Only available if you are logged in.' : '')} 
          >
            <span>
              <IconButton disabled={user === null} onClick={this.props.onSaveSettings} color="primary"><Backup /></IconButton>
            </span>
          </Tooltip>
          <Tooltip 
            title={'Loads your default settings' + (user === null ? '. Only available if you are logged in.' : '')} 
          >
            <span>
            <IconButton disabled={user === null} onClick={this.props.onLoadSettings} color="primary"><Cached /></IconButton>
            </span>
          </Tooltip>
          
     
        </div>
        <Divider />
        <div className={classes.settingContainer}>
          <div style={{ marginBottom: 20 }}>
            <Tooltip
              title="As time progresses the difficulty of the game increases. The value of this input resembles the difficulty at a given time in seconds."
              placement="bottom-start"
            >
              <Typography>Difficulty</Typography>
            </Tooltip>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  color="secondary"
                  min={1}
                  max={200}
                  step={1}
                  value={difficulty}
                  onChange={(e, v) => onDifficultyChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={difficulty.toString()}
                  margin="dense"
                  onChange={e => onDifficultyChange(Number(e.target.value))}
                  type="number"
                />
              </Grid>
            </Grid>
          </div>
          <div>
            <Typography>Pace</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={0.5}
                  max={7}
                  step={0.1}
                  value={pace}
                  onChange={(e, v) => onPaceChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={pace.toString()}
                  margin="dense"
                  onChange={e => onPaceChange(Number(e.target.value))}
                  type="number"
                />
              </Grid>
            </Grid>
          </div>
          <div>
            <Typography>Size</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={5}
                  max={180}
                  step={1}
                  value={size}
                  onChange={(e, v) => onSizeChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={size.toString()}
                  margin="dense"
                  onChange={e => onSizeChange(Number(e.target.value))}
                  type="number"
                />
              </Grid>
            </Grid>
          </div>
          <div>
            <Typography>Duration</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={1}
                  max={8}
                  step={0.1}
                  value={duration}
                  onChange={(e, v) => onDurationChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={duration.toString()}
                  margin="dense"
                  onChange={e => onDurationChange(Number(e.target.value))}
                  type="number"
                />
              </Grid>
            </Grid>
          </div>
          <div>
            <Typography>Speed</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={0}
                  max={140}
                  step={1}
                  value={speed}
                  onChange={(e, v) => onSpeedChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={speed.toString()}
                  margin="dense"
                  onChange={e => onSpeedChange(Number(e.target.value))}
                  type="number"
                />
              </Grid>
            </Grid>
          </div>
        </div>
        <Divider style={{ marginTop: 30 }} />
        <div className={classes.buttonContainer}>
          <IconButton onClick={this.props.onPause} color="primary"><Pause /></IconButton>
          <IconButton onClick={this.props.onResume} color="primary"><PlayArrow /></IconButton>
        </div>


      </>
    );
  }
}

export default withStyles(styles)(CustomSetting);
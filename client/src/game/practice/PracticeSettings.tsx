import React from 'react';
import { Divider, Grid, IconButton, Input, List, ListItem, ListItemText, Slider, Tooltip, Typography } from "@material-ui/core";
import { Pause, PlayArrow, Info, Backup, Cached, ArrowBack } from '@material-ui/icons';
import { genericService } from '../../services/generic-service';

interface State {
  user: any;
}

interface Props {
  pace: number;
  size: number;
  duration: number;
  speed: number;
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

export class PracticeSettings extends React.Component<Props, State> {
  constructor(props: Props) {
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
    const { pace, size, duration, speed, onPaceChange, onSizeChange, onDurationChange, onSpeedChange, onHide } = this.props;
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
                      <Typography style={{ textDecoration: 'underline' }}>Pace</Typography>
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
                      <Typography style={{ textDecoration: 'underline' }}>Size</Typography>
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
                      <Typography style={{ textDecoration: 'underline' }}>Duration</Typography>
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
                      <Typography style={{ textDecoration: 'underline' }}>Speed</Typography>
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
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: 350, padding: 12, }}>
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
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <IconButton onClick={this.props.onPause} color="primary"><Pause /></IconButton>
          <IconButton onClick={this.props.onResume} color="primary"><PlayArrow /></IconButton>
        </div>
      </>
    );
  }
}

export default PracticeSettings;
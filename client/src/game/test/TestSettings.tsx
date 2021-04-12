import React from 'react';
import { Divider, FormControl, FormControlLabel, FormLabel, Grid, IconButton, Input, Radio, RadioGroup, Slider, List, ListItem, ListItemText, Tooltip, Typography } from "@material-ui/core";
import { Pause, PlayArrow, Info, ArrowBack, Delete } from '@material-ui/icons';
import { SizeDistribution } from './TestGame';

interface Props {
  limits: { maxX: number, maxY: number, maxSize: number, maxSpeed: number, maxDuration: number }
  xPosition: number;
  yPosition: number;
  size: number;
  speed: number;
  direction: number;
  duration: number;
  age: number;
  sizeDistribution: SizeDistribution;
  onDelete: () => void;
  onXPositionChange: (xPosition: number) => void;
  onYPositionChange: (yPosition: number) => void;
  onSizeChange: (size: number) => void;
  onDurationChange: (duration: number) => void;
  onAgeChange: (age: number) => void;
  onSpeedChange: (speed: number) => void;
  onDirectionChange: (direction: number) => void;
  onSizeDistributionChange: (sizeDistribution: SizeDistribution) => void;
  onPause: () => void;
  onResume: () => void;
}

class TestSettings extends React.Component<Props, {}> {
  render() {
    const {
      limits, xPosition, yPosition, size, duration, age, speed, direction, sizeDistribution,
      onDelete, onXPositionChange, onYPositionChange, onSizeChange, onDurationChange, onAgeChange, onSpeedChange, onDirectionChange, onSizeDistributionChange, onPause, onResume,
    } = this.props;
    const { maxX, maxY, maxSize, maxSpeed, maxDuration } = limits;


    return (
      <>
        <Tooltip
          title={
            <List>
              <ListItem>
                <ListItemText
                  secondary={
                    <Typography variant="body2">
                      This a test mode to analyze the movement and collision of targets.
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  secondary={
                    <Typography variant="body2">
                      Clicking at any position will add a target at the position with the settings specified in the controls.
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  secondary={
                    <Typography variant="body2">
                      Clicking a target will select it, and it's settings will be loaded to the appropriate controls.
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  secondary={
                    <Typography variant="body2">
                      You can change the position, size, speed, and direction of each target by dragging them or using the controls.
                    </Typography>
                  }
                />
              </ListItem>  
            </List>
          }
        >
          <Info color="primary" style={{ marginLeft: 12, marginTop: 12 }} />
        </Tooltip>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={onDelete} color="primary"><Delete /></IconButton>
        </div>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: sizeDistribution === 'constant' ? 450 : 600, padding: 12, }}>
          <div>
            <FormControl component="fieldset" style={{ marginBottom: 20 }}>
              <FormLabel component="legend">Size change</FormLabel>
              <RadioGroup value={sizeDistribution} onChange={e => onSizeDistributionChange(e.target.value as any)}>
                <FormControlLabel value="constant" control={<Radio />} label="Constant" />
                <FormControlLabel value="linear" control={<Radio />} label="Linear" />
              </RadioGroup>
            </FormControl>
            <Typography>Position(x-axis)</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={-maxX}
                  max={maxX}
                  step={1}
                  value={xPosition}
                  onChange={(e, v) => onXPositionChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={xPosition.toString()}
                  margin="dense"
                  onChange={e => onXPositionChange(Number(e.target.value))}
                  type="number"
                />
              </Grid>
            </Grid>
            <Typography>Position(y-axis)</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={-maxY}
                  max={maxY}
                  step={1}
                  value={yPosition}
                  onChange={(e, v) => onYPositionChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={yPosition}
                  margin="dense"
                  onChange={e => onYPositionChange(Number(e.target.value))}
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
                  min={20}
                  max={maxSize}
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
            <Typography>Speed</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={0}
                  max={maxSpeed}
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
          <div>
            <Typography>Direction</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={direction}
                  onChange={(e, v) => onDirectionChange(v as number)}
                />
              </Grid>
              <Grid item>
                <Input
                  style={{ width: 42 }}
                  value={direction.toString()}
                  margin="dense"
                  onChange={e => onDirectionChange(Number(e.target.value))}
                  type="number"
                />
              </Grid>
            </Grid>
          </div>
          {sizeDistribution === 'linear' &&
            <>
              <div>
                <Typography>Duration</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      min={0}
                      max={maxDuration}
                      step={0.1}
                      value={duration}
                      onChange={(e, v) => onDurationChange(v as number)}
                    />
                  </Grid>
                  <Grid item>
                    <Input
                      style={{ width: 42 }}
                      value={duration === Infinity ? '' : duration}
                      margin="dense"
                      onChange={e => onDurationChange(Number(e.target.value))}
                      type="number"
                    />
                  </Grid>
                </Grid>
              </div>
              <div>
                <Typography>Age</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      min={0}
                      max={duration}
                      step={0.1}
                      value={age}
                      onChange={(e, v) => onAgeChange(v as number)}
                    />
                  </Grid>
                  <Grid item>
                    <Input
                      style={{ width: 42 }}
                      value={age}
                      margin="dense"
                      onChange={e => onAgeChange(Number(e.target.value))}
                      type="number"
                    />
                  </Grid>
                </Grid>
              </div>
            </>}
        </div>
        <Divider style={{ marginTop: 30 }} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={onPause} color="primary"><Pause /></IconButton>
          <IconButton onClick={onResume} color="primary"><PlayArrow /></IconButton>
        </div>
      </>
    );

  }
}

export default TestSettings;
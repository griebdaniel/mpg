import React, { Children, useState } from 'react';
import { createStyles, Divider, duration, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, InputAdornment, makeStyles, Radio, RadioGroup, Slider, TextField, Typography, WithStyles } from '@material-ui/core';
import { TargetSizeDistribution } from '../game/TestTarget';
import _ from 'lodash';
import { Pause, PlayArrow } from '@material-ui/icons';


type SettingDisplay = 'Input' | 'Slider'

const useStyles = makeStyles({
  formGroup: {
    padding: 10,
    '& > *': { marginTop: 12 }
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
  }
});

const InputSetting = (props: {
  value: any;
  label: string;
  adorment: string;
  onChange: (v: any) => void;
}) => {
  const { value, label, adorment, onChange } = props;
  return (
    <TextField
      variant="outlined" label={label} type="number"
      value={value.toString()}
      InputProps={{
        endAdornment: <InputAdornment position="end">{adorment}</InputAdornment>,
      }}
      onChange={(e): void => onChange(parseFloat(e.target.value))}
    />
  );
};

const SliderSetting = (props: {
  value: any;
  min: number;
  max: number;
  label: string;
  onChange: (v: any) => void;
}) => {
  const { value, min, max, label, onChange } = props;
  return (
    <>
      <Typography variant="body2" >{label}</Typography>
      <Slider
        min={min}
        max={max}
        value={value}
        onChange={(e, v): void => onChange(v)}
        valueLabelDisplay="auto"
      />
    </>
  );
};


interface NumericSettingProps {
  initialValue?: number;
  value?: number;
  onChange: (value: number) => void;
  label: string;
  display: SettingDisplay;
  adorment: string;
  min: number;
  max: number;
}

const NumericSetting = ({
  value,
  onChange,
  display = 'Input',
  label,
  adorment,
  min,
  max
}: NumericSettingProps) => {
  const commonProps = { label, value, onChange, };

  return (
    <>
      {display === 'Input' &&
        <InputSetting
          {...commonProps}
          adorment={adorment}
        />}

      {display === 'Slider' &&
        <SliderSetting
          {...commonProps}
          min={min}
          max={max}

        />}
    </>
  );
};

interface RadioButtonsGroupProps {
  options: string[];
  value: string;
  label: string;
  onChange: (value: any) => void;
}

const NSetting = (props: any) => {
  return (
    <>
      {props.children}
    </>
  );
};

const RadioButtonsGroup = ({
  options,
  value,
  label,
  onChange,
}: RadioButtonsGroupProps) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup value={value} onChange={e => onChange(e.target.value)}>
        {options.map(option => <FormControlLabel key={option} value={option} control={<Radio size="small" />} label={option} />)}
      </RadioGroup>
      <NSetting component={Slider}  ></NSetting>
    </FormControl>
  );
};

const PauseResume = ({ onPause, onResume }: any) => {
  const classes = useStyles();
  return (
    <div className={classes.buttonContainer}>
      <IconButton onClick={onPause} color="primary"><Pause /></IconButton>
      <IconButton onClick={onResume} color="primary"><PlayArrow /></IconButton>
    </div>
  );
};

interface SettingsProps {
  display?: SettingDisplay;
  size: number;
  duration: number;
  speed: number;
  onSizeChange: (size: number) => void;
  onSpeedChange: (speed: number) => void;
  onDurationChange: (duration: number) => void;
  onPause?: () => void;
  onResume?: () => void;
}

interface TestSettingsProps extends SettingsProps {
  input: number;
  distribution: TargetSizeDistribution;
  onInputChange: (input: number) => void;
  onDistributionChange: (distribution: TargetSizeDistribution) => void;
}

interface CustomSettingsProps extends SettingsProps {
  difficulty: number;
  pace: number;
  onDifficultyChange: (difficulty: number) => void;
  onPaceChange: (pace: number) => void;
}

const TestSettings = ({
  speed,
  size,
  input,
  duration,
  distribution,
  onSizeChange,
  onSpeedChange,
  onDurationChange,
  onInputChange,
  onDistributionChange,
  display: displayInput = 'Input',
  onPause,
  onResume
}: TestSettingsProps) => {
  const [display, setDisplay] = useState<SettingDisplay>(displayInput);

  const classes = useStyles();


  const numericSettings: NumericSettingProps[] = [
    { label: 'Size', adorment: 'px', display, min: 10, max: 400, value: size, onChange: onSizeChange },
    { label: 'Speed', adorment: 'px/s', display, min: 0, max: 400, value: _.round(speed), onChange: onSpeedChange },
  ];

  if (distribution === 'Linear') {
    numericSettings.push(
      { label: 'Input', adorment: '[0,1]', display, min: 0, max: 1, value: _.round(input, 1), onChange: onInputChange },
      { label: 'Duration', adorment: 's', display, min: 1, max: 12, value: duration, onChange: onDurationChange },
    );

  }

  return (
    <>
      <FormGroup className={classes.formGroup}>
        <RadioButtonsGroup
          options={['Input', 'Slider']}
          value={display}
          label='Display'
          onChange={setDisplay}
        />
        {numericSettings.map(settings => <NumericSetting key={settings.label} {...settings} />)}
        <RadioButtonsGroup
          options={['Constant', 'Linear']}
          value={distribution}
          label='Distribution'
          onChange={onDistributionChange}
        />
      </FormGroup>
      <Divider />
      <PauseResume
        onPause={onPause}
        onResume={onResume}
      />
    </>

  );
};

const CustomSettings = ({
  difficulty,
  pace,
  speed,
  size,
  duration,
  onDifficultyChange,
  onSizeChange,
  onSpeedChange,
  onDurationChange,
  onPaceChange,
  display: displayInput = 'Input',
  onPause,
  onResume
}: CustomSettingsProps) => {
  const [display, setDisplay] = useState<SettingDisplay>(displayInput);
  const classes = useStyles();

  const numericSettings: NumericSettingProps[] = [
    { label: 'Difficulty', adorment: 'time', display, min: 1, max: 100, value: difficulty, onChange: onDifficultyChange },
    { label: 'Page', adorment: 'target/s', display, min: 1, max: 20, value: pace, onChange: onPaceChange },
    { label: 'Size', adorment: 'px', display, min: 10, max: 400, value: size, onChange: onSizeChange },
    { label: 'Speed', adorment: 'px/s', display, min: 0, max: 400, value: _.round(speed), onChange: onSpeedChange },
    { label: 'Duration', adorment: 's', display, min: 1, max: 12, value: duration, onChange: onDurationChange },
  ];

  return (
    <>
      <FormGroup className={classes.formGroup}>
        <RadioButtonsGroup
          options={['Input', 'Slider']}
          value={display}
          label='Display'
          onChange={setDisplay}
        />
        {numericSettings.map(settings => <NumericSetting key={settings.label} {...settings} />)}

      </FormGroup>
      <Divider />
      <PauseResume
        onPause={onPause}
        onResume={onResume}
      />
    </>
  );
};

export { TestSettings, CustomSettings };
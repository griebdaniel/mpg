import _ from 'lodash';

const paceChange = [[0, 60, 240], [1, 2.5, 7]];
const sizeChange = [[0, 60], [60, 25]];
const durationChange = [[0, 60], [4, 1.7]];
const speedChange = [[0, 60], [0, 125]];

const settingAtTime = (time: number, changes: number[][]): number => {
  const x = changes[0];
  const y = changes[1];
  const i = x.findIndex(settingTime => time < settingTime);
  if (i === -1) {
    return _.last(y);
  }
  const a = (y[i] - y[i - 1]) / (x[i] - x[i - 1]);
  const b = y[i] - a * x[i];  
  return a * time + b;
};

const settingsAtTime = (time: number) => {
  const pace = settingAtTime(time, paceChange);
  const size = settingAtTime(time, sizeChange);
  const duration = settingAtTime(time, durationChange);
  const speed = settingAtTime(time, speedChange);
  return { pace, size, duration, speed };
};

// the settings at the time when the 'score'-th target appears on screen  
const settingsAtScore = (score: number) => {
  let time = 0;
  for (let i = 1; i < score; i++) {
    time += settingsAtTime(time).pace;
  }
  return settingsAtTime(time);
};

export { settingsAtTime, settingsAtScore };

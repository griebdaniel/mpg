import _ from 'lodash';
import React, { ReactNode } from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, TextField, Typography, Dialog, DialogTitle, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Menu, MenuItem, ListItemIcon, Tooltip, ListItem, List, ListItemText, Card, CardContent, CardHeader, IconButton } from '@material-ui/core';
import { genericService } from '../services/generic-service';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { AccountCircleRounded, Info, Person, ExitToApp } from '@material-ui/icons';

const styles = createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    height: '300px',
    backgroundColor: 'rgb(66, 84, 185)',
    justifyContent: 'center',
  },
  signupTitle: {
    alignSelf: 'center',
    marginBottom: 40,
    fontWeight: 400,
  },
  headerText: {
    alignSelf: 'center',
    color: 'white',
    opacity: 0.9,
    marginBottom: 50
  },
  customWidth: {
    maxWidth: 500,
  },
  dot: {
    height: 25,
    width: 25,
    backgroundColor: '#bbb',
    borderRadius: '50%',
    display: 'inline-block',
  }
});

type Props = WithStyles<typeof styles>;

interface State {
  loggedIn?: boolean;
  loggedInUser?: any;
  usernameDialogOpen?: boolean;
  leaderboard?: any[];
  rank?: number;
  serverDown?: boolean;
  anchorEl: null | HTMLElement;
}

class MainComponent extends React.Component<Props, State> {
  state: State = {
    loggedIn: false,
    loggedInUser: null,
    usernameDialogOpen: false,
    leaderboard: [],
    rank: 0,
    serverDown: false,
    anchorEl: null
  }

  async componentDidMount() {
    try {
      const loggedIn = await genericService.isLoggedIn();
      const loggedInUser = await genericService.getLoggedInUser();
      const leaderboard = await genericService.getLeaderboard();
      const rank = await genericService.getRank();
      const usernameDialogOpen = loggedIn && !loggedInUser.username;
      this.setState({ loggedIn, loggedInUser, usernameDialogOpen, leaderboard, rank });
    } catch (e) {
      this.setState({ serverDown: true });
    }
  }

  login = async () => {
    const res = genericService.login();
  }

  logout = async (): Promise<void> => {
    genericService.logout();
    this.setState({ loggedIn: false });
  }

  onMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  SelectUsernameDialog = (props) => {
    const { onSave, open } = props;

    const validationSchema = yup.object({
      username: yup.string().min(3, 'At least 3 characters').max(16, 'Maximum 16 characters')
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const formik = useFormik({
      initialValues: {
        username: ''
      },
      validationSchema,
      onSubmit: (values) => {
        onSave(values.username);
      },
      validate: async (values) => {
        const errors: any = {};
        if (!await genericService.isUsernameAvailable(values.username)) {
          errors.username = 'Username not available';
        }
        return errors;
      },
      validateOnChange: false
    });

    return (
      <Dialog open={open}>
        <DialogTitle>Pick a username</DialogTitle>
        <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={formik.handleSubmit}>
          <TextField
            style={{ margin: 20 }}
            label="username" name="username" id="username"
            value={formik.values.username} onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            required
          />
          <Button color="primary" variant="contained" style={{ margin: 25 }} type="submit">Save</Button>
        </form>
      </Dialog>
    );
  }

  render(): ReactNode {
    const { classes } = this.props;
    const { loggedIn, usernameDialogOpen, loggedInUser, leaderboard, rank, serverDown, anchorEl } = this.state;

    const onSave = async (username) => {
      const res = await genericService.setUsername(username);
      if (res) {
        this.setState({ usernameDialogOpen: false });
      }
    };

    return (
      <div className={classes.root}>
        <AppBar elevation={10} position="relative">
          <Toolbar style={{ display: 'flex', flexDirection: 'row', justifyItems: 'center' }}>
            <Button
              color="primary"
              variant="contained"
              component={RouterLink} to="/support"
              style={{ filter: "brightness(120%)" }}
            >
              Support
            </Button>

            {loggedIn ?
              <div style={{ marginLeft: 'auto' }}>
                <IconButton color="inherit" onClick={this.onMenuClick}>
                  <AccountCircleRounded />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => this.setState({ anchorEl: null })}
                >
                  <MenuItem disabled={true} component={RouterLink} to="/profile">
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    <Typography>Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={this.logout}>
                    <ListItemIcon>
                      <ExitToApp fontSize="small" />
                    </ListItemIcon>
                    <Typography>Logout</Typography>
                  </MenuItem>
                </Menu>
              </div> :
              <Button style={{ marginLeft: 'auto' }} variant="contained" color="primary" disabled={serverDown} onClick={this.login}>Login</Button>
            }
          </Toolbar>
        </AppBar>

        <header color="primary" className={classes.header}>
          <Typography variant="h4" className={classes.headerText} align="center">
            Test and improve your mouse skills
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <Button
              style={{ marginRight: 10, filter: "brightness(125%)" }}
              component={RouterLink} to="/standard" size="large" variant="contained" color="primary"
            >
              Play
            </Button>
            <Button
              style={{ filter: "brightness(125%)" }}
              component={RouterLink} to="/practice" size="large" variant="contained" color="primary">
              Practice
              </Button>
          </div>

        </header>

        <div>
          {serverDown ?
            <Typography color="error" align="center" variant="h5" style={{ margin: '40px 300px' }}>
              Server is currently down. You can still play but your score will not be saved.
            </Typography> :

            <div style={{ display: 'flex', justifyContent: 'space-around', margin: 20 }}>
              <div>
                <Card variant="outlined" style={{ width: 500 }}>
                  <CardHeader title="About this game"></CardHeader>
                  <CardContent>
                    <List >
                      <ListItem divider={true}>
                        <Typography variant="body1">
                          This game is for anyone who want to improve their mouse speed and accuracy. This game is quite difficult so don't  feel bad about having a bad socre. You can start the game by clicking the PLAY button.
                        </Typography>
                      </ListItem>
                      <ListItem divider={true}>
                        <Typography variant="body1">Targets appear at a fast pace at random positions for 60 seconds. The goal is to click as many of them as you can.</Typography>
                      </ListItem>
                      <ListItem divider={true}>
                        <Typography variant="body1">
                          The targets with color pink, orange and yellow worth extra points: 2, 3 and 4 respectively.
                        </Typography>
                      </ListItem>
                      <ListItem divider={true}>
                        <Typography variant="body1">
                          If you want to customize the settings, like the pace, size, duration or speed try practice mode by clicking the PRACTICE button.
                        </Typography>
                      </ListItem>
                      <ListItem divider={true}>
                        <Typography variant="body1">
                          Logging in is not required to play the game, but it's needed to appear on the leaderboard and some other features.
                        </Typography>
                      </ListItem>
                      <ListItem>
                        <Typography variant="body1">
                          If you experience any issues you can send a message by clicking the support button at the top.
                        </Typography>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </div>
              <Card
                style={{ width: 500, alignSelf: 'flex-start', backgroundColor: '#f9f8f8' }}
                variant="outlined"
              >
                <CardHeader
                  title="Leaderboard"
                  subheader={loggedIn ? `You are #${rank} with a highscore of ${loggedInUser?.highscore}` : 'Log in to see your rank'}
                >
                </CardHeader>
                <CardContent style={{ padding: 0 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Highscore</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaderboard.map((user, index) => (
                        <TableRow key={user.username}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.highscore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          }

        </div>
        <this.SelectUsernameDialog onSave={onSave} open={usernameDialogOpen} />
      </div>
    );
  }
}

export default withStyles(styles)(MainComponent);

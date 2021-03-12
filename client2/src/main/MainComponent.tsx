import _ from 'lodash';
import React, { ReactNode, ReactElement, FC } from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, TextField, Typography, Dialog, DialogTitle, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Menu, MenuItem, ListItemIcon, Tooltip, ListItem, List, ListItemText, Card, CardContent, CardHeader, IconButton } from '@material-ui/core';
import './MainComponent.css';
import { genericService } from '../services/generic-service';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { AccountBox, AccountCircleRounded, Brightness1, ExitToApp, Face, Info, Person } from '@material-ui/icons';

const styles = createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
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
            <Tooltip
              classes={{ tooltip: classes.customWidth }}
              title={
                <List>
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="h6" style={{ color: 'red' }}>IMPORTANT!</Typography>}
                      secondary={<Typography style={{ color: 'red' }} >This game is currently in beta, buggs are expected. If you experience any issues please send a message, you  can do that in the support page.</Typography>}
                    >
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="h6">Notes</Typography>}
                      secondary={
                        <List>
                          <ListItem>
                            <Typography style={{ color: 'white' }}>
                              This game was build primarly for gamers who want to test and improve their mouse accuracy.
                            </Typography>
                          </ListItem>
                          <ListItem>
                            <Typography style={{ color: 'white' }}>Click PLAY if you want to test your skills or PRACTICE if you want to improve.</Typography>
                          </ListItem>
                          <ListItem>
                            <Typography style={{ color: 'white' }}>
                              If you are not logged in your highscore will not be saved, only registed users appear on the leaderboard.
                            </Typography>
                          </ListItem>
                        </List>
                      }
                    />
                  </ListItem>
                </List>
              }
            >
              <Info color="secondary" style={{ marginRight: 30 }} />
            </Tooltip>
            <Button
              color="primary"
              variant="contained"
              component={RouterLink} to="/support"
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

        <header color="primary" className="header">
          <Typography variant="h4" className={classes.headerText} align="center">
            Test and improve your mouse skills
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <Button
              style={{ marginRight: 10, filter: "brightness(120%)" }}
              component={RouterLink} to="/normal" size="large" variant="contained" color="primary" className="startButton"
            >
              Play
            </Button>
            <Button
              style={{ filter: "brightness(120%)" }}
              component={RouterLink} to="/custom" size="large" variant="contained" color="primary" className="startButton">
              Practice
              </Button>
          </div>

        </header>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {serverDown ?
            <Typography color="error" align="center" variant="h5" style={{ margin: '40px 300px' }}>
              Server is currently down. You can still play but your score will not be saved.
            </Typography> :
            <>
              <Card
                style={{ width: 500, alignSelf: 'center', backgroundColor: '#f9f8f8', marginTop: 40 }}
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
            </>
          }

        </div>
        <this.SelectUsernameDialog onSave={onSave} open={usernameDialogOpen} />
      </div>
    );
  }
}

export default withStyles(styles)(MainComponent);

import _ from 'lodash';
import React, { ReactNode, ReactElement } from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Modal, TextField, Typography, Link, Menu, MenuItem, Snackbar, Dialog, DialogTitle } from '@material-ui/core';
import './MainComponent.css';
import { genericService } from '../services/generic-service';
import { User, SignUpResponse, SignInResponse } from '../types';

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
    fontFamily: 'Roboto',
    fontWeight: 200,
    fontSize: 62,
    alignSelf: 'center',
    color: 'white',
    opacity: 0.9,
    marginBottom: 70
  }
});

type Props = WithStyles<typeof styles>;

interface State {
  loggedIn?: boolean;
  user?: any;
  usernameDialogOpen?: boolean;
}

class MainComponent extends React.Component<Props, State> {
  state = {
    loggedIn: false,
    user: null,
    usernameDialogOpen: false,
  }

  constructor(props: Props) {
    super(props);
  }

  async componentDidMount() {
    console.log('hello');
    const loggedIn = await genericService.isLoggedIn();
    const user = await genericService.getUser();
    console.log('user = ', user);
    const usernameDialogOpen = loggedIn && !user.username;
    this.setState({ loggedIn, user, usernameDialogOpen });
  }

  login = async () => {
    const res = genericService.login();
    console.log(res);
  }

  logout = async (): Promise<void> => {
    genericService.logout();
    this.setState({ loggedIn: false });
  }

  SelectUsernameDialog = (props) => {
    const { onSave, open } = props;
    const [username, setUsername] = React.useState('');

    return (
      <Dialog open={open}>
        <DialogTitle>Pick a unsername</DialogTitle>
        <div className="pick-username-input">
        <TextField  label="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>

        <Button color="primary" variant="contained" style={{ margin: 15 }} onClick={() => onSave(username)}>Save</Button>
      </Dialog>
    );
  }

  render(): ReactNode {
    const { classes } = this.props;
    const { loggedIn, usernameDialogOpen } = this.state;

    const onSave = async (username) => {
      const res =  await genericService.setUsername(username);
      if (res) {
        this.setState({ usernameDialogOpen: false });
      }
    };

    return (
      <div className={classes.root}>
        <AppBar elevation={10} position="relative">
          <Toolbar className="button-container">
            <div>
              <Button color="inherit"><RouterLink className="link" to="/custom/">Custom</RouterLink></Button>
              <Button color="inherit"><RouterLink className="link" to="/test/">Test</RouterLink></Button>
            </div>
            <Button color="inherit" onClick={loggedIn ? this.logout : this.login}>{loggedIn ? 'Log Out' : 'Log In'}</Button>
          </Toolbar>
        </AppBar>

        <header color="primary" className="header">
          <div className={classes.headerText}>
            Mouse Practice Game
          </div>
          <Button size="large" variant="contained" color="primary" className="startButton">
            <RouterLink className="link" to="/normal/">Start</RouterLink>
          </Button>
        </header>

        <this.SelectUsernameDialog onSave={onSave} open={usernameDialogOpen} />
      </div>
    );
  }
}

export default withStyles(styles)(MainComponent);

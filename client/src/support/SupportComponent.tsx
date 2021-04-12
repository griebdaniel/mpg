import { Button, Divider, List, ListItem, ListItemText, Snackbar, TextField, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';

import { genericService } from '../services/generic-service';

interface State {
  openAlert: boolean;
  message: string;
}

class SupportComponent extends React.Component<{}, State> {
  maxMessageLength = 500;

  constructor(props) {
    super(props);
    this.state = { openAlert: false, message: '' };
  }


  sendMessage = async () => {
    try {
      const res = await genericService.setMessage(this.state.message);
      console.log(res);
      this.setState({ openAlert: true });
    } catch (e) {}
    

  }

  closeAlert = () => {
    this.setState({ openAlert: false });
  }

  render() {
    const { message, openAlert } = this.state;
    return (
      <>
        <div style={{ margin: 20 }}>
          <Typography variant="h6">List of known issues:</Typography>
          <List>
            <ListItem>
              <Typography variant="body1" style={{ opacity: 0.6 }}>It is only possible to login with your google account. Other options won't be added in the near future.</Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1" style={{ opacity: 0.6 }}>Low fps in firefox. It should work well in google chrome.</Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1" style={{ opacity: 0.6 }}>Profile page is not accessable so changing username is not possible right now. It will be added in the next update.</Typography>
            </ListItem>
          </List>
        </div>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TextField
            style={{ width: 450, margin: 40 }}
            multiline={true}
            value={message}
            onChange={event => this.setState({ message: event.target.value })}
            inputProps={{ maxLength: this.maxMessageLength }}
            rows={10}
            rowsMax={10}
            helperText={`${message.length}/${this.maxMessageLength}`}
            placeholder="If you have experienced any new issues please enter it here"
          />
          <Button onClick={this.sendMessage} color="primary" variant="contained" style={{ width: 100, marginLeft: 40 }}>Send</Button>
          <Snackbar open={openAlert} autoHideDuration={2500} onClose={this.closeAlert}>
            <Alert elevation={6} severity="success">Your message has been sent successfully!</Alert>
          </Snackbar>
        </div>

      </>
    );
  }
}

export default SupportComponent;
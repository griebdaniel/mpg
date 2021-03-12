import { Button, Divider, List, ListItem, ListItemText, TextField, Typography } from '@material-ui/core';
import React from 'react';

class SupportComponent extends React.Component {

  render() {
    return (
      <>
        <List style={{ margin: 20 }}>
          <ListItem>
            <ListItemText
              primary={<Typography variant="h6">List of known issues:</Typography>}
              secondary={
                <List>
                  <ListItem>
                    <Typography variant="body1">It is only possible to login with your google account. Other options won't be added in the near future.</Typography>
                  </ListItem>
                  <ListItem>
                    <Typography variant="body1">Low fps in firefox. It should work well in google chrome.</Typography>
                  </ListItem>
                  <ListItem>
                    <Typography variant="body1">Profile page is not accessable so changing username is not possible right now. It will be added in the next update.</Typography>
                  </ListItem>
                </List>
              }
            />
          </ListItem>
        </List>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TextField
            style={{ width: 450, margin: 40 }}
            multiline={true}
            rows={10}
            rowsMax={10}
            placeholder="If you have experienced any new issues please enter it here"
          />
          <Button color="primary" variant="contained" style={{ width: 100, marginLeft: 40 }}>Send</Button>
        </div>

      </>
    );
  }
}

export default SupportComponent;
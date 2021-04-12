import React from 'react';
import { Card, CardHeader, CardContent, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { genericService } from '../services/generic-service';

interface State {
  messages: { id: number; message: string; date: string; }[];
}

export default class AdminPage extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
  }
  async componentDidMount() {
    const messages = await genericService.getMessages();
    console.log(messages);
    this.setState({ messages });
  }

  render() {
    const { messages } = this.state;
    return (
      <div>
        <Card
          style={{ width: 500, margin: 30, backgroundColor: '#f9f8f8' }}
          variant="outlined"
        >
          <CardHeader
            title="Issues reported by users"
          >
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Issue description</TableCell>
                  <TableCell>Date of report</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.map((message, index) => (
                  <TableRow key={index}>
                    <TableCell>{message.message}</TableCell>
                    <TableCell style={{width: 120}}>{new Date(message.date).toDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
}
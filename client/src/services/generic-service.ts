import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;
const config = { withCredentials: true };

class GenericService {
  private loggedInUser = null;;

  async login() {
    window.location.href = serverUrl + '/auth/google';
  }

  async logout() {
    await axios.get(serverUrl + '/logout', config);
  }

  async getLoggedInUser() {
    if (this.loggedInUser) {
      return this.loggedInUser;
    }
    return this.loggedInUser = await this.getUser();
  }

  async getUser(variables = {}) {
    const query = `
      query GetUser($username: String) {
        user(username: $username) {
          username
          highscore
          name
          settings {
            pace
            size
            duration
            speed
          }
        }
      }`;
    const res = await axios.post(serverUrl + '/graphql', { query, variables }, config);
    return res.data.data.user;
  }

  async getLeaderboard() {
    const query = `
      {
        leaderboard {
          username
          highscore
        }
      }`;
    const res = await axios.post(serverUrl + '/graphql', { query }, config);
    return res.data.data.leaderboard;
  }

  async getRank() {
    const query = `
      {
        rank
      }`;
    const res = await axios.post(serverUrl + '/graphql', { query }, config);
    return res.data.data.rank;
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.getLoggedInUser() ? true : false;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    return await this.getUser({ username }) ? false : true;
  }

  async setUsername(username: string): Promise<any> {
    const query = `
      mutation {
        updateUser {
          username(username: "${username}") {
            username
          }
        }
      }
    `;

    const res = await axios.post(serverUrl + '/graphql', { query }, config);
    return res.data.data;
  }

  async setHighscore(highscore: number): Promise<boolean> { 
    const query = `
      mutation {
        updateUser {
          highscore(highscore: ${highscore}) {
            username
            highscore
          }
        }
      }
    `;
    const res = await axios.post(serverUrl + '/graphql', { query }, config);
    return res.data.data;
  }

  async updateSettings(settings: any): Promise<boolean> {
    const query = `
    mutation updateUser($settings: SettingsInput) {
      updateUser(email: "griebdaniel94@gmail.com") {
        settings(settings: $settings) {
          username
          settings {
            pace
            size
            duration
            speed
          }
        }
      }
    }`;
    const res = await axios.post(serverUrl + '/graphql', { query, variables: { settings } }, config);
    return res.data.data;
  }

  async setMessage(message: string): Promise<boolean> {
    const query = `
      mutation setMessage($message: String) {
        message(message: $message)
      }`;
    const res = await axios.post(serverUrl + '/graphql', { query, variables: { message } }, config);
    return res.data.data;
  }

  async getMessages(): Promise<any[]> {
    const query = `
    query {
      messages {
        message
        date
      }
    }`;
    const res = await axios.post(serverUrl + '/graphql', { query}, config);
    return (res.data.data as any).messages;
  }
}

export const genericService = new GenericService();
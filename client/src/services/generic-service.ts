import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;
const config = { withCredentials: true };

class GenericService {
  async login() {
    window.location.href = serverUrl + '/auth/google';
  }

  async logout() {
    await axios.get(serverUrl + '/logout', config);
  }

  async isLoggedIn(): Promise<boolean> {
    console.log(serverUrl);
    const res = await axios.get(serverUrl + '/user/logged', { withCredentials: true });
    return res.data;
  }

  async setUsername(username: string): Promise<boolean> {
    const res = await axios.get(serverUrl + '/set/username', { ...config, params: { username } });
    return res.data;
  }

  async getUser() {
    return await (await axios.get(serverUrl + '/user', config)).data;
  }
}

export const genericService = new GenericService();
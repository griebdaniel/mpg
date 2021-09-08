import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { PrismaClient, User, Message } from '@prisma/client';
import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import path from 'path';

import dotenv from 'dotenv';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const schema = buildSchema(`
  scalar Date

  type Settings {
    pace: Float
    size: Int
    duration: Int
    speed: Int
  }

  type User {
    id: String!
    name: String!
    email: String!
    username: String
    highscore: Int!
    settings: Settings
  }

  type Message {
    id: Int
    message: String!
    date: Date!
  }

  type Query {
    users: [User]
    messages: [Message]
    user(id: String, email: String, username: String): User
    leaderboard(top: Int = 20): [User]
    rank(username: String): Int
  }

  input SettingsInput {
    pace: Float
    size: Int
    duration: Int
    speed: Int
  }

  type UserUpdate {
    username(username: String): User
    highscore(highscore: Int): User
    settings(settings: SettingsInput): User
  }

  type Mutation {
    updateUser(id: String, email: String, username: String): UserUpdate
    message(message: String): Boolean
  }
`);

class UserUpdate {
  constructor(private user: any) { }

  username = async ({ username }: any) => {
    try {
      const res = await prisma.user.update({ where: { id: this.user.id }, data: { username } });
      return res;
    } catch (e) {
      return null;
    }
  }
  highscore = async ({ highscore }: any) => {
    try {
      const res = await prisma.user.update({ where: { id: this.user.id }, data: { highscore } });
      return res;
    } catch (e) {
      return null;
    }
  }
  settings = async ({ settings }: any) => {
    try {
      const res = await prisma.user.update({ where: { id: this.user.id }, data: { settings } });
      return res;
    } catch (e) {
      return null;
    }
  }
}

// The root provides a resolver function for each API endpoint
const rootValue = {
  users: async () => await prisma.user.findMany(),
  messages: async () => await prisma.message.findMany(),
  user: async ({ id, email, username }: any, req: Request) => {
    const where = id ? { id } : (email ? { email } : (username ? { username } : { id: (req.user as any).id }));
    return await prisma.user.findFirst({ where });
  },
  leaderboard: async ({ top }: any) => {
    const users = await prisma.user.findMany();
    users.sort((u1, u2) => u2.highscore - u1.highscore).slice(0, top);
    return users;
  },
  rank: async ({ username }: any, req: Request) => {
    if (!username && !req.user) {
      return 0;
    }
    console.log(username, req.user);
    if (!username) {
      username = (req.user as any).username;
    }
    const rank = (await rootValue.leaderboard(Number.MAX_VALUE)).findIndex(user => user.username === username) + 1;
    return rank;  
  },
  updateUser: async ({ id, email, username }: any, req: Request) => {
    const where = id ? { id } : (email ? { email } : (username ? { username } : { id: (req.user as any).id }));
    const user = await prisma.user.findFirst({ where });
    return new UserUpdate(user);
  },
  message: async ({ message }: any) => {
    await prisma.message.create({ data: { message, date: new Date() } });
    return true;
  }
};

app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));

app.use(session({
  store: new (pgSession(session))({ conString: process.env.DATABASE_URL }),
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (userid: string, done) => {
  const user = await prisma.user.findFirst({ where: { id: userid } });
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: process.env.CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  let user = await prisma.user.findFirst({ where: { id: profile.id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: profile.id,
        email: profile.emails![0].value,
        name: profile.displayName,
      }
    });
  }
  return done(null as any, user);
}));

app.use('/graphql', graphqlHTTP({
  schema, rootValue, graphiql: true
}));

//Unprotected Routes
app.get('/', (req, res) => {
  res.send('<h1>Home</h1>');
});

app.get('/user/logged', (req, res) => {
  res.send(req.user ? true : false);
});

app.get('/auth/fail', (req, res) => {
  res.send(false);
});

const checkUserLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  req.user ? next() : res.sendStatus(401);
};

//Protected Route.
app.get('/auth/success', checkUserLoggedIn, (req, res) => {
  res.redirect(process.env.LOGIN_SUCCESS_REDIREC_URL as string);
});

app.get('/username/available', async (req, res) => {
  const username = req.query.username as string;
  const user = await prisma.user.findFirst({ where: { username } });
  res.send(user ? false : true);
});

app.get('/set/username', async (req, res) => {
  try {
    await prisma.user.update({ where: { id: (req.user as any).id }, data: { username: req.query.username as string } });
    res.send(true);
  } catch (e) {
    res.send(false);
  }
});

app.get('/user', async (req, res) => {
  res.send(req.user);
});

// Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/fail', successRedirect: '/auth/success' }));

//Logout
app.get('/logout', (req, res) => {
  req.session.destroy(data => data);
  req.logout();
  res.send();
});


app.use(express.static(path.join(__dirname, '../../client/build')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

app.listen(process.env.PORT, () => console.log(`App is listening on port ${process.env.PORT}`));

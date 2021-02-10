import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { PrismaClient, User } from '@prisma/client';

import dotenv from 'dotenv';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors({origin: ['http://localhost:3000'], credentials: true}));

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
  const username = req.body.username;
  const user = await prisma.user.findFirst({ where: { username } });
  res.send(user ? true : false);
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

app.listen(process.env.PORT, () => console.log(`App is listening on port ${process.env.PORT}`));

import { Express } from 'express';
import Redis from 'ioredis';
import cookieParser from 'cookie-parser';
import { SessionMiddleware, SessionStore } from '@companieshouse/node-session-handler';
import * as config from '../config';

const configureSession = (
  app: Express,
): void => {
  const cookieConfig = {
    cookieName: '__SID',
    cookieSecret: config.COOKIE_SECRET,
    cookieDomain: config.COOKIE_DOMAIN,
    cookieTimeToLiveInSeconds: parseInt(config.DEFAULT_SESSION_EXPIRATION, 10),
  };
  const sessionStore = new SessionStore(new Redis(`redis://${config.CACHE_SERVER}`));

  app.use(cookieParser());
  app.use(SessionMiddleware(cookieConfig, sessionStore));
};

export default configureSession;

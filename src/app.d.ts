import { UserAdvocate, UserClient } from './app.types';

declare module 'express-session' {
  interface SessionData {
    user?: UserClient | UserAdvocate;
  }
}

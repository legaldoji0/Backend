import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import sessionMiddleware = require('express-session');
import MySQLSession = require('express-mysql-session');
const MySQLStore = MySQLSession(sessionMiddleware);

const parsed = new URL(process.env.DATABASE_URL);

// Decode the password part
const decodedPassword = decodeURIComponent(parsed.password);

// Log the decoded password
console.log('Decoded Password:', decodedPassword);

// Log the individual parts of the parsed URL
console.log('Database connection details:');
console.log('Host:', parsed.hostname);
console.log('Port:', parsed.port);
console.log('Username:', parsed.username);
console.log('Password:', parsed.password);
console.log('Database:', parsed.pathname.slice(1));

async function bootstrap() {
  const App = await NestFactory.create(AppModule);

  App.setGlobalPrefix('/api');

  App.use(helmet());
  App.enableCors();

  App.use(
    sessionMiddleware({
      name: 'session',
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      unset: 'destroy',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: process.env.HTTPONLY === 'true',
        sameSite: (process.env.SAMESITE as any) || 'none',
        secure: process.env.SECURE === 'true',
      },
      store: new MySQLStore({
        host: parsed.hostname,
        port: Number(parsed.port),
        user: parsed.username,
        password: decodedPassword,
        database: parsed.pathname.slice(1),
        checkExpirationInterval: 1000 * 60 * 60 * 24, // 24 hours
        expiration: 1000 * 60 * 60 * 24 * 7, // 7 days
        schema: {
          tableName: 'Sessions',
          columnNames: {
            session_id: 'sid',
            expires: 'expire',
            data: 'sess',
          },
        },
      }),
    }),
  );

  await App.listen(process.env.PORT || 3001);
}
bootstrap();

// export const viteNodeApp = NestFactory.create(AppModule);

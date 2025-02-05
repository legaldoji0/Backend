# Legaldoji - Backend

> Version: `flower - 0.0.1`

> State: `alpha ( not ready for production )`

## Stack

- NestJS
- Prisma
- Postgres for production `( SQLite for development )`
- Typescript

## Paths

- `POST` - `/api/auth/login` - Login

- `POST` - `/api/auth/register` - Register

- `POST` - `/api/auth/register/verify` - Verify registration

- `GET` - `/api/auth/logout` - Logout

- `POST` - `/api/auth/password/forgot` - Forgot password

- `/api/auth/user` - Get user details

> User path <br> `GET` - Get user details <br> `PUT` - Update user details <br> `DELETE` - Delete user ( request will be sent to admin for approval )

- `GET` - `/api/ticket/` - Get all tickets
- `GET` - `/api/ticket/:id` - Get ticket details
- `POST` - `/api/ticket/create` - Create ticket
- `POST` - `/api/ticket/update` - Update ticket details

- `GET` - `/api/search/advocate?` - Search advocate

## Contact

> [`Skull`](https://mohitxskull.dev) - mohitxskull@gmail.com

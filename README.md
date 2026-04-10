# PixPro API

Is the Backend REST API for the PixPro intelligent image processing platform. Built with NestJS + TypeScript + MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)

## Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB instance (local for now)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd pixpro-api
```

### 2. Install dependencies

```bash
npm install
```

By the way, this also sets up Husky Git hooks automatically.

### 3. Configure environment variables

Open '.env.example' or '.env' file, the fill in your values

- PORT: Port the server listen on, for example '3000'
- NODE_ENV: Application environment, for example 'development'
- MONGODB_URI: MongoDB connection string, for example 'mongodb://localhost:27017'

### 4. Run the development server

```bash
npm run start:dev
```
The server should be available at `http://localhost:3000`.

## Verify the setup

For verifying the setup, you can execute the 'health check' endpoint, for this you can use Postman or similar tool. Use the route: 'GET /api/health', and you should have the next respone:

```json
Expected response:
{
  "status": "ok"
}
```

## Available Scripts

| Script              | Description                              |
|---------------------|------------------------------------------|
| npm run start:dev   | Start server in watch mode               |
| npm run build       | Compile TypeScript to JavaScript         |
| npm run lint        | Run ESLint with auto-fix                 |
| npm run format      | Run Prettier formatter                   |
| npm run test        | Run unit tests                           |

## Project Structure

```
src/
├── main.ts               # App bootstrap and global setup
├── app.module.ts         # Root module
├── app.controller.ts     # Health check endpoint
├── config/               # Environment configuration
├── common/
│   └── filters/          # Global exception filter
└── database/             # MongoDB connection module
```

(This is the structure at the final point of the Issue1, will be modified at time pass).
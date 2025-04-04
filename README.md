# Tantor-Learning-backend-app

Defines the features and requirements for the development of the online platform Tantor Learning, enabling the automated management of training, registrations, users, and administrative documents.

## How to run the app locally

### 1 Clone the project

```bash
git clone https://github.com/Tantor-Hub/to-be-defined
```

### 2 Go to the project directory

```bash
cd Tantor-Learning-frontend
```

### 3 Install dependencies

```bash
yarn
```

### 4 Start the server

in watch mode

```bash
yarn start:dev
```

Or run just the command

```bash
yarn run start
```

## How to build for deployement

In the root of the project run

```bash
yarn run build
```

## How to Kill the process if running in the background

On Windows

```bash
netstat -ano | findstr :3737
```

Then

```bash
taskkill /PID <PID> /F
```

## Tech Stack

NestJS, SequelizeORM, postgreSQL

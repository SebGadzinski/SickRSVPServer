# BlackBoxVueQuasarAppServer

Server for project BlackBoxVueQuasarApp which is a front end client application using Vue and Quasar. (duh)

## Languages, Tools

- Firebase
- Mocha
- Mongoose
- pm2
- SendGrid
- Typescript

### Firebase

- Push Notifications
  - Web notifications not set up, but mobile is
- Analytics

### Mocha

- Mixed with typescript for great testing! Very nice!

### Mongoose

#### Schema

##### Token

```
{
  _id: Schema.Types.ObjectId;
  referenceId: string;
  reason: string;
  value: string;
  expiration: Date;
  createdBy: string;
  updatedBy: string;
}

```

##### User

```
{
  _id: Schema.Types.ObjectId;
  email: string;
  emailConfirmed: boolean;
  fullName: string;
  password: string;
  phoneNumber?: string;
  mfa: boolean;
  roles: string[];
  claims: Array<{ name: string; value: any }>;
  refreshToken: string;
  salt: string;
  createdBy: string;
  updatedBy: string;
  // Add any instance methods here if needed
}

```

### pm2

- Using PM2 for running the project as a whole as it is a great process manager

### SendGrid

- Sending email using dynamic templates

### Typescript

- Only issue at the moment is with express interface models not working correctly. Messes up with installment of firebase-admin npm package

## Features

1. Email
   - Confirmation
   - Reseting password
   - Alerts
   - Notifications
2. JWT Token Authentication
   - Client takes token from Login
   - Refresh token cycling
3. Multi Processes
   - Server.ts
     - This is what runs with the front end application, or as a identity server
   - Database.ts
     - This is what cleans up the database, runs backend operations...
4. Environment Switching
   - Can switch from dev/test/production

## Testing

Everything for testing is underneath /tests folder.

### /bases

This is where you make your test bases. Test bases are hierarchal, so grab what you need from other bases to minimize the amount of work.

### /data

Any generic data or non generic data files can be stored here.

#### TIP

- When looking into making data, make the schema of the data you want and then get a AI to generate mock data. Give examples to it if complicated.

### /intergration

These are tests that are used to ensure the server is working correctly. They do not contain any connection to the BlackBoxQuasarVueApp.

testrunner.js runs the project in a test environment

### /unit

These are unit tests and are meant to test out services or functions without the connection to the server.

## Configs (src/configs)

### firebase.json

Firebase => Project => Project Settings => Service Accounts => Generate Key

### sendGrid.json

Please put your Dynamic Templates in here.

```
{
  "apiKey": "SG.XXX",
  "email": {
    "alert": "alert@gmail.com",
    "noReply": "do.not.reply@gmail.com",
    "support": "support@gmail.com"
  },
  "confirmation": {
    "subject": "Confirm Your Email",
    "headerMessage": "Confirm Email",
    "btnMessage": "Confirm!",
    "btnLink": "/auth/confirmation?token="
  },
  "resetPassword": {
    "subject": "Reset Password",
    "headerMessage": "Reset Password",
    "btnMessage": "Reset!",
    "btnLink": "/auth/resetPassword?token="
  },
}
```

## Environment

Using different environment allows you to run your project in different ways. Each one of these enviorments should be pointing to different MongoDB projects/ports.

### Development env.dev

Use when you are working with a database your not trying to clean or wipe.

### Testing env.test

Use when you are writing tests. You should point this to a different port and not the same one as prod or dev so the data on those dont get wiped or corrupted.

### Staging env.staging

Use when you are presenting to your client.

### Production env.prod

Use this for your clients displaying database. This is what should be used for wherever you are running your clients sever.

### Config.js

All enviorement varaibles in the .env files get populated into a js object which can be imported from anywhere. Use this instead of process.env.\*\*\*

## Package.json Scripts

### pm2

Running command: (@type: ("development", "testing", "production"))

```
pm2 start --env @type
```

1. "pm2:server": "cross-env node --require ts-node/register src/processes/Server.ts"

- Runs Server on pm2 process

2. "pm2:database": "cross-env node --require ts-node/register src/processes/Database.ts"

- Runs Database on pm2 process

### server

1. "server:ENV": "nodemon -r dotenv/config src/processes/Server.ts dotenv_config_path=./.env.ENV"

- Replace ENV with dev, prod or test and it will run the server in that environment

### database-cleaner

1. "database-cleaner:ENV": "nodemon -r dotenv/config src/processes/DatabaseCleaner.ts dotenv_config_path=./.env.ENV"

- Replace ENV with dev or prod and it will run the database cleaner in that environment. Currently it just cleans Tokens.

### database-seeder

1. "database-seeder:ENV": "nodemon -r dotenv/config src/processes/DatabaseSeeder.ts dotenv_config_path=./.env.ENV"

- Replace ENV with dev or prod and it will run the database seeder which just seeds users at the moment.

### test

1. "test:intergration": "cross-env NODE_ENV=test node --require ts-node/register tests/intergration/testrunner.ts --exit"

- Runs the testrunner which tests all intergration tests. Runs server as well

2. "test:intergration-server-on": "cross-env NODE_ENV=test mocha --timeout 0 --require ts-node/register tests/intergration/\*\*/\*.spec.ts --exit"

- Runs all intergration tests but needs server to be running on a serperate process

3. "test:unit": "cross-env NODE_ENV=test mocha --timeout 0 --require ts-node/register tests/unit/\*\*/\*.spec.ts"

- Runs all unit tests

4. "test:single": "cross-env NODE_ENV=test mocha --timeout 0 --require ts-node/register tests/unit/services/notification.spec.ts"

- Runs a single test. Use for custom work

## Project setup

1. Install NodeJS on your machine ([https://nodejs.org/en/download/](https://nodejs.org/en/download/)). Use version 8.9.0/install NVM.
2. Install MongoDB and set up a local server ([https://www.mongodb.com/download-center/community](https://www.mongodb.com/download-center/community)).
3. Go to Firebase and create a project. Get the service account for your project. Add it as firebase.json in src/configs.
4. Go to SendGrid, set up a account, and ensure your emails you want to use are verified. Update the information in sendGrid.json in src/configs.
5. Clone the project

```
git clone git@github.com:SebGadzinski/BlackBoxVueQuasarAppServer.git
```

6. Install the packages

```
npm install
npm install -g ts-node
```

7. Run database seeder (/src/configs/db)

```
npm run database-seeder:dev
```

8. Run development

```
npm run server:dev
```

## Future

- MFA via text or face id
- node js => bun
- Other cool services

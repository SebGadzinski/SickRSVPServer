// TODO: If this is linux change to npm.exe location
const os = require('os');

let npm;
let env;
const ignore_watch = {};

if (os.platform().includes('win')) {
  npm = 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';
  env = 'dev';
  ignore_watch.all = [
    'C:/WorkTemp/Projects/Work Website/Server/src/configs/db'
  ];
} else {
  npm = 'npm';
  env = 'prod';
  ignore_watch.all = [];
}

const processes = [
  {
    'script': npm,
    'args': `run pm2:server:${env}`,
    'name': 'SickRSVP Server',
    'wait_ready': true,
    'watch': true,
    'env_development': {
      'NODE_ENV': 'development'
    },
    'env_production': {
      'NODE_ENV': 'production'
    },
    'env_testing': {
      'NODE_ENV': 'test'
    },
    'error_file': '~/logs/sick-rsvp/server.err.log',
    'out_file': '~/logs/sick-rsvp/server.out.log'
  },
  {
    'script': npm,
    'args': `run pm2:database-cleaner:${env}`,
    'name': 'SickRSVP Database Cleaner',
    'wait_ready': true,
    'watch': true,
    'env_development': {
      'NODE_ENV': 'development'
    },
    'env_production': {
      'NODE_ENV': 'production'
    },
    'env_testing': {
      'NODE_ENV': 'testing'
    },
    'error_file': '~/logs/sick-rsvp/database-cleaner.err.log',
    'out_file': '~/logs/sick-rsvp/database-cleaner.out.log'
  }
];

for (const process of processes) {
  if (!process.ignore_watch) {
    process.ignore_watch = ignore_watch.all;
  } else {
    process.ignore_watch.push(...ignore_watch.all);
    // You can add custom ones here
  }
}

module.exports = processes;

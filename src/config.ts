/**
 * @file Defines all constants required for application configuration.
 * @author Sebastian Gadzinski
 */
import _ from 'lodash';
import env from '../env.config';
import chatGPT from './configs/chatGPT.json';
import firebaseServiceAccount from './configs/firebase.json';
import googleServiceAPI from './configs/google-services.json';
import sendGrid from './configs/sendGrid.json';
import mongoConstants from './constants/mongoConstants.json';
import ipService from './services/IPService';

const useHTTPS = process.env.NODE_ENV === 'production' ? false : false;

const stripe = {
  accountName: process.env.STRIPE_SK_ACCOUNT_NAME_TEST
};

const config = {
  databaseUrl: env.getEnvironmentVariable('MONGO_DB'),
  port: parseInt(env.getEnvironmentVariable('PORT'), 10),
  saltRounds: parseInt(env.getEnvironmentVariable('SALT_ROUNDS'), 10),
  secret: env.getEnvironmentVariable('SECRET'),
  guestSecret: env.getEnvironmentVariable('GUEST_SECRET'),
  refreshSecret: env.getEnvironmentVariable('REFRESH_SECRET'),
  tokenExpirySeconds: parseInt(
    env.getEnvironmentVariable('TOKEN_EXPIRY_SECONDS'),
    10
  ),
  refreshTokenExpiryDays: parseInt(
    env.getEnvironmentVariable('REFRESH_TOKEN_EXPIRY_DAYS'),
    10
  ),
  domain: env.getEnvironmentVariable('DOMAIN'),
  frontEndDomain: env.getEnvironmentVariable('FRONT_END_DOMAIN'),
  company: env.getEnvironmentVariable('COMPANY'),
  email: {
    alert: env.getEnvironmentVariable('ALERT_EMAIL'),
    noReply: env.getEnvironmentVariable('NO_REPLY_EMAIL')
  },
  appVersionDirectory: env.getEnvironmentVariable('APP_VERSION_DIRECTORY'),
  sendGrid,
  firebaseServiceAccount,
  downloadAppEndpoint: env.getEnvironmentVariable('DOWNLOAD_APP_ENDPOINT'),
  googleServiceAPI,
  chatGPT,
  sendEmailStatus: process.env.SEND_EMAIL_STATUS,
  useHTTPS,
  stripe,
  invite: {
    date: env.getEnvironmentVariable('INVITE_DATE'),
    time: env.getEnvironmentVariable('INVITE_TIME'),
    location: env.getEnvironmentVariable('INVITE_LOCATION'),
  }
};

const internalIpV4 = ipService.getInternalIPv4();
const runningCapacitator = true;

function replaceLocalhost(obj) {
  return _.transform(obj, (result, value, key) => {
    if (_.isString(value)) {
      let newValue = value;

      // Check for 'localhost:8080' before making any replacements
      const localhostPort8080Regex = /localhost:8080/;
      if (localhostPort8080Regex.test(value) &&
        process.env.NODE_ENV === 'development' &&
        runningCapacitator) {
        newValue = newValue.replace(/:8080/, ':8080/#');
      }

      // Replace 'http://' with 'https://' if useHTTPS is true
      if (useHTTPS) {
        newValue = newValue.replace('http://', 'https://');
      }

      // Replace 'localhost' with the internal IP
      newValue = newValue.replace(/localhost/g, internalIpV4);

      result[key] = newValue;
    } else if (_.isObject(value) && !_.isArray(value)) {
      result[key] = replaceLocalhost(value); // Recursive call for nested objects
    } else {
      result[key] = value;
    }
  }, {});
}

const updatedConfig = replaceLocalhost(config);

export default updatedConfig;

export const c = {
  ...mongoConstants,
};

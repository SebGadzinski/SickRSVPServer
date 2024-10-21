/**
 * @file Defines all app related route patterns.
 * @author Sebastian Gadzinski
 */
import express from 'express';
import AppController from '../controllers/AppController';
import {
  isAuthenticated
} from '../middleware/authenticationMiddleware';

const router = express.Router({});

router.post('/checkForUpdate', AppController.checkForUpdate);

router.post('/getLatestVersion', AppController.getLatestVersion);

router.post(
  '/updateNotificationSubscription',
  isAuthenticated,
  AppController.updateNotificationSubscription
);

export default router;

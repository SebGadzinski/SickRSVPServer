/**
 * @file Defines all authentication related route patterns.
 * @author Sebastian Gadzinski
 */
import express from 'express';
import AuthenticationController from '../controllers/AuthenticationController';
import {
  isAuthenticated,
  isUser
} from '../middleware/authenticationMiddleware';

const router = express.Router({});

router.post('/', AuthenticationController.login);

// router.post('/signUp', AuthenticationController.signUp);

router.post('/refresh', AuthenticationController.refreshToken);

router.post(
  '/:id/sendEmailConfirmation',
  isAuthenticated,
  isUser({ minRole: 'admin' }),
  AuthenticationController.sendEmailConfirmation
);
router.post(
  '/sendEmailConfirmation',
  isAuthenticated,
  AuthenticationController.sendEmailConfirmation
);

router.post('/:token/confirmEmail', AuthenticationController.confirmEmail);

router.get(
  '/emailConfirmStatus',
  isAuthenticated,
  AuthenticationController.emailConfirmStatus
);

router.post(
  '/:id/sendEmailResetPassword',
  isAuthenticated,
  isUser({ minRole: 'admin' }),
  AuthenticationController.sendEmailResetPassword
);
router.post(
  '/sendEmailResetPassword',
  AuthenticationController.sendEmailResetPassword
);

router.post('/:token/resetPassword', AuthenticationController.resetPassword);

router.post(
  '/:id/logout',
  isAuthenticated,
  isUser({ minRole: 'admin' }),
  AuthenticationController.logout
);

router.post(
  '/logout',
  isAuthenticated,
  AuthenticationController.logout
);

export default router;

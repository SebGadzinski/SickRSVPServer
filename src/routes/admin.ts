/**
 * @file Defines all data related route patterns.
 * @author Sebastian Gadzinski
 */
import express from 'express';
import AdminController from '../controllers/AdminController';
import {
    hasRole,
    isAuthenticated
} from '../middleware/authenticationMiddleware';

const router = express.Router({});

router.get(
    '/users',
    isAuthenticated,
    hasRole('admin'),
    AdminController.getUserPageData
);

router.get(
    '/guests',
    isAuthenticated,
    hasRole('admin'),
    AdminController.getGuestPageData
);

router.get(
    '/gifts',
    isAuthenticated,
    hasRole('admin'),
    AdminController.getGiftPageData
);

router.post(
    '/gift/delete',
    isAuthenticated,
    hasRole('admin'),
    AdminController.deleteGifts
);

router.post(
    '/gift/edit',
    isAuthenticated,
    hasRole('admin'),
    AdminController.editGift
);
router.post(
    '/gift/create',
    isAuthenticated,
    hasRole('admin'),
    AdminController.createGift
);

router.get(
    '/guestsWithoutGifts',
    isAuthenticated,
    hasRole('admin'),
    AdminController.getGuestsWithoutGifts
);

router.post(
    '/sendRSVPLink',
    isAuthenticated,
    hasRole('admin'),
    AdminController.sendRSVPLink
);

router.post(
    '/sendInvitation',
    isAuthenticated,
    hasRole('admin'),
    AdminController.sendInvitation
);

router.post(
    '/guest/delete',
    isAuthenticated,
    hasRole('admin'),
    AdminController.deleteGuests
);

export default router;

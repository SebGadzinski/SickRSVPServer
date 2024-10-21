/**
 * @file Defines all data related route patterns.
 * @author Sebastian Gadzinski
 */
import express from 'express';
import DataController from '../controllers/DataController';
import {
    isGuest
} from '../middleware/guestMiddleware';

const router = express.Router({});

router.get('/getRSVPPageData', isGuest, DataController.getRSVPPageData);
router.post('/rsvp', isGuest, DataController.rsvp);
router.post('/getGifts', isGuest, DataController.getGifts);
router.post('/submitGifts', isGuest, DataController.submitGifts);
router.post('/getGuest', isGuest, DataController.getGuest);

export default router;

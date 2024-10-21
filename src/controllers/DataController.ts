/**
 * @file Controller for data needs
 * @author Sebastian Gadzinski
 */

import Result from '../classes/Result';
import c from '../constants/appConstants.json';
import { Config, Gift, Guest } from '../models';

class DataController {
    public async getGifts(req: any, res: any) {
        try {
            const gifts: any = await Gift.find({}).lean();

            const info = [];

            for (const gift of gifts) {
                if (gift.status !== 'needed') {
                    info.push(gift);
                }
                gift.selected = req.body.email === gift.user;
                delete gift.user;
            }

            res.send(new Result({ data: gifts, success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async getGuest(req: any, res: any) {
        try {
            const existstingGuest = await Guest.findOne({ email: req.body.email });

            res.send(new Result({ data: existstingGuest, success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async getRSVPPageData(req: any, res: any) {
        try {
            const inviteConfig = await Config.findOne({ name: 'invite' }).lean();
            res.send(new Result({
                success: true,
                data: { date: inviteConfig.value.date, time: inviteConfig.value.time }
            }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async rsvp(req: any, res: any) {
        try {
            const existstingGuest = await Guest.findOne({ email: req.body.email });
            if (existstingGuest && !req.body.forceUpdate) throw new Error('Guest already did rsvp');

            if (existstingGuest) {
                existstingGuest.name = req.body.name;
                existstingGuest.guests = req.body.guests;
                await existstingGuest.save();
            } else {
                await Guest.create({
                    name: req.body.name,
                    email: req.body.email,
                    guests: req.body.guests
                });
            }

            res.send(new Result({ success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async submitGifts(req: any, res: any) {
        try {
            const guest = await Guest.findOne({ email: req.body.email });
            if (!guest) throw new Error('Guest does not exist');

            const newGifts = req.body.gifts;

            if (!Array.isArray(newGifts) || newGifts.length === 0) {
                throw new Error('No gifts provided');
            }

            // Retrieve all gifts the user has already claimed
            const claimedGifts = await Gift.find({ user: req.body.email });
            const claimedGiftKeys = claimedGifts.map((gift) => `${gift.section}-${gift.name}`);
            const newGiftKeys = newGifts.map((gift) => `${gift.section}-${gift.name}`);

            // Unclaim gifts that were previously claimed but are not in the new selection
            const giftsToUnclaim = claimedGifts.filter((gift) =>
                !newGiftKeys.includes(`${gift.section}-${gift.name}`)
            );
            for (const gift of giftsToUnclaim) {
                gift.user = undefined;
                gift.status = 'needed';
            }

            // Calculate how many new gifts the user is trying to claim (ignoring ones they already have)
            const newGiftCount = newGifts.filter((giftReq) =>
                !claimedGiftKeys.includes(`${giftReq.section}-${giftReq.name}`)
            ).length;

            // Check if claiming these gifts exceeds the limit of 5
            if (claimedGifts.length + newGiftCount - giftsToUnclaim.length > c.MAX_GIFTS) {
                throw new Error(`You cannot claim more than ${c.MAX_GIFTS} gifts in total.`);
            }

            // Array to hold updated gifts
            const updatedGifts = [];

            // Loop through each new gift in the request body
            for (const giftReq of newGifts) {
                const gift = await Gift.findOne({
                    section: giftReq.section, name: giftReq.name
                });

                if (gift?.user && gift.user !== req.body.email) {
                    throw new Error(
                        `Someone else already got the gift: ${giftReq.name} in section: ${giftReq.section}`
                    );
                } else {
                    // If the user has already claimed a different gift, reset it
                    const alreadyGettingGift = await Gift.findOne({
                        user: req.body.email,
                        section: { $ne: giftReq.section },
                        name: { $ne: giftReq.name }
                    });
                    if (alreadyGettingGift) {
                        alreadyGettingGift.user = undefined;
                        alreadyGettingGift.status = 'needed';
                        updatedGifts.push(alreadyGettingGift); // Queue for later saving
                    }

                    // Update the current gift for the user
                    gift.user = req.body.email;
                    gift.status = 'claimed';
                    updatedGifts.push(gift); // Queue for later saving
                }
            }

            // Combine gifts to unclaim and updated gifts
            const allGiftsToSave = [...giftsToUnclaim, ...updatedGifts];

            // Save all modified gifts at once
            await Promise.all(allGiftsToSave.map((gift) => gift.save()));

            res.send(new Result({ success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

}

export default new DataController();

import _ from 'lodash';
import Result from '../classes/Result';
import c from '../constants/appConstants.json';
import {
    Gift,
    Guest,
    User,
} from '../models';
import GuestService from '../services/GuestService';

class AdminController {

    public async getUserPageData(req: any, res: any) {
        try {
            const users: any = await User.find({},
                {
                    userId: '$_id',
                    fullName: 1,
                    email: 1,
                    emailConfirmed: 1,
                    phoneNumber: 1,
                    mfa: 1,
                    works: 1
                }).lean();

            res.send(new Result({ data: users, success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async getGuestPageData(req: any, res: any) {
        try {
            const guests = await GuestService.getGuestData();

            res.send(new Result({ data: guests, success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async deleteGuests(req: any, res: any) {
        try {
            await Gift.updateMany({
                user: {
                    $in: req.body.emails
                }
            }, {
                $set: {
                    status: 'needed'
                },
                $unset: {
                    user: ''
                }
            });

            await Guest.deleteMany({
                email: {
                    $in: req.body.emails
                }
            });

            res.send(new Result({ success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async sendRSVPLink(req: any, res: any) {
        try {
            await GuestService.sendRSVPLink(req.body.emails);

            res.send(new Result({ success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async sendInvitation(req: any, res: any) {
        try {
            await GuestService.sendInvitation(req.body.emails);

            res.send(new Result({ success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async getGiftPageData(req: any, res: any) {
        try {
            const gifts = await Gift.find({}).lean();

            res.send(new Result({ data: gifts, success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async getGuestsWithoutGifts(req: any, res: any) {
        try {
            const guestsWithoutGifts = (await GuestService.getGuestData())
                .filter((x) => x.gifts?.length < c.MAX_GIFTS)
                .map((x) => x.email);

            res.send(new Result({ data: guestsWithoutGifts, success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async deleteGifts(req: any, res: any) {
        try {
            await Gift.deleteMany({
                _id: {
                    $in: req.body.ids
                }
            });

            res.send(new Result({ success: true }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async editGift(req: any, res: any) {
        try {
            const gift = await Gift.findById(req.body._id);

            if (!gift) throw new Error('Cannot find gift');

            // Check if the gift with the same section and name already exists
            const sameGift = await Gift.findOne({ section: req.body.section, name: req.body.name });
            if (sameGift && sameGift._id.toString() !== gift._id.toString()) {
                throw new Error('Gift with the same section and name already exists');
            }

            // Ensure the status is either 'needed' or 'claimed'
            if (!['needed', 'claimed'].includes(req.body.status)) {
                throw new Error('Invalid status');
            }

            if (req.body.status === 'claimed') {
                // Check if the user exists
                const guest = await Guest.findOne({ email: req.body.user });
                if (!guest) throw new Error('Guest not found');

                // Count how many gifts the user has already claimed
                const claimedGiftsCount = await Gift.countDocuments({ user: req.body.user, status: 'claimed' });

                // If the user is trying to claim this gift and already has 5, deny the edit
                if (claimedGiftsCount >= c.MAX_GIFTS && gift.status !== 'claimed') {
                    throw new Error('User cannot claim more than 5 gifts');
                }

                // Assign the user to the gift
                gift.user = guest.email;
                gift.status = 'claimed';
            } else {
                // Reset the user and mark the gift as 'needed'
                gift.user = undefined;
                gift.status = 'needed';
            }

            // Update other fields
            gift.section = req.body.section;
            gift.name = req.body.name;

            // Save the gift
            await gift.save();

            res.send(new Result({
                data: {
                    id: gift.id,
                    section: gift.section,
                    name: gift.name,
                    user: gift.user,
                    status: gift.status
                },
                success: true
            }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

    public async createGift(req: any, res: any) {
        try {
            const gift = {
                section: req.body.section,
                name: req.body.name,
                status: req.body.status,
                user: req.body.user,
            };

            // Validate status
            if (!['needed', 'claimed'].includes(gift.status)) {
                throw new Error('Invalid status');
            }

            // Check if a gift with the same section and name already exists
            const sameGift = await Gift.findOne({ section: gift.section, name: gift.name });
            if (sameGift) throw new Error('Gift already exists');

            if (gift.status === 'claimed') {
                // Validate the guest exists
                const guest = await Guest.findOne({ email: gift.user });
                if (!guest) throw new Error('Guest not found');

                // Check if the guest has already claimed max gifts
                const claimedGiftsCount = await Gift.countDocuments({ user: gift.user, status: 'claimed' });
                if (claimedGiftsCount >= c.MAX_GIFTS) {
                    throw new Error('User cannot claim more than 5 gifts');
                }
            } else {
                // If the gift is 'needed', clear the user
                gift.user = undefined;
            }

            // Create and save the new gift
            const finalGift = await Gift.create(gift);

            res.send(new Result({
                data: {
                    id: finalGift.id,
                    section: finalGift.section,
                    name: finalGift.name,
                    user: finalGift.user,
                    status: finalGift.status
                },
                success: true
            }));
        } catch (err) {
            res.send(new Result({ message: err.message, success: false }));
        }
    }

}

export default new AdminController();

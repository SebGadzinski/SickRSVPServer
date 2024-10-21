/**
 * @file Security related functionality.
 * @author Sebastian Gadzinski
 */

import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import config from '../config';
import { Guest } from '../models';
import EmailService from '../services/EmailService';

class GuestService {
    public static getInstance(): GuestService {
        if (!GuestService.instance) {
            GuestService.instance = new GuestService();
        }
        return GuestService.instance;
    }

    private static instance: GuestService;

    public async getGuestData() {
        return await Guest.aggregate([
            {
                $lookup: {
                    from: 'gifts',
                    localField: 'email',
                    foreignField: 'user',
                    as: 'guestGifts'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    emailSent: 1,
                    guests: 1,
                    claimedGifts: {
                        $filter: {
                            input: '$guestGifts',
                            as: 'gift',
                            cond: { $eq: ['$$gift.status', 'claimed'] }
                        }
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    emailSent: 1,
                    guests: 1,
                    gifts: {
                        $map: {
                            input: '$claimedGifts',
                            as: 'gift',
                            in: {
                                section: '$$gift.section',
                                name: '$$gift.name'
                            }
                        }
                    }
                }
            }
        ]);
    }

    public async sendRSVPLink(emails: string[]) {
        const expiryDate = DateTime.now().set({ month: 11, day: 9 }).endOf('day');
        const millisecondsToExpire = expiryDate.diff(DateTime.now()).milliseconds;

        const newToken = jwt.sign(
            { data: { user: 'guest' } },
            config.guestSecret,
            { expiresIn: millisecondsToExpire }
        );

        for (const email of emails) {
            const link = `${config.frontEndDomain}/rsvp?token=${newToken}`;
            await EmailService.sendNotificationEmail(
                {
                    to: email,
                    title: 'Invitiation Link',
                    header: 'New Invitation Link',
                    body: `Send this link to friends:\n\n ${link}`,
                    link,
                    btnMessage: 'Link To RSVP'
                }
            );
        }
    }

    public async sendInvitation(emails: string) {
        await EmailService.sendInvitation(emails);
        await Guest.updateMany({
            email: {
                $in: emails
            }
        }, {
            $set: {
                emailSent: true
            }
        });
    }
}

export default GuestService.getInstance();

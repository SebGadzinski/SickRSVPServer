/**
 * @author Sebastian Gadzinski
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import gifts from '../../tests/data/gifts';
import config from '../config';
import USERS_JSON from '../configs/db/users.json';
import { Config, Gift, User } from '../models';
import { IUser } from '../models/User';
import Process from './_Process';

class DatabaseSeeder extends Process {

  public async run() {
    await super.run();
    await this.createAndInsertSampleUsers();
    await this.seedGifts();
    await this.seedInvitationConfig();
    process.exit(0);
  }

  private createAndInsertSampleUsers() {
    return new Promise<IUser[]>((resolve, reject) => {
      const sampleUsers: IUser[] = [];
      const users: any = USERS_JSON;

      let count = 0;
      for (const user of users) {
        User.findOne({ email: user.email }).then((delUser) => {
          if (!delUser) {
            User.deleteOne({ email: user.email }).then(() => {
              bcrypt.genSalt(config.saltRounds, (saltError, salt) => {
                user.password = 'Password123!';

                if (saltError) return reject('Salt error.');

                bcrypt.hash(user.password, salt, (hashError, hash) => {
                  if (hashError) return reject('Hash error.');

                  const refreshToken = jwt.sign(
                    { data: { email: user.email, fullName: user.fullName } },
                    config.secret
                  );

                  user.refreshToken = refreshToken;
                  user.password = hash;
                  user.salt = salt;
                  user.createdBy = 'seeder';
                  user.updatedBy = 'seeder';
                  user.mfa = false;

                  User.create(user)
                    .then(async (userDoc: IUser) => {
                      userDoc.refreshToken = jwt.sign(
                        {
                          data: {
                            id: userDoc._id,
                            email: userDoc.email,
                            expiresAt:
                              new Date().getTime() + config.tokenExpirySeconds,
                            fullName: userDoc.fullName,
                            roles: userDoc.roles
                          }
                        },
                        config.secret,
                        { expiresIn: config.tokenExpirySeconds }
                      );
                      await userDoc.updateOne({ refreshToken: 1 });
                      sampleUsers.push(userDoc);
                      if (count + 1 === users.length) {
                        return resolve(sampleUsers);
                      }
                      count++;
                    })
                    .catch((error) => {
                      reject(`User creation failed. ${error}`);
                    });
                });
              });
            });
          } else {
            if (count + 1 === users.length) {
              return resolve(sampleUsers);
            }
            count++;
          }
        });
      }
    });
  }

  private async seedGifts() {
    await Gift.deleteMany({});
    for (const gift of gifts) {
      await Gift.create({
        name: gift.name,
        section: gift.section,
        status: 'needed'
      });
    }
  }

  private async seedInvitationConfig() {
    await Config.deleteMany({});
    if (!config?.invite?.date) {
      throw new Error('Missing invite config data');
    }
    await Config.create({
      name: 'invite',
      value: config.invite
    });
  }

}

const seedDB = new DatabaseSeeder('DatabaseSeeder', { connectToDb: true, startMessage: 'Time to make babies...' });
seedDB.run();

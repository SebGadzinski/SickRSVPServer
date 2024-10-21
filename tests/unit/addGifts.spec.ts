import { Gift } from '../../src/models';
import UnitTest from '../bases/UnitTest';
import gifts from '../data/gifts'

class GiftScript extends UnitTest {
    constructor() {
        super('Add Gifts');
        this.run();
    }

    run() {
        describe(this.testName, () => {
            before(async () => {
                await this.startMongo(false);
                // await this.createSimpleUsers(1);
            });

            it('Remove All Gifts', async () => {
                await Gift.deleteMany({});
            });

            it('Adds Gifts', async () => {
                for (const gift of gifts) {
                    await Gift.create({
                        name: gift.name,
                        section: gift.section,
                        status: 'needed'
                    });
                }
            });
        });
    }
}

new GiftScript();

import UnitTest from '../../bases/UnitTest';
import GuestService from '../../../src/services/GuestService'

class GuestServiceTest extends UnitTest {
    constructor() {
        super('Guest Service Test');
        this.run();
    }

    run() {
        describe(this.testName, () => {
            before(async () => {
                await this.startMongo(false);
            });

            // it('Creates Link', async () => {
            //     await GuestService.createLink();
            // });

            // it('Get Guests', async () => {
            //     var guests = await GuestService.getGuestData();
            //     console.log(guests);
            // });
        });
    }
}

new GuestServiceTest();

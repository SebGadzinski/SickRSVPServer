/**
 * @file Notification Unit Tests For Services
 * @author Sebastian Gadzinski
 */

import SelenuimTest from '../bases/SelenuimTest';

class SebjoTest extends SelenuimTest {
    constructor() {
        super();
        this.run();
    }

    run() {
        describe("Sebjo", () => {
            before(async () => {
                await this.initiateDriver();
                await this.startMongo(false);
                await this.d.manage().setTimeouts({ implicit: 5000 });
            });

            it('View Instagram', async () => {
                await this.d.get("https://www.instagram.com");
            });
            it('Goes To Sebjo Profile', async () => {
                await this.d.get("https://www.instagram.com/daily.life.of.sebjo/");
            });
        });
    }
}

new SebjoTest();

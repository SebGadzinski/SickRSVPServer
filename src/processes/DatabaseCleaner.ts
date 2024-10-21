/**
 * @author Sebastian Gadzinski
 */

import { DateTime } from 'luxon';
import { Token } from '../models';
import CronProcess from './_CronProcess';

class DatabaseCleaner extends CronProcess {
  private readonly DELETE_TOKENS_DAYS = 1;

  constructor() {
    super('DatabaseCleaner', {
      func: async () => {
        await this.cleanTokensCode();
      },
      interval: '0 0 */1 * * *',
    }, {
      connectToDb: true,
      startMessage: 'Database Cleaner started'
    });
  }

  private async cleanTokensCode() {
    const cutoffDate = DateTime.now().minus({ days: this.DELETE_TOKENS_DAYS });
    await Token.deleteMany({
      expiration: {
        $lt: cutoffDate
      }
    });
    console.log(
      `${new Date().toISOString()} || Cleared tokens older than ${this.DELETE_TOKENS_DAYS} days old...`
    );
  }

}

const dbCleaner = new DatabaseCleaner();
dbCleaner.run();

/**
 * @file Controller for application needs
 * @author Sebastian Gadzinski
 */
import Result from '../classes/Result';
import AppService from '../services/AppService';

class AppController {
  public checkForUpdate(req: any, res: any) {
    AppService.checkForUpdate(req.body.currentVersion)
      .then((result: Result) => res.status(result.status).send(result))
      .catch((errorMessage: Error) =>
        res
          .status(500)
          .send(new Result({ message: errorMessage.message, success: false }))
      );
  }

  public getLatestVersion(req: any, res: any) {
    AppService.getLatestVersion()
      .then((result: Result) => res.status(result.status).send(result))
      .catch((errorMessage: Error) =>
        res
          .status(500)
          .send(new Result({ message: errorMessage.message, success: false }))
      );
  }

  public updateNotificationSubscription(req: any, res: any) {
    AppService.updateNotificationSubscription(
      req.user?.data?.id,
      req.body?.token,
      req.body?.enable
    )
      .then((data: any) => res.send(new Result({ data })))
      .catch((errorMessage: Error) =>
        res.send(new Result({ message: errorMessage.message, success: false }))
      );
  }
}

export default new AppController();

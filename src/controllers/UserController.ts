/**
 * @file Dispatcher for user related requests.
 * @author Sebastian Gadzinski
 */
import Result from '../classes/Result';
import User from '../models/User';
import UserService from '../services/UserService';

class UserController {
  public getAll(req: any, res: any) {
    User.find({})
      .then((users: []) => res.send(new Result({ data: users })))
      .catch((errorMessage: Error) =>
        res.send(new Result({ message: errorMessage.message, success: false }))
      );
  }

  public get(req: any, res: any) {
    User.find({ _id: req.params.id })
      .then((user: any) => res.send(new Result({ data: user })))
      .catch((errorMessage: Error) =>
        res.send(new Result({ message: errorMessage.message, success: false }))
      );
  }

  public create(req: any, res: any) {
    UserService.create({
      email: req.body.email,
      fullName: req.body.fullName,
      password: req.body.password,
      refreshToken: req.body.refreshToken,
      roles: req.body.roles
    })
      .then((user: any) => res.send(new Result({ data: user })))
      .catch((errorMessage: Error) =>
        res.send(new Result({ message: errorMessage.message, success: false }))
      );
  }

  public update(req: any, res: any) {
    UserService.update({
      email: req.body.email,
      fullName: req.body.fullName,
      id: req.params.id,
      password: req.body.password,
      refreshToken: req.body.refreshToken,
      role: req.body.role
    })
      .then((user: any) => res.send(new Result({ data: user })))
      .catch((errorMessage: Error) =>
        res.send(new Result({ message: errorMessage.message, success: false }))
      );
  }

  public delete(req: any, res: any) {
    UserService.delete(req.params.id)
      .then(() => res.send(new Result({ success: true })))
      .catch((errorMessage: Error) =>
        res.send(new Result({ message: errorMessage.message, success: false }))
      );
  }

  public async getProfile(req: any, res: any) {
    try {
      const userId = req?.params?.id;

      let user: any = {};
      const queryUserId = userId ?? req.user.data.id;
      const selectionQuery: any = {
        _id: 0,
        name: '$fullName',
        email: 1,
        phoneNumber: 1
      };
      if (req?.user?.data.roles.includes('admin')) {
        selectionQuery.emailConfirmed = 1;
      }

      user = await User.findOne({ _id: queryUserId }, selectionQuery);

      if (!user?.phoneNumber) {
        user.phoneNumber = '';
      }

      res.send(new Result({ data: user, success: true }));
    } catch (err) {
      res.send(new Result({ message: err.message, success: false }));
    }
  }

  public async saveProfile(req: any, res: any) {
    try {
      const userId = req?.body?.userId;

      if (userId && !req?.user?.data.roles.includes('admin')) {
        throw new Error('Access Denied');
      }

      const setQuery: any = {
        fullName: req.body.user.name,
        phoneNumber: req.body.user.phoneNumber
      };

      if (req?.user?.data.roles.includes('admin')) {
        // TODO: If you edit the email ensure any other data that uses data gets edited
        setQuery.email = req.body.user.email;
        setQuery.emailConfirmed = req.body.user.emailConfirmed;
      }

      const queryUserId = userId ?? req.user.data.id;

      await User.updateOne(
        { _id: queryUserId },
        {
          $set: setQuery
        }
      );

      res.send(new Result({ success: true }));
    } catch (err) {
      res.send(new Result({ message: err.message, success: false }));
    }
  }
}
export default new UserController();

/**
 * @file JWT authentication middleware for guests.
 * @author Sebastian Gadzinski
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

// Request is any because we want to assign the decoded user object to it.
const isGuest = (req: any, res: any, next: express.NextFunction) => {
  let token = '';
  try {
    const authHeader = req.headers.authorization;
    token = authHeader && authHeader.split(' ')[1];
  } catch (err) {
    return res.status(403).json({
      message: 'No token found.',
      success: false
    });
  }

  let decoded: any = {};
  try {
    decoded = jwt.verify(token, config.guestSecret);
  } catch (err) {
    try {
      decoded = jwt.verify(token, config.secret);
    } catch (err) {
      return res.status(401).json({
        message: 'You are not allowed to access this resource.',
        success: false
      });
    }
  }

  if (!decoded?.data) {
    return res.status(401).json({
      message: 'You are not allowed to access this resource.',
      success: false
    });
  }

  if (decoded) req.user = decoded;

  next();
};

export { isGuest };

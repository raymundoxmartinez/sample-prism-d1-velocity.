import { Request, Response, NextFunction } from 'express';
import { ProblemDetails } from '../types';

/**
 * Middleware to validate Content-Type is application/json for POST/PUT requests
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  if ((req.method === 'POST' || req.method === 'PUT') &&
      !req.is('application/json')) {
    const problem: ProblemDetails = {
      type: 'about:blank',
      title: 'Unsupported Media Type',
      status: 415,
      detail: 'Content-Type must be application/json',
      instance: req.path,
    };
    res.status(415).json(problem);
    return;
  }
  next();
}

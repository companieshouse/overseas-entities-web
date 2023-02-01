import { Request, Response, NextFunction } from 'express';

import { checkIfPresenterDataExists } from './checks/has.presenter';
import { SOLD_LAND_FILTER_URL } from '../../config';

export const hasPresenter = (req: Request, res: Response, next: NextFunction): void => {
  checkIfPresenterDataExists(req, res, next, SOLD_LAND_FILTER_URL);
};

import { Request, Response, NextFunction } from 'express';

import { checkIfPresenterDataExists } from '../checks/has.presenter';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';

export const hasUpdatePresenter = (req: Request, res: Response, next: NextFunction): void => {
  checkIfPresenterDataExists(req, res, next, SECURE_UPDATE_FILTER_URL);
};

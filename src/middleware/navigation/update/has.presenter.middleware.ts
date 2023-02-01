import { Request, Response, NextFunction } from 'express';

import { checkIfPresenterDataExists } from '../checks/has.presenter';
import { UPDATE_LANDING_PAGE_URL } from '../../../config';

export const hasUpdatePresenter = (req: Request, res: Response, next: NextFunction): void => {
  checkIfPresenterDataExists(req, res, next, UPDATE_LANDING_PAGE_URL);
};

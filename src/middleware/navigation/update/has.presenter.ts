import { Request, Response, NextFunction } from 'express';

import { checkIfPresenterDataExists } from '../common-code/has.presenter';
import { UPDATE_LANDING_PAGE_URL } from '../../../config';

export const hasUpdatePresenter = (req: Request, res: Response, next: NextFunction): void => {
  checkIfPresenterDataExists(req, res, next, UPDATE_LANDING_PAGE_URL);
};

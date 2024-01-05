import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { ApplicationData } from "../../model/application.model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.REMOVE_CONFIRM_STATEMENT_PAGE, {
      backLinkUrl: `${config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL}${config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL}`,
      appData
    });
  } catch (error) {
    next(error);
  }
};

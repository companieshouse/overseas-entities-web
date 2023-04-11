import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE } from "../../config";
import { Request, Response } from "express";
import { getApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  console.log(`app data is ${JSON.stringify(appData.beneficial_owners_individual)}`);
  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    ...appData,
  });
};

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  if (req.query.review){
    res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};

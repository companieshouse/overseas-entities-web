import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {};
  if (appData?.managing_officers_individual){
    dataToReview = appData?.managing_officers_individual[Number(index)];
  }

  const templateOptions = {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
    ...dataToReview,
    populateResidentialAddress: false
  };

  return res.render(templateOptions.templateName, templateOptions);
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    resp.redirect("");
  } catch (error){
    next(error);
  }
};

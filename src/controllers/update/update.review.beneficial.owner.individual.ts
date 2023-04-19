import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {};
  if (appData?.beneficial_owners_individual){
    // appData.beneficial_owners_individual[Number(index)].ch_reference = "reviewed";
    // console.log("****** ch ref : " + appData.beneficial_owners_individual[Number(index)].ch_reference);
    dataToReview = appData?.beneficial_owners_individual[Number(index)];
  }

  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    ...dataToReview,
    isOwnersReview: true
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    console.log(`req index is ${req.query.index}`);
    if (req.query.index !== undefined){
      res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error) {
    next(error);
  }
};

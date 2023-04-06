import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE } from "../../config";
import e, { Request, Response } from "express"
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { getApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";

let boAppData: BeneficialOwnerIndividual[] | undefined;
let indexTracker: number = 0;


export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  boAppData = appData.beneficial_owners_individual

  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    boAppData,
    indexTracker
  });
}

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  if(req.query.review){
    res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL)
  }
}
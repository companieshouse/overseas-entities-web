import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
// import { Session } from "@companieshouse/node-session-handler";

// import { ApplicationData } from "../../model";
// import { getApplicationData } from "../../utils/application.data";
import { CONFIRM_TO_REMOVE_PAGE, UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE } from "../../config";
import { DoYouWantToRemoveKey } from "../../model/data.types.model";
// import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
// import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
// import { BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // const session = req.session as Session;
    // const appData: ApplicationData = getApplicationData(session);

    return res.render(CONFIRM_TO_REMOVE_PAGE, {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE,
      templateName: CONFIRM_TO_REMOVE_PAGE,
      beneficialOwnerId: req.params['id'],
      beneficialOwnerType: req.body['boType'],
      beneficialOwnerName: req.body['boName'],
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body[DoYouWantToRemoveKey] === '1'){
      // call removeBO existing functionality
      // need to know which type and ID here
    }

    return res.redirect(UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

// const getBoName = (id: string, beneficialOwnerType: string, appData: ApplicationData) => {
//   const beneficialOwner = findBo(id, beneficialOwnerType, appData);

//   if (beneficialOwnerType === BeneficialOwnerIndividualKey){
//     return beneficialOwner.first_name + " " + beneficialOwner.last_name;
//   } else {
//     return beneficialOwner.name;
//   }
// };

// const findBo = (id: string, beneficialOwnerType: string, appData: ApplicationData) => {

//   switch (beneficialOwnerType) {
//       case BeneficialOwnerIndividualKey:
//         return appData[BeneficialOwnerIndividualKey]?.find(beneficialOwner => beneficialOwner.id === id);
//       case BeneficialOwnerGovKey:
//         return appData[BeneficialOwnerGovKey]?.find(beneficialOwner => beneficialOwner.id === id);
//       case BeneficialOwnerOtherKey:
//         return appData[BeneficialOwnerOtherKey]?.find(beneficialOwner => beneficialOwner.id === id);
//       default:
//         return null; // redirect to error page?
//   }
// };

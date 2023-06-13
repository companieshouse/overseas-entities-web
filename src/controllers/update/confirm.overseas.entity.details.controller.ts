import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData } from "../../utils/application.data";
import { Update } from "../../model/update.type.model";
import { Session } from "@companieshouse/node-session-handler";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerCorporate } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session as Session);
    const update = appData.update as Update;

    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_QUERY_URL,
      updateUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
      appData,
      registrationDate: update.date_of_creation
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session as Session);

    if (hasTrustsInvolved(appData)) {
      return res.redirect(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);
    }

    return res.redirect(config.UPDATE_FILING_DATE_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

const trusteeNatureOfControlTypesExist = (bo: (BeneficialOwnerIndividual | BeneficialOwnerCorporate)) => {
  if (bo.trustees_nature_of_control_types){
    return bo.trustees_nature_of_control_types.length > 0;
  }
};

const hasTrustsInvolved = (appData: ApplicationData) => {

  if (!appData?.update){
    return false;
  }

  const beneficialOwnersIndividualOrCorporate = [
    ...(appData.update['review_beneficial_owners_individual'] ?? []),
    ...(appData.update['review_beneficial_owners_corporate'] ?? [])
  ];

  if (beneficialOwnersIndividualOrCorporate){
    return beneficialOwnersIndividualOrCorporate.some(trusteeNatureOfControlTypesExist);
  }

  return false;
};

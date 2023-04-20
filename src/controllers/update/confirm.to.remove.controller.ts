import { NextFunction, Request, Response } from "express";

import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

import { logger } from "../../utils/logger";
import {
  CONFIRM_TO_REMOVE_PAGE,
  PARAM_BENEFICIAL_OWNER_GOV,
  PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
  PARAM_BENEFICIAL_OWNER_OTHER,
  PARAM_BENEFICIAL_OWNER_TYPE,
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL
} from "../../config";
import { DoYouWantToRemoveKey } from "../../model/data.types.model";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { removeBeneficialOwnerIndividual } from "../../utils/beneficial.owner.individual";
import { removeBeneficialOwnerGov } from "../../utils/beneficial.owner.gov";
import { removeBeneficialOwnerOther } from "../../utils/beneficial.owner.other";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    return res.render(CONFIRM_TO_REMOVE_PAGE, {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
      templateName: CONFIRM_TO_REMOVE_PAGE,
      beneficialOwnerName: getBoName(req.params['id'], req.params[PARAM_BENEFICIAL_OWNER_TYPE], appData)
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
      switch (req.params[PARAM_BENEFICIAL_OWNER_TYPE]) {
          case PARAM_BENEFICIAL_OWNER_INDIVIDUAL:
            return removeBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
          case PARAM_BENEFICIAL_OWNER_GOV:
            return removeBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
          case PARAM_BENEFICIAL_OWNER_OTHER:
            return removeBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
      }
    }

    return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getBoName = (id: string, beneficialOwnerType: string, appData: ApplicationData) => {
  const beneficialOwner = findBo(id, beneficialOwnerType, appData);

  if (beneficialOwnerType === PARAM_BENEFICIAL_OWNER_INDIVIDUAL){
    return beneficialOwner.first_name + " " + beneficialOwner.last_name;
  } else {
    return beneficialOwner.name;
  }
};

const findBo = (id: string, beneficialOwnerType: string, appData: ApplicationData) => {
  switch (beneficialOwnerType) {
      case PARAM_BENEFICIAL_OWNER_INDIVIDUAL:
        return appData[BeneficialOwnerIndividualKey]?.find(beneficialOwner => beneficialOwner.id === id);
      case PARAM_BENEFICIAL_OWNER_GOV:
        return appData[BeneficialOwnerGovKey]?.find(beneficialOwner => beneficialOwner.id === id);
      case PARAM_BENEFICIAL_OWNER_OTHER:
        return appData[BeneficialOwnerOtherKey]?.find(beneficialOwner => beneficialOwner.id === id);
  }
};

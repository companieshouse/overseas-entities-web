import { NextFunction, Request, Response } from "express";

import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../../model";
import { findBeneficialOwner, getApplicationData } from "../../utils/application.data";

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
      beneficialOwnerName: getBoName(appData, req.params[PARAM_BENEFICIAL_OWNER_TYPE], req.params['id'])
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `DELETE ${req.route.path}`);

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

const getBoName = (appData: ApplicationData, beneficialOwnerType: string, id: string) => {
  const beneficialOwner = findBeneficialOwner(appData, beneficialOwnerType, id);

  if (beneficialOwnerType === PARAM_BENEFICIAL_OWNER_INDIVIDUAL){
    return beneficialOwner.first_name + " " + beneficialOwner.last_name;
  } else {
    return beneficialOwner.name;
  }
};

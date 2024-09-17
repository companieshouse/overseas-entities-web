import { NextFunction, Request, Response } from "express";

import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../../model";
import { findBoOrMo, getApplicationData } from "../../utils/application.data";

import { logger } from "../../utils/logger";
import {
  UPDATE_CONFIRM_TO_REMOVE_PAGE,
  PARAM_BO_MO_TYPE,
  PARAM_BENEFICIAL_OWNER_GOV,
  PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
  PARAM_BENEFICIAL_OWNER_OTHER,
  PARAM_MANAGING_OFFICER_CORPORATE,
  PARAM_MANAGING_OFFICER_INDIVIDUAL,
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  RELEVANT_PERIOD_QUERY_PARAM,
} from "../../config";
import { DoYouWantToRemoveKey, ID } from "../../model/data.types.model";
import { removeBeneficialOwnerIndividual } from "../../utils/beneficial.owner.individual";
import { removeBeneficialOwnerGov } from "../../utils/beneficial.owner.gov";
import { removeBeneficialOwnerOther } from "../../utils/beneficial.owner.other";
import { removeManagingOfficer } from "../../utils/managing.officer.individual";
import { removeManagingOfficerCorporate } from "../../utils/managing.officer.corporate";
import { checkRelevantPeriod } from "../../utils/relevant.period";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    return res.render(UPDATE_CONFIRM_TO_REMOVE_PAGE, {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
      templateName: UPDATE_CONFIRM_TO_REMOVE_PAGE,
      boMoName: getBoMoName(appData, req.params[PARAM_BO_MO_TYPE], req.params[ID])
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `DELETE ${req.route.path}`);
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    if (req.body[DoYouWantToRemoveKey] === '1') {
      switch (req.params[PARAM_BO_MO_TYPE]) {
          case PARAM_BENEFICIAL_OWNER_INDIVIDUAL:
            if (checkRelevantPeriod(appData)) {
              return removeBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
            } else {
              return removeBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
            }
          case PARAM_BENEFICIAL_OWNER_GOV:
            if (checkRelevantPeriod(appData)) {
              return removeBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
            } else {
              return removeBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
            }
          case PARAM_BENEFICIAL_OWNER_OTHER:
            if (checkRelevantPeriod(appData)) {
              return removeBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
            } else {
              return removeBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
            }
          case PARAM_MANAGING_OFFICER_INDIVIDUAL:
            return removeManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
          case PARAM_MANAGING_OFFICER_CORPORATE:
            return removeManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
          default:
            break;
      }
    } else {
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
    }
    return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getBoMoName = (appData: ApplicationData, boMoType: string, id: string) => {
  const boMo = findBoOrMo(appData, boMoType, id);

  return boMoType === PARAM_BENEFICIAL_OWNER_INDIVIDUAL || boMoType === PARAM_MANAGING_OFFICER_INDIVIDUAL
    ? boMo.first_name + " " + boMo.last_name
    : boMo.name;
};

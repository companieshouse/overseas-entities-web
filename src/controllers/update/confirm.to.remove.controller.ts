import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { getRedirectUrl } from "../../utils/url";
import { removeManagingOfficer } from "../../utils/managing.officer.individual";
import { removeBeneficialOwnerGov } from "../../utils/beneficial.owner.gov";
import { removeBeneficialOwnerOther } from "../../utils/beneficial.owner.other";
import { removeBeneficialOwnerIndividual } from "../../utils/beneficial.owner.individual";
import { removeManagingOfficerCorporate } from "../../utils/managing.officer.corporate";
import { DoYouWantToRemoveKey, ID } from "../../model/data.types.model";
import { findBoOrMo, getApplicationData } from "../../utils/application.data";

import {
  PARAM_BO_MO_TYPE,
  PARAM_BENEFICIAL_OWNER_GOV,
  PARAM_BENEFICIAL_OWNER_OTHER,
  UPDATE_CONFIRM_TO_REMOVE_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  PARAM_MANAGING_OFFICER_CORPORATE,
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  PARAM_MANAGING_OFFICER_INDIVIDUAL,
  PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session = req.session as Session;
    const appData: ApplicationData = await getApplicationData(session);

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

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `DELETE ${req.route.path}`);

    if (req.body[DoYouWantToRemoveKey] === '1') {
      switch (req.params[PARAM_BO_MO_TYPE]) {
          case PARAM_BENEFICIAL_OWNER_INDIVIDUAL:
            return await removeBeneficialOwnerIndividual(req, res, next, getBoTypeUrl(req));
          case PARAM_BENEFICIAL_OWNER_GOV:
            return await removeBeneficialOwnerGov(req, res, next, getBoTypeUrl(req));
          case PARAM_BENEFICIAL_OWNER_OTHER:
            return await removeBeneficialOwnerOther(req, res, next, getBoTypeUrl(req));
          case PARAM_MANAGING_OFFICER_INDIVIDUAL:
            return await removeManagingOfficer(req, res, next, getBoTypeUrl(req));
          case PARAM_MANAGING_OFFICER_CORPORATE:
            return await removeManagingOfficerCorporate(req, res, next, getBoTypeUrl(req));
          default:
            break;
      }
    }

    return res.redirect(getBoTypeUrl(req));

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

const getBoTypeUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  });
};

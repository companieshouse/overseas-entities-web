import { Session } from "@companieshouse/node-session-handler";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { mapCompanyProfileToOverseasEntity } from "../../utils/update/company.profile.mapper.to.oversea.entity";
import { getCompanyProfile } from "../../service/company.profile";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE}`);
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const id = appData?.entity_number as string;
    const companyDataResponse = await getCompanyProfile(req, id) as CompanyProfile;
    if (!companyDataResponse){
      return onOeError(res);
    }
    appData.entity_name = companyDataResponse.companyName;
    const overseasEntity = mapCompanyProfileToOverseasEntity(companyDataResponse);
    appData.entity = overseasEntity;
    setExtraData(req.session, appData);
    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_QUERY_URL,
      updateUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
      appData,
      registrationDate: companyDataResponse.dateOfCreation
    });
  }  catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE}`);
    return res.redirect(config.WHO_IS_MAKING_UPDATE_PAGE);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

const onOeError = (res: Response): void => {
  return res.redirect(config.OVERSEAS_ENTITY_QUERY_URL);
};

import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { getApplicationData, mapOverseasEntityToDTO, setExtraData } from "../utils/application.data";
import { ID } from "../model/data.types.model";
import { createOAuthApiClient } from "../service/api.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE}`);
    const session = req.session as Session;
    const id: string = req.params[ID];

    // TO BE USED TO RETRIEVE COMPANY NUMBER SEARCHED FROM PREVIOUS PAGE
    // ROUTE URL TO BE UPDATED
    // const id: string = session.data.signin_info?.company_number

    const responses = createOAuthApiClient(req.session).companyProfile.getCompanyProfile(id);
    const companyDataResponse = (await responses).resource;
    const companyData = mapOverseasEntityToDTO(companyDataResponse);

    const appData: ApplicationData = getApplicationData(session);
    appData.companyProfile = companyData;
    setExtraData(req.session, appData);
    const backLinkUrl: string = config.OVERSEAS_ENTITY_QUERY_URL;
    const updateUrl: string = config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL;

    return res.render(config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE, {
      backLinkUrl,
      updateUrl,
      templateName: config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE,
      appData,
      companyData
    });
  }  catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};


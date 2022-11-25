import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { getApplicationData } from "../utils/application.data";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import { getAccessToken } from "utils/session";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  const accessToken = getAccessToken(req.session);
  const clientDetails = {
    header: accessToken,
  };
  try {
    const searchCompanyProfile = new CompanyProfileService(clientDetails);
    const responses = searchCompanyProfile.getCompanyProfile(req.params.companyNumber);
    logger.debugRequest(req, `GET Update Page`);
    console.log(`Response from API CALL ${(await responses).resource}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    console.log(`App data is ${appData.overseasEntityData}`);
    const backLinkUrl: string = config.BENEFICIAL_OWNER_TYPE_URL;
    const updateUrl: string = config.UPDATE_COMPANY_PROFILES_URL;

    return res.render(config.UPDATE_COMPANY_PROFILE_PAGE, {
      backLinkUrl,
      updateUrl,
      templateName: config.UPDATE_COMPANY_PROFILE_PAGE,
      appData
    });
  }  catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};


import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { getApplicationData } from "../utils/application.data";
import { ID } from "../model/data.types.model";
import { createOAuthApiClient } from "../service/api.service";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET Update Page`);
    const id: string = req.params[ID];
    const responses = createOAuthApiClient(req.session).companyProfile.getCompanyProfile(id);
    const companyData = (await responses).resource;
    const isOverseasEntity = companyData?.type === "registered-overseas-entity";
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    appData.companyProfile = companyData;

    const backLinkUrl: string = config.BENEFICIAL_OWNER_TYPE_URL;
    const updateUrl: string = config.UPDATE_COMPANY_PROFILES_URL;

    if (!isOverseasEntity) {
      throw new Error("Not an overseas entity");
    }
    return res.render(config.UPDATE_COMPANY_PROFILE_PAGE, {
      backLinkUrl,
      updateUrl,
      templateName: config.UPDATE_COMPANY_PROFILE_PAGE,
      appData,
      companyData
    });
  }  catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};


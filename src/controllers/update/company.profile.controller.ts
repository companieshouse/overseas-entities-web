import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, mapOverseasEntityToDTO, setExtraData } from "../../utils/application.data";
import { getCompanyRequest } from "../../service/overseas.entities.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE}`);
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const id: string = appData?.oe_number || "";
    const companyDataResponse = await getCompanyRequest(req, id);
    if (!companyDataResponse){
      return res.redirect(config.OVERSEAS_ENTITY_QUERY_URL);
    }
    const overseasEntity = mapOverseasEntityToDTO(companyDataResponse);
    appData.company_profile_details = overseasEntity;
    setExtraData(req.session, appData);
    const backLinkUrl: string = config.OVERSEAS_ENTITY_QUERY_URL;
    const updateUrl: string = config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL;

    return res.render(config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE, {
      backLinkUrl,
      updateUrl,
      templateName: config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE,
      appData,
      overseasEntityData: overseasEntity
    });
  }  catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE}`);
    return res.redirect(config.UPDATE_OVERSEAS_ENTITY_DETAILS_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};


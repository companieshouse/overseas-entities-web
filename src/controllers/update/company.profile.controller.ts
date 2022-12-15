import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, mapCompanyProfileToOverseasEntityToDTO, setExtraData } from "../../utils/application.data";
import { getCompanyRequest } from "../../service/overseas.entities.service";
import { OeErrorKey } from "../../model/data.types.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE}`);
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const id: string = appData?.oe_number || "";
    const companyDataResponse = await getCompanyRequest(req, id);
    if (!companyDataResponse){
      return onOeError(req, res, id);
    }

    const overseasEntity = mapCompanyProfileToOverseasEntityToDTO(companyDataResponse);
    appData.company_profile_details = overseasEntity;
    setExtraData(req.session, appData);

    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_QUERY_URL,
      updateUrl: config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL,
      templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
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
    logger.debugRequest(req, `POST ${config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE}`);
    return res.redirect(config.UPDATE_OVERSEAS_ENTITY_DETAILS_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

const onOeError = (req: Request, res: Response, oeNumber: string): void => {
  const errorList = `The Overseas Entity with OE number ${oeNumber} does not exist.`;
  setExtraData(req.session, { ...getApplicationData(req.session), [OeErrorKey]: errorList });
  return res.redirect(config.OVERSEAS_ENTITY_QUERY_URL);
};


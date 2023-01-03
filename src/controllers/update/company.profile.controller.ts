import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { OeErrorKey } from "../../model/data.types.model";
import { mapCompanyProfileToOverseasEntity } from "../../utils/update/company.profile.mapper.to.oversea.entity";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../service/company.profile";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const id: string | any = appData?.oe_number;
    const companyDataResponse = await getCompanyProfile(req, id) as CompanyProfile;
    if (!companyDataResponse){
      return onOeError(req, res, id);
    }
    const overseasEntity = mapCompanyProfileToOverseasEntity(companyDataResponse);
    appData.entity = overseasEntity;
    setExtraData(req.session, appData);
    return res.render(config.OVERSEAS_ENTITY_REVIEW_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_QUERY_URL,
      updateUrl: config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
      templateName: config.OVERSEAS_ENTITY_REVIEW_PAGE,
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
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);
    return res.redirect("#");
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

const onOeError = (req: Request, res: Response, oeNumber: string): void => {
  const errorList = `The Overseas Entity with OE number "${oeNumber}" is not valid or does not exist.`;
  setExtraData(req.session, { ...getApplicationData(req.session), [OeErrorKey]: errorList });
  return res.redirect(config.OVERSEAS_ENTITY_QUERY_URL);
};

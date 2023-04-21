import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { resetEntityUpdate } from "../../utils/update/update.reset";
import { EntityNumberKey } from "../../model/data.types.model";
import { getCompanyProfile } from "../../service/company.profile.service";
import { mapCompanyProfileToOverseasEntity } from "../../utils/update/company.profile.mapper.to.overseas.entity";
import { mapInputDate } from "../../utils/update/mapper.utils";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl: config.UPDATE_INTERRUPT_CARD_URL,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      [EntityNumberKey]: appData[EntityNumberKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const entityNumber = req.body[EntityNumberKey];
    const companyProfile = await getCompanyProfile(req, entityNumber);
    if (!companyProfile || isEmptyObject(companyProfile)) {
      const errors = createEntityNumberError(entityNumber);
      return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
        backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
        templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
        [EntityNumberKey]: entityNumber,
        errors
      });
    } else {
      const appData: ApplicationData = getApplicationData(req.session);
      if (appData.entity_number !== entityNumber) {
        resetEntityUpdate(appData);
        appData.entity_name = companyProfile.companyName;
        appData.entity_number = entityNumber;
        appData.entity = mapCompanyProfileToOverseasEntity(companyProfile);
        if (appData.update) {
          appData.update.date_of_creation = mapInputDate(companyProfile.dateOfCreation);
        }

        setExtraData(req.session, appData);
      }
      return res.redirect(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

function createEntityNumberError(entityNumber: string): any {
  const msg = `An Overseas Entity with OE number "${entityNumber}" was not found.`;
  const errors = { errorList: [] } as any;
  errors.errorList.push({ href: "#entity_number", text: msg });
  errors.entity_number = { text: msg };
  return errors;
}

const isEmptyObject = (data: CompanyProfile) => {
  // checks minimal required fields else will be strict
  const emptyObject = JSON.stringify({});
  if (!data || JSON.stringify(data.companyName) === emptyObject
           || JSON.stringify(data.companyNumber) === emptyObject
           || JSON.stringify(data.registeredOfficeAddress) === emptyObject){
    return true;
  } else {
    return false;
  }
};
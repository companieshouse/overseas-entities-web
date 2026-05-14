import { Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../logger";
import { mapInputDate } from "./mapper.utils";
import { EntityCookieKey } from "../../model/data.types.model";
import { ApplicationData } from "../../model/application.model";
import { getCompanyProfile } from "../../service/company.profile.service";
import { mapCompanyProfileToOverseasEntity } from "./company.profile.mapper.to.overseas.entity";

export const getDataFromEntityCookie = async (req: Request): Promise<ApplicationData> => {
  const emptyData = {};
  try {
    const entityNumber = JSON.parse(req.cookies[EntityCookieKey]).e_number;
    let data: ApplicationData = {
      "entity_number": entityNumber,
    };
    const companyProfile = await getCompanyProfile(req, entityNumber);
    if (!companyProfile) {
      logger.errorRequest(req, `Company profile not found for entity number: ${entityNumber} in cookie`);
      return emptyData;
    } else {
      data = {
        ...data,
        "entity_name": companyProfile.companyName,
        "entity": mapCompanyProfileToOverseasEntity(companyProfile),
        "update": {
          date_of_creation: mapInputDate(companyProfile.dateOfCreation),
        }
      };
      return data;
    }
  } catch (e) {
    logger.errorRequest(req, `Error reading data from entity cookie`);
    return emptyData;
  }
};

export const saveEntityNumberInCookie = (req: Request, res: Response, entityNumber: string) => {
  let cookieData = req.cookies[EntityCookieKey] ? JSON.parse(req.cookies[EntityCookieKey]) : {};
  cookieData = {
    ...cookieData,
    e_number: entityNumber
  };
  res.cookie(EntityCookieKey, JSON.stringify(cookieData), {
    httpOnly: true,
    domain: config.COOKIE_DOMAIN,
    path: config.UPDATE_AN_OVERSEAS_ENTITY_URL,
    secure: config.CHS_URL.includes("https://"),
  });
};

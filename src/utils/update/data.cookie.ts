import { Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../logger";
import { mapInputDate } from "./mapper.utils";
import { ApplicationData } from "../../model/application.model";
import { getCompanyProfile } from "../../service/company.profile.service";
import { mapCompanyProfileToOverseasEntity } from "./company.profile.mapper.to.overseas.entity";
import { EntityCookieCompanyNumberKey, EntityCookieKey } from "../../model/data.types.model";

export const getDataFromEntityCookie = async (req: Request, getCompany: boolean = true): Promise<ApplicationData> => {

  try {

    const cookieData = req.cookies[EntityCookieKey] ? JSON.parse(req.cookies[EntityCookieKey]) : {};
    const entityNumber = cookieData?.[EntityCookieCompanyNumberKey];

    if (!entityNumber || !getCompany) {
      return cookieData;
    }

    const companyProfile = await getCompanyProfile(req, entityNumber);

    if (!companyProfile) {
      logger.errorRequest(req, `Company profile not found for entity number: ${entityNumber} in cookie`);
      return cookieData;
    } else {
      const data = {
        "entity_number": entityNumber,
        "entity_name": companyProfile.companyName,
        "entity": mapCompanyProfileToOverseasEntity(companyProfile),
        "update": {
          date_of_creation: mapInputDate(companyProfile.dateOfCreation),
        }
      };
      return Object.assign(cookieData, data);
    }
  } catch (e) {
    logger.errorRequest(req, `Error reading data from entity cookie`);
    return {};
  }
};

export const saveDataToCookie = (req: Request, res: Response, key: string, data: any) => {
  try {
    let cookieData = req.cookies[EntityCookieKey] ? JSON.parse(req.cookies[EntityCookieKey]) : {};
    cookieData = {
      ...cookieData,
      [key]: data
    };
    res.cookie(EntityCookieKey, JSON.stringify(cookieData), {
      httpOnly: true,
      domain: config.COOKIE_DOMAIN,
      path: config.UPDATE_AN_OVERSEAS_ENTITY_URL,
      secure: config.CHS_URL.includes("https://"),
    });
  } catch (e) {
    logger.errorRequest(req, `Error saving data to entity cookie`);
    throw new Error(e.message);
  }
};

export const removeEntityCookie = (req: Request, res: Response) => {
  try {
    if (req.cookies?.[EntityCookieKey]) {
      res.cookie(EntityCookieKey, "{}", {
        httpOnly: true,
        domain: config.COOKIE_DOMAIN,
        path: config.UPDATE_AN_OVERSEAS_ENTITY_URL,
        secure: config.CHS_URL.includes("https://"),
        maxAge: 0,
      });
    }
  } catch (e) {
    logger.errorRequest(req, `Error removing entity cookie`);
  }
};

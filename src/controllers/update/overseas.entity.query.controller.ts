import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { OeNumberKey } from "../../model/data.types.model";
import { getCompanyProfile } from "../../service/company.profile";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    const oeNumber = appData?.oe_number;

    const errors = { errorList: [] } as any;
    if (oeNumber) {
      const cp = await getCompanyProfile(req, oeNumber);
      if (!cp) {
        const msg = `The Overseas Entity with OE number "${oeNumber}" was not found.`;
        errors.errorList.push({ href: `#error`, text: msg });
        errors.error = { text: msg };
      }
    }

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      [OeNumberKey]: appData?.[OeNumberKey],
      errors
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);
    const oeNumber = req.body[OeNumberKey];

    setExtraData(req.session, { [OeNumberKey]: oeNumber });
    return res.redirect(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

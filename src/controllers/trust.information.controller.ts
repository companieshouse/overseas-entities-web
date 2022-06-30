import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, trustType } from "../model";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import { TrustKey, TrustKeys } from "../model/trust.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.TRUST_INFO_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.TRUST_INFO_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
      templateName: config.TRUST_INFO_PAGE,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.TRUST_INFO_PAGE}`);

    const obj: trustType.Trust[] = JSON.parse(req.body.trusts);
    const t: trustType.Trusts = {
      trusts: obj
    };

    var trustCount = 0;
    if (req.session?.data.extra_data.roe.trusts != undefined) {
      trustCount = (req.session?.data.extra_data.roe.trusts).length;
    }

    for (var i in t.trusts) {
      trustCount++;
      t.trusts[i].trust_id = trustCount.toString();
    }

    const data: ApplicationDataType = setTrustData(t);

    for (const i in data[TrustKey]) {
      setApplicationData(req.session, data[TrustKey][i], TrustKey);
    }

    if (req.body.add) {
      return res.redirect(config.TRUST_INFO_URL);
    }
    if (req.body.submit) {
      return res.redirect(config.CHECK_YOUR_ANSWERS_PAGE);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setTrustData = (obj: any): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(obj, TrustKeys);

  return data;
};

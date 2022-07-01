import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, trustType } from "../model";
import { getApplicationData, prepareData, setApplicationData, getFromApplicationDataIfPresent } from "../utils/application.data";
import { TrustKey, TrustKeys } from "../model/trust.model";
import { BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";

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

    const beneficialOwnerIDs: string[] = [];
    if (typeof req.body.beneficialOwners === 'string') {
      beneficialOwnerIDs.push(req.body.beneficialOwners);

    } else {
      for (const bo in req.body.beneficialOwners) {
        beneficialOwnerIDs.push(req.body.beneficialOwners[bo]);
      }
    }

    const obj: trustType.Trust[] = JSON.parse(req.body.trusts);
    const t: trustType.Trusts = {
      trusts: obj
    };

    // Generate unique trust_id for each trust
    let trustCount = 0;
    if (req.session?.data.extra_data.roe.trusts !== undefined) {
      trustCount = (req.session?.data.extra_data.roe.trusts)?.length;
    }

    const trustIDs: string[] = [];
    for (const i in t.trusts) {
      trustCount++;
      t.trusts[i].trust_id = trustCount.toString();
      trustIDs.push(trustCount.toString());
    }

    setTrustIDs(req, beneficialOwnerIDs, trustIDs);


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

// set Trust IDs to each selected Beneficial Owner
const setTrustIDs = (req: any, beneficialOwnerIDs: string[], trustIDs: string[]) => {
  for (const i in beneficialOwnerIDs) {
    const individual = getFromApplicationDataIfPresent(req, BeneficialOwnerIndividualKey, beneficialOwnerIDs[i]);
    if (individual !== undefined) {
      for (const j in trustIDs) {
        if (individual.trust_ids === undefined) {
          individual.trust_ids = [];
        }
        (individual.trust_ids).push(trustIDs[j]);
      }
    }
    const corporate = getFromApplicationDataIfPresent(req, BeneficialOwnerOtherKey, beneficialOwnerIDs[i]);
    if (corporate !== undefined) {
      for (const j in trustIDs) {
        if (corporate.trust_ids === undefined) {
          corporate.trust_ids = [];
        }
        (corporate.trust_ids).push(trustIDs[j]);
      }
    }
  }
};

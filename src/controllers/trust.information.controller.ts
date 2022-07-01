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

    const beneficialOwnerIds: string[] = [];
    if (typeof req.body.beneficialOwners === 'string') {
      beneficialOwnerIds.push(req.body.beneficialOwners);

    } else {
      for (const bo in req.body.beneficialOwners) {
        beneficialOwnerIds.push(req.body.beneficialOwners[bo]);
      }
    }

    const trustData: trustType.Trust[] = JSON.parse(req.body.trusts);
    const trustsReq: trustType.Trusts = {
      trusts: trustData
    };

    // Generate unique trust_id for each trust
    let trustCount = 0;
    if (req.session?.data.extra_data.roe.trusts !== undefined) {
      trustCount = (req.session?.data.extra_data.roe.trusts)?.length;
    }

    const trustIds: string[] = [];
    for (const i in trustData) {
      trustCount++;
      trustData[i].trust_id = trustCount.toString();
      trustIds.push(trustCount.toString());
    }

    assignTrustIdsToBeneficialOwners(req, beneficialOwnerIds, trustIds);


    const data: ApplicationDataType = prepareData(trustsReq, TrustKeys);

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

const assignTrustIdsToBeneficialOwners = (req: any, beneficialOwnerIds: string[], trustIds: string[]) => {
  for (const i in beneficialOwnerIds) {
    const individualBo = getFromApplicationDataIfPresent(req, BeneficialOwnerIndividualKey, beneficialOwnerIds[i]);
    if (individualBo !== undefined) {
      for (const j in trustIds) {
        if (individualBo.trust_ids === undefined) {
          individualBo.trust_ids = [];
        }
        (individualBo.trust_ids).push(trustIds[j]);
      }
    }
    const corporateBo = getFromApplicationDataIfPresent(req, BeneficialOwnerOtherKey, beneficialOwnerIds[i]);
    if (corporateBo !== undefined) {
      for (const j in trustIds) {
        if (corporateBo.trust_ids === undefined) {
          corporateBo.trust_ids = [];
        }
        (corporateBo.trust_ids).push(trustIds[j]);
      }
    }
  }
};

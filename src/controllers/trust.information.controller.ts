import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { logger } from "../utils/logger";
import { isActiveFeature } from "../utils/feature.flag";
import { saveAndContinue } from "../utils/save.and.continue";
import { getRedirectUrl } from "../utils/url";
import { TrustKey, TrustKeys } from "../model/trust.model";
import { getBeneficialOwnerList } from "../utils/trusts";
import { BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import { BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";

import {
  trustType,
  ApplicationData,
  ApplicationDataType,
} from "../model";

import {
  prepareData,
  getApplicationData,
  setApplicationData,
  getFromApplicationData,
} from "../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {

    logger.debugRequest(req, `GET ${config.TRUST_INFO_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req);

    return res.render(config.TRUST_INFO_PAGE, {
      ...appData,
      templateName: config.TRUST_INFO_PAGE,
      url: config.REGISTER_AN_OVERSEAS_ENTITY_URL,
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
      beneficialOwners: getBeneficialOwnerList(appData),
    });

  } catch (error) {
    console.log("ERROR: ", error);
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `POST ${config.TRUST_INFO_PAGE}`);

    // If only one BO is selected, data is a string.
    // If multiple selected, data is an array.
    const beneficialOwnerIds = (typeof req.body.beneficialOwners === 'string') ? [req.body.beneficialOwners] : req.body.beneficialOwners;

    const trustData: trustType.Trust[] = JSON.parse(req.body.trusts, (key, value) => {
      if (typeof value === "string") {
        return value.trim();
      } else {
        return value;
      }
    });

    const trustsReq: trustType.Trusts = { trusts: trustData };
    const trustIds = await generateTrustIds(req, trustData);
    await assignTrustIdsToBeneficialOwners(req, beneficialOwnerIds, trustIds);
    const data: ApplicationDataType = prepareData(trustsReq, TrustKeys);
    const session = req.session as Session;

    for (const trust of data[TrustKey]) {
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        await setApplicationData(req, trust, TrustKey);
      } else {
        await setApplicationData(session, trust, TrustKey);
      }
    }

    await saveAndContinue(req, session);

    if (req.body.add) {
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: config.TRUST_INFO_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.TRUST_INFO_URL,
      }));
    }

    if (req.body.submit) {
      return res.redirect(config.CHECK_YOUR_ANSWERS_PAGE);
    }

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const assignTrustIdsToBeneficialOwners = async (req: any, beneficialOwnerIds: string[], trustIds: string[]) => {
  for (const beneficialOwnerId of beneficialOwnerIds) {
    await assignTrustIdsToIndividualBeneficialOwners(req, beneficialOwnerId, trustIds);
    await assignTrustIdsToCorporateBeneficialOwners(req, beneficialOwnerId, trustIds);
  }
};

const assignTrustIdsToIndividualBeneficialOwners = async (req: any, beneficialOwnerId: string, trustIds: string[]) => {
  const individualBo = await getFromApplicationData(req, BeneficialOwnerIndividualKey, beneficialOwnerId, false);
  if (individualBo !== undefined) {
    for (const trustId of trustIds) {
      if (individualBo.trust_ids === undefined) {
        individualBo.trust_ids = [];
      }
      (individualBo.trust_ids).push(trustId);
    }
  }
};

const assignTrustIdsToCorporateBeneficialOwners = async (req: any, beneficialOwnerId: string, trustIds: string[]) => {
  const corporateBo = await getFromApplicationData(req, BeneficialOwnerOtherKey, beneficialOwnerId, false);
  if (corporateBo !== undefined) {
    for (const trustId of trustIds) {
      if (corporateBo.trust_ids === undefined) {
        corporateBo.trust_ids = [];
      }
      (corporateBo.trust_ids).push(trustId);
    }
  }
};

// Generate a unique trust_id for each trust
const generateTrustIds = async (req: any, trustData: trustType.Trust[]): Promise<string[]> => {
  let trustCount = 0;
  const appData: ApplicationData = await getApplicationData(req);
  const trusts = appData[TrustKey];

  if (trusts !== undefined) {
    trustCount = trusts.length;
  }

  const trustIds: string[] = [];

  for (const trust of trustData) {
    trustCount++;
    trust.trust_id = trustCount.toString();
    trustIds.push(trustCount.toString());
  }

  return trustIds;

};

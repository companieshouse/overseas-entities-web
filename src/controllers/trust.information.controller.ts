import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, trustType } from "../model";
import { getApplicationData, prepareData, setApplicationData, getFromApplicationData } from "../utils/application.data";
import { TrustKey, TrustKeys } from "../model/trust.model";
import { BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import { checkMandatoryTrustFields, TrustValidationError } from "../validation/trust.information.validation";

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

    // If only one BO is selected, data is a string.
    // If multiple selected, data is an array.
    const beneficialOwnerIds = (typeof req.body.beneficialOwners === 'string') ? [req.body.beneficialOwners] : req.body.beneficialOwners;

    const trustData: trustType.Trust[] = JSON.parse(req.body.trusts);
    const trustsReq: trustType.Trusts = {
      trusts: trustData
    };

    const appData: ApplicationData = getApplicationData(req.session);

    const trustErrors = checkMandatoryTrustFields(trustData);
    if ( trustErrors.length > 0 ) {
      return res.render(config.TRUST_INFO_PAGE, {
        backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
        templateName: config.TRUST_INFO_PAGE,
        errors: formatTrustValidationErrors(trustErrors),
        trusts: req.body.trusts.toString(),
        ...appData
      });
    }

    const trustIds = generateTrustIds(req, trustData);

    assignTrustIdsToBeneficialOwners(req, beneficialOwnerIds, trustIds);

    const data: ApplicationDataType = prepareData(trustsReq, TrustKeys);

    for (const trust of data[TrustKey]) {
      setApplicationData(req.session, trust, TrustKey);
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
  for (const beneficialOwnerId of beneficialOwnerIds) {
    assignTrustIdsToIndividualBeneficialOwners(req, beneficialOwnerId, trustIds);
    assignTrustIdsToCorporateBeneficialOwners(req, beneficialOwnerId, trustIds);
  }
};

const assignTrustIdsToIndividualBeneficialOwners = (req: any, beneficialOwnerId: string, trustIds: string[]) => {
  const individualBo = getFromApplicationData(req, BeneficialOwnerIndividualKey, beneficialOwnerId, false);
  if (individualBo !== undefined) {
    for (const trustId of trustIds) {
      if (individualBo.trust_ids === undefined) {
        individualBo.trust_ids = [];
      }
      (individualBo.trust_ids).push(trustId);
    }
  }
};
const assignTrustIdsToCorporateBeneficialOwners = (req: any, beneficialOwnerId: string, trustIds: string[]) => {
  const corporateBo = getFromApplicationData(req, BeneficialOwnerOtherKey, beneficialOwnerId, false);
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
const generateTrustIds = (req: any, trustData: trustType.Trust[]): string[] => {
  let trustCount = 0;
  const appData: ApplicationData = getApplicationData(req.session);
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

function formatTrustValidationErrors(errorList: TrustValidationError[]) {
  const errors = { errorList: [] } as any;
  errorList.forEach( e => {
    errors.errorList.push({ href: `#${e.param}`, text: e.msg });
    errors[e.param] = { text: e.msg };
  });
  return errors;
}

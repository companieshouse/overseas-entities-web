import { NextFunction, Request, Response } from 'express';
import { getApplicationData } from '../../utils/application.data';
import { postTrustDetails } from "../../utils/trust.details";
import { logger } from '../../utils/logger';
import { getBoIndividualAssignableToTrust, getBoOtherAssignableToTrust } from '../../utils/trusts';
import * as mapperDetails from '../../utils/trust/details.mapper';
import * as mapperBo from '../../utils/trust/beneficial.owner.mapper';
import { UPDATE_MANAGE_TRUSTS_INTERRUPT_URL, UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE } from '../../config';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isReview = true;
    const appData = getApplicationData(req.session);
    const trustInReview = appData.update?.review_trusts?.find(trust => trust.review_status?.in_review);
    let trustId = "";
    if (trustInReview?.trust_id) {
      trustId = trustInReview?.trust_id;
    }

    if (appData.beneficial_owners_individual) {
      appData.beneficial_owners_individual[0].trust_ids = ["1"];
    }

    const formData = mapperDetails.mapDetailToPage(appData, trustId, isReview);

    const boAvailableForTrust = [
      ...getBoIndividualAssignableToTrust(appData)
        .map(mapperBo.mapBoIndividualToPage),
      ...getBoOtherAssignableToTrust(appData)
        .map(mapperBo.mapBoOtherToPage),
    ];

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_INTERRUPT_URL,
      pageData: {
        beneficialOwners: boAvailableForTrust
      },
      formData,
      isReview
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postTrustDetails(req, res, next, true, true);
};
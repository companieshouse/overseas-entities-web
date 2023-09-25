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

    const appData = getApplicationData(req.session);
    const trustInReview = appData.update?.review_trusts?.find(trust => trust.review?.in_review);
    let trustId = "";
    if (trustInReview?.trust_id) {
      trustId = trustInReview?.trust_id;
    }
    const formData = mapperDetails.mapDetailToPage(appData, trustId, true);

    const boAvailableForTrust = [
      ...getBoIndividualAssignableToTrust(appData)
        .map(mapperBo.mapBoIndividualToPage),
      ...getBoOtherAssignableToTrust(appData)
        .map(mapperBo.mapBoOtherToPage),
    ];

    if (appData.update?.review_trusts && trustInReview) {
      const historicalBOs = trustInReview.HISTORICAL_BO;
      const individualBos = trustInReview.INDIVIDUALS;
      const otherBos = trustInReview.CORPORATES;
      const trustBos = [
        ...getTrustBoTypeIds(historicalBOs),
        ...getTrustBoTypeIds(individualBos),
        ...getTrustBoTypeIds(otherBos)
      ];
      formData.beneficialOwnersIds = trustBos;
    }

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_INTERRUPT_URL,
      pageData: {
        beneficialOwners: boAvailableForTrust,
        isReview: true
      },
      formData
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postTrustDetails(req, res, next, true, true);

  // vvv  Conuir's Addition
  // take submitted form, update appData as appropriate, and save.
  // return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
};

const getTrustBoTypeIds = (boType) => {
  const boIds: string[] = [];
  for (const bo of boType) {
    if (bo.id) {
      const id = bo.id;
      boIds.push(id);
    }
  }
  return boIds;
};

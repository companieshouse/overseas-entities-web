import { NextFunction, Request, Response } from 'express';
import { getApplicationData } from '../../utils/application.data';
import { retrieveTrustsData } from '../../utils/update/trusts_data_fetch';
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
    retrieveTrustsData(appData);
    // const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trustId = "1";
    const formData = mapperDetails.mapDetailToPage(appData, trustId, true);

    const boAvailableForTrust = [
      ...getBoIndividualAssignableToTrust(appData)
        .map(mapperBo.mapBoIndividualToPage),
      ...getBoOtherAssignableToTrust(appData)
        .map(mapperBo.mapBoOtherToPage),
    ];

    if (appData.update?.review_trusts) {
      const trust = appData.update?.review_trusts.filter(bo => bo.trust_id === trustId);
      const historicalBOs = trust[0].HISTORICAL_BO;
      const individualBos = trust[0].INDIVIDUALS;
      const otherBos = trust[0].CORPORATES;
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

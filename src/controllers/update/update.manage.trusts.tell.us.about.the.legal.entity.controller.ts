import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
} from '../../config';
import { getApplicationData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { Trust } from '../../model/trust.model';
import { TrustLegalEntityForm } from '../../model/trust.page.model';
import { mapLegalEntityTrusteeFromSessionToPage } from '../../utils/trust/legal.entity.beneficial.owner.mapper';
import { getTrustInReview } from '../../utils/update/review_trusts';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const trust = getTrustInReview(appData) as Trust;

    // for editing existing trustee
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const formData = trusteeId ? mapLegalEntityTrusteeFromSessionToPage(appData, trust.trust_id, trusteeId) : {} as TrustLegalEntityForm;

    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
      pageParams: {
        title: "Tell us about the legal entity",
        roleWithinTrust: RoleWithinTrustType
      },
      pageData: {
        trustData: {
          trustId: trust.trust_id,
          trustName: trust.trust_name
        }
      },
      formData
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  TRUSTEE_ID,
  TRUST_ID,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
} from '../../config';
import { getApplicationData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { Trust } from '../../model/trust.model';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);

    const trustId = req.params[TRUST_ID];
    const trusteeId = req.params[TRUSTEE_ID];

    const trustee = getTrustee(appData, trustId, trusteeId);

    // Map trustee to form-appropriate fields

    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
      pageParams: {
        trustee,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // Update appData with new trustee details
    // Save back into appData

    return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);
  } catch (error) {
    next(error);
  }
};

const getTrust = (appData: ApplicationData, trustId: string): Trust | undefined => {
  return (appData.trusts ?? []).find(trust => trust.trust_id === trustId);
};

const getTrusteeIndex = (trust: Trust | undefined, trusteeId: string): number => {
  return (trust?.CORPORATES ?? []).findIndex(trustee => trustee.id === trusteeId);
};

const getTrustee = (appData: ApplicationData, trustId: string, trusteeId: string) => {
  const trust = getTrust(appData, trustId);
  const trusteeIndex = getTrusteeIndex(trust, trusteeId);

  if (trusteeIndex < 0) {
    return {};
  }

  return (trust?.CORPORATES ?? [])[trusteeIndex];
};

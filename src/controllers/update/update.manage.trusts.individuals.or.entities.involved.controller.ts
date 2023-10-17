import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';
import { logger } from '../../utils/logger';
import {
  SECURE_REGISTER_FILTER_URL,
  TRUST_ID,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
} from '../../config';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInvolvedPage } from '../../utils/trust.involved';
import { TrusteeType } from '../../model/trustee.type.model';

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrustInvolvedPage(req, res, next, true, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body.typeOfTrustee === TrusteeType.HISTORICAL) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);
    } else if (req.body.typeOfTrustee === TrusteeType.INDIVIDUAL) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL);
    } else if (req.body.typeOfTrustee === TrusteeType.LEGAL_ENTITY) {
      return res.redirect(SECURE_REGISTER_FILTER_URL);
    }
  } catch (error) {
    next(error);
  }
};

// No more to add.
export const postSubmit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const trustId = req.params[TRUST_ID];

    // Move trust into main trusts list and remove review meta
    moveTrustOutOfReview(appData, trustId);

    // Save back to appData
    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session, false);

    // Redirect to orchestrator to pick the next trust to review
    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const moveTrustOutOfReview = (appData: ApplicationData, trustId: string) => {
  const trustIndex = (appData.update?.review_trusts ?? []).findIndex(trust => trust.trust_id === trustId);
  const trust = appData.update?.review_trusts?.splice(trustIndex, 1)[0];

  if (!trust) { return; }

  delete trust.review_status;

  appData.trusts?.push(trust);
};

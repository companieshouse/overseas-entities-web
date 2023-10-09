import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';

import { logger } from '../../utils/logger';
import {
  TRUST_BENEFICIAL_OWNER_DETACH_URL,
  TRUST_ENTRY_URL,
  TRUST_ID,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_CHECK_YOUR_ANSWERS_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
} from '../../config';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { saveAndContinue } from '../../utils/save.and.continue';
import { TrusteeType } from '../../model/trustee.type.model';
import { TRUST_INVOLVED_TEXTS } from '../../utils/trust.involved';
import { mapTrustWhoIsInvolvedToPage } from '../../utils/trust/who.is.involved.mapper';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const trustInReview = appData.update?.review_trusts?.find(trust => trust.review_status?.in_review);
    let trustId = '';
    if (trustInReview) {
      trustId = trustInReview.trust_id;
    }

    return res.render(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
      pageParams: {
        title: TRUST_INVOLVED_TEXTS.title
      },
      pageData: {
        trustData: {
          trustId: trustId,
          trustName: trustInReview?.trust_name
        },
        ...mapTrustWhoIsInvolvedToPage(appData, trustId),
        beneficialOwnerTypeTitle: 'Beneficial Owner',
        trusteeTypeTitle: TRUST_INVOLVED_TEXTS.trusteeTypeTitle,
        individualTrusteeData: trustInReview?.INDIVIDUALS,
        formerTrusteeData: trustInReview?.HISTORICAL_BO,
        legalEntityTrusteeData: trustInReview?.CORPORATES,
        trusteeType: TrusteeType,
        checkYourAnswersUrl: UPDATE_CHECK_YOUR_ANSWERS_URL,
        beneficialOwnerUrlDetach: `${TRUST_ENTRY_URL}/${trustInReview?.trust_id}${TRUST_BENEFICIAL_OWNER_DETACH_URL}`
      },
      url: UPDATE_AN_OVERSEAS_ENTITY_URL
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // Redirect to adding one of the individual entities
    // depending on the option selected
    return res.redirect(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
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

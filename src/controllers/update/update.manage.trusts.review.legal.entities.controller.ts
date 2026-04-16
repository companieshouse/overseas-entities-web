import { NextFunction, Request, Response } from 'express';

import { Session } from '@companieshouse/node-session-handler';

import {
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_WITH_PARAMS_URL,
} from '../../config';
import { logger } from '../../utils/logger';
import { fetchApplicationData, setExtraData } from '../../utils/application.data';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInReview, setTrusteesAsReviewed } from '../../utils/update/review_trusts';
import { TrusteeType } from '../../model/trustee.type.model';
import { getRedirectUrl, isRemoveJourney } from '../../utils/url';
import { isActiveFeature } from '../../utils/feature.flag';
import { updateOverseasEntity } from '../../service/overseas.entities.service';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const trustInReview = getTrustInReview(appData);
    const legalEntities = trustInReview?.CORPORATES;

    if (!legalEntities || legalEntities.length === 0) {
      throw new Error('Failed to render Manage Trusts Review legal entities page. No legal entities in session');
    }

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL
    });

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE,
      baseChangeUrl: getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL,
      }),
      backLinkUrl,
      pageData: {
        trustName: trustInReview?.trust_name ?? '',
        legalEntities,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body.addLegalEntity) {
      const redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL
      });
      return res.redirect(redirectUrl);
    }

    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);

    setTrusteesAsReviewed(appData, TrusteeType.LEGAL_ENTITY);

    setExtraData(req.session, appData);
    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      await updateOverseasEntity(req, req.session as Session, appData);
    } else {
      await saveAndContinue(req, req.session as Session);
    }

    const redirectUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL
    });
    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};


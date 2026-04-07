import { NextFunction, Request, Response } from "express";

import { Session } from "@companieshouse/node-session-handler";

import {
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_WITH_PARAMS_URL,
} from "../../config";
import { logger } from "../../utils/logger";
import { fetchApplicationData, setExtraData } from "../../utils/application.data";
import { saveAndContinue } from "../../utils/save.and.continue";
import {
  getTrustInReview,
  setTrusteesAsReviewed,
} from "../../utils/update/review_trusts";
import { TrusteeType } from "../../model/trustee.type.model";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { isActiveFeature } from "../../utils/feature.flag";
import { updateOverseasEntity } from "../../service/overseas.entities.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const trustInReview = getTrustInReview(appData);
    let individuals = trustInReview?.INDIVIDUALS;

    if (!individuals) {
      throw new Error('Failed to render Manage Trusts Review individuals page. No individuals in session');
    }
    // filter individuals to only include those with both firstname and surname
    individuals = individuals.filter(boindividual => boindividual?.forename?.trim() && boindividual?.surname?.trim());

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL
    });

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE,
      baseChangeUrl: getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
      }),
      backLinkUrl,
      pageData: {
        trustName: trustInReview?.trust_name ?? '',
        individuals,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    if (req.body.addIndividual) {
      const redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL
      });
      return res.redirect(redirectUrl);
    }

    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);

    setTrusteesAsReviewed(appData, TrusteeType.INDIVIDUAL);
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


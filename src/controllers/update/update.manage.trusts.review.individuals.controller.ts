import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { logger } from "../../utils/logger";
import { TrusteeType } from "../../model/trustee.type.model";
import { getRedirectUrl } from "../../utils/url";
import { saveAndContinue } from "../../utils/save.and.continue";
import { isActiveFeature } from "../../utils/feature.flag";
import { updateOverseasEntity } from "../../service/overseas.entities.service";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { getTrustInReview, setTrusteesAsReviewed, } from "../../utils/update/review_trusts";

import {
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = await getApplicationData(req);
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
      backLinkUrl,
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE,
      pageData: {
        trustName: trustInReview?.trust_name ?? '',
        individuals,
      },
      baseChangeUrl: getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session: Session = req.session as Session;
    if (req.body.addIndividual) {
      const redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL
      });
      return res.redirect(redirectUrl);
    }

    const appData = await getApplicationData(req);
    setTrusteesAsReviewed(appData, TrusteeType.INDIVIDUAL);
    setExtraData(session, appData);

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await updateOverseasEntity(req, session, appData);
    } else {
      await saveAndContinue(req, session);
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


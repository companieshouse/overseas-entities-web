import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE,
} from '../../config';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { Session } from '@companieshouse/node-session-handler';
import { Trust, TrustHistoricalBeneficialOwner } from '../../model/trust.model';
import { TrusteeType } from '../../model/trustee.type.model';
import { TrustHistoricalBeneficialOwnerForm } from '../../model/trust.page.model';
import { validationResult } from 'express-validator';
import { FormattedValidationErrors, formatValidationError } from '../../middleware/validation.middleware';
import { saveAndContinue } from '../../utils/save.and.continue';
import { mapBeneficialOwnerToSession, mapFormerTrusteeFromSessionToPage } from '../../utils/trust/historical.beneficial.owner.mapper';
import { getTrustInReview, getTrustee, getTrusteeIndex } from '../../utils/update/review_trusts';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = await getApplicationData(req.session);
    const trust = getTrustInReview(appData) as Trust;
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trustee = getTrustee(trust, trusteeId, TrusteeType.HISTORICAL) as TrustHistoricalBeneficialOwner;

    const formData = trusteeId ? mapFormerTrusteeFromSessionToPage(trustee) : {} as TrustHistoricalBeneficialOwnerForm;

    const pageProperties = getPageProperties(trust, formData);

    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE, pageProperties);
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData = await getApplicationData(session);
    const trust = getTrustInReview(appData) as Trust;
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const formData: TrustHistoricalBeneficialOwnerForm = req.body as TrustHistoricalBeneficialOwnerForm;

    // check for form validation errors
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
      const pageProperties = getPageProperties(trust, formData, formatValidationError(errorList.array()));
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE, pageProperties);
    }

    const trusteeIndex = getTrusteeIndex(trust, trusteeId, TrusteeType.HISTORICAL);

    if (trust.HISTORICAL_BO && trusteeIndex >= 0) {
      // update existing trustee
      const trusteeToChange = trust.HISTORICAL_BO[trusteeIndex];
      const updatedTrustee = mapBeneficialOwnerToSession(formData, trusteeToChange);
      trust.HISTORICAL_BO[trusteeIndex] = updatedTrustee;
    } else {
      // add new trustee
      const trustee = mapBeneficialOwnerToSession(req.body);
      trust.HISTORICAL_BO?.push(trustee);
    }

    setExtraData(session, appData);
    await saveAndContinue(req, session);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const getPageProperties = (trust: Trust, formData?: TrustHistoricalBeneficialOwnerForm, errors?: FormattedValidationErrors) => ({
  backLinkUrl: getBackLink(trust.review_status?.reviewed_former_bos),
  templateName: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE,
  pageParams: {
    title: "Tell us about the former beneficial owner",
  },
  pageData: {
    trustData: {
      trustId: trust.trust_id,
      trustName: trust.trust_name
    },
    trusteeType: TrusteeType,
  },
  formData,
  errors
});

const getBackLink = (formerBosReviewed) => {
  if (formerBosReviewed) {
    return UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL;
  } else {
    return UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL;
  }
};

import { NextFunction, Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';

import { logger } from '../../utils/logger';
import { Session } from '@companieshouse/node-session-handler';
import { TrusteeType } from '../../model/trustee.type.model';
import { saveAndContinue } from '../../utils/save.and.continue';
import { ApplicationData } from "../../model";
import { isActiveFeature } from "../../utils/feature.flag";
import { updateOverseasEntity } from "../../service/overseas.entities.service";
import { TrustHistoricalBeneficialOwnerForm } from '../../model/trust.page.model';

import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { fetchApplicationData, setExtraData } from '../../utils/application.data';
import { Trust, TrustHistoricalBeneficialOwner } from '../../model/trust.model';
import { FormattedValidationErrors, formatValidationError } from '../../middleware/validation.middleware';
import { getTrustInReview, getTrustee, getTrusteeIndex } from '../../utils/update/review_trusts';
import { mapBeneficialOwnerToSession, mapFormerTrusteeFromSessionToPage } from '../../utils/trust/historical.beneficial.owner.mapper';
import { filingPeriodTrustCeaseDateValidations, filingPeriodTrustStartDateValidations } from '../../validation/async';

import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
} from '../../config';

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const trust = getTrustInReview(appData) as Trust;
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trustee = getTrustee(trust, trusteeId, TrusteeType.HISTORICAL) as TrustHistoricalBeneficialOwner;
    const formData = trusteeId ? mapFormerTrusteeFromSessionToPage(trustee) : {} as TrustHistoricalBeneficialOwnerForm;
    const pageProperties = getPageProperties(trust, formData, req);

    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE, pageProperties);

  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const trust = getTrustInReview(appData) as Trust;
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const formData: TrustHistoricalBeneficialOwnerForm = req.body as TrustHistoricalBeneficialOwnerForm;
    const errorList = validationResult(req);
    const errors = await getValidationErrors(req);

    if (!errorList.isEmpty() || errors.length) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];
      const pageProperties = getPageProperties(trust, formData, req, formatValidationError([...errorListArray, ...errors]));
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE, pageProperties);
    }

    const trusteeIndex = getTrusteeIndex(trust, trusteeId, TrusteeType.HISTORICAL);

    if (trust.HISTORICAL_BO && trusteeIndex >= 0) {
      const trusteeToChange = trust.HISTORICAL_BO[trusteeIndex];
      const updatedTrustee = mapBeneficialOwnerToSession(formData, trusteeToChange);
      trust.HISTORICAL_BO[trusteeIndex] = updatedTrustee;
    } else {
      const trustee = mapBeneficialOwnerToSession(req.body);
      trust.HISTORICAL_BO?.push(trustee);
    }

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      await updateOverseasEntity(req, req.session as Session, appData);
    } else {
      await saveAndContinue(req, session);
    }
    setExtraData(session, appData);

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
    }));

  } catch (error) {
    next(error);
  }
};

const getPageProperties = (trust: Trust, formData: TrustHistoricalBeneficialOwnerForm, req: Request, errors?: FormattedValidationErrors) => ({
  errors,
  formData,
  backLinkUrl: getBackLink(trust.review_status?.reviewed_former_bos, req),
  templateName: req.url ? req.url.replace(UPDATE_AN_OVERSEAS_ENTITY_URL, "") : UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE,
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
});

const getBackLink = (formerBosReviewed, req: Request) => {
  if (formerBosReviewed) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
    });
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
    });
  }
};

const getValidationErrors = async (req: Request): Promise<ValidationError[]> => {
  const filingPeriodTrustStartDateErrors = await filingPeriodTrustStartDateValidations(req);
  const filingPeriodTrustCeaseDateErrors = await filingPeriodTrustCeaseDateValidations(req);
  return [...filingPeriodTrustStartDateErrors, ...filingPeriodTrustCeaseDateErrors];
};


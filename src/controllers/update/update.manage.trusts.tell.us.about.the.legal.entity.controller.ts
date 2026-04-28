import { NextFunction, Request, Response } from 'express';
import { ValidationError, validationResult } from "express-validator";
import { Session } from '@companieshouse/node-session-handler';

import { logger } from '../../utils/logger';
import { TrusteeType } from '../../model/trustee.type.model';
import { saveAndContinue } from '../../utils/save.and.continue';
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from '../../model';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { TrustLegalEntityForm } from '../../model/trust.page.model';
import { updateOverseasEntity } from "../../service/overseas.entities.service";

import { Trust, TrustCorporate } from '../../model/trust.model';
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { fetchApplicationData, setExtraData } from '../../utils/application.data';
import { getTrustInReview, getTrustee, getTrusteeIndex } from '../../utils/update/review_trusts';
import { FormattedValidationErrors, formatValidationError } from '../../middleware/validation.middleware';
import { mapLegalEntityTrusteeFromSessionToPage, mapLegalEntityToSession } from '../../utils/trust/legal.entity.beneficial.owner.mapper';

import { checkTrusteeLegalEntityCeasedDate } from '../../validation/async';
import { checkTrustLegalEntityBeneficialOwnerStillInvolved } from '../../validation/stillInvolved.validation';

import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
} from '../../config';

const getPageProperties = (req, trust, formData, url: string, errors?: FormattedValidationErrors) => {

  return {
    errors,
    formData,
    isUpdate: true,
    backLinkUrl: getBackLink(req, trust.review_status?.reviewed_legal_entities),
    templateName: url ? url.replace(UPDATE_AN_OVERSEAS_ENTITY_URL, "") : UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
    pageParams: {
      title: 'Tell us about the legal entity',
    },
    pageData: {
      trustData: {
        trustName: trust?.trust_name,
      },
      roleWithinTrustType: RoleWithinTrustType,
      entity_name: null,
    },
  };
};

const getPagePropertiesRelevantPeriod = (req, isRelevantPeriod, trust, formData, url: string, entityName, errors?: FormattedValidationErrors) => {
  const pageProps = getPageProperties(req, trust, formData, url, errors);
  pageProps.formData.relevant_period = isRelevantPeriod;
  pageProps.pageData.entity_name = entityName;
  return pageProps;
};

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const isRelevantPeriod = req.query['relevant-period'];
    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.LEGAL_ENTITY) as TrustCorporate;
    const formData = trustee ? mapLegalEntityTrusteeFromSessionToPage(trustee) : {};

    if (isRelevantPeriod || (trustee && trustee.relevant_period)) {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, getPagePropertiesRelevantPeriod(req, true, trust, formData, req.url, appData.entity_name));
    } else {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, getPageProperties(req, trust, formData, req.url));
    }
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.LEGAL_ENTITY) as TrustCorporate;
    const isRelevantPeriod = req.query['relevant-period'];
    const formData = req.body as TrustLegalEntityForm;
    const errorList = validationResult(req);
    const errors = await getValidationErrors(appData, req);

    if (!errorList.isEmpty() || errors.length) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];

      if (isRelevantPeriod || (trustee && trustee.relevant_period)) {
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
          getPagePropertiesRelevantPeriod(req, true, trust, formData, req.url, appData.entity_name, formatValidationError([...errorListArray, ...errors])),
        );
      } else {
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
          getPageProperties(req, trust, formData, req.url, formatValidationError([...errorListArray, ...errors])),
        );
      }
    }

    const trusteeIndex = getTrusteeIndex(trust, trusteeId, TrusteeType.LEGAL_ENTITY);

    if (trust.CORPORATES && trusteeIndex >= 0) {
      const trusteeToChange = trust.CORPORATES[trusteeIndex];
      const updatedTrustee = mapLegalEntityToSession(formData, trusteeToChange);
      trust.CORPORATES[trusteeIndex] = updatedTrustee;
    } else {
      const trustee = mapLegalEntityToSession(formData);
      trust.CORPORATES?.push(trustee);
    }

    await saveAppData(req, appData);

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
    }));

  } catch (error) {
    next(error);
  }
};

const saveAppData = async(req: Request, appData: ApplicationData) => {
  setExtraData(req.session, appData);
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    await updateOverseasEntity(req, req.session as Session, appData);
  } else {
    await saveAndContinue(req, req.session as Session);
  }
};

const getBackLink = (req, legalEntitiesReviewed: boolean) => {
  if (legalEntitiesReviewed) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
    });
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
    });
  }
};

const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const stillInvolvedErrors = checkTrustLegalEntityBeneficialOwnerStillInvolved(appData, req);
  const ceasedDateErrors = await checkTrusteeLegalEntityCeasedDate(appData, req);
  return [...stillInvolvedErrors, ...ceasedDateErrors];
};

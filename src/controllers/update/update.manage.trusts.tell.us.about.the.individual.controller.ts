import { NextFunction, Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { Session } from '@companieshouse/node-session-handler';

import { logger } from '../../utils/logger';
import { TrusteeType } from '../../model/trustee.type.model';
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from 'model';
import { saveAndContinue } from '../../utils/save.and.continue';
import { updateOverseasEntity } from "../../service/overseas.entities.service";
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { checkTrusteeInterestedDate } from '../../validation/fields/date.validation';
import { IndividualTrusteesFormCommon } from '../../model/trust.page.model';
import { checkTrustIndividualCeasedDate } from '../../validation/async';
import { checkTrustIndividualBeneficialOwnerStillInvolved } from '../../validation/stillInvolved.validation';

import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { fetchApplicationData, setExtraData } from '../../utils/application.data';
import { FormattedValidationErrors, formatValidationError } from '../../middleware/validation.middleware';
import { mapIndividualTrusteeFromSessionToPage, mapIndividualTrusteeToSession } from '../../utils/trust/individual.trustee.mapper';

import {
  getTrustee,
  getTrusteeIndex,
  getTrustInReview,
} from '../../utils/update/review_trusts';

import {
  Trust,
  TrustIndividual,
  IndividualTrustee,
} from '../../model/trust.model';

import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
} from '../../config';

const getPageProperties = (trust, formData, trustee: TrustIndividual, req: Request, errors?: FormattedValidationErrors) => {
  return {
    errors,
    formData,
    isUpdate: true,
    uneditableDOB: !!trustee?.ch_references,
    backLinkUrl: getBackLink(req, trust.review_status.reviewed_individuals),
    templateName: req.url ? req.url.replace(UPDATE_AN_OVERSEAS_ENTITY_URL, "") : UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
    pageParams: {
      title: 'Tell us about the individual',
    },
    pageData: {
      trustData: {
        trustName: trust?.trust_name
      },
      roleWithinTrustType: RoleWithinTrustType,
      entity_name: trust?.trust_name,
    },
  };
};

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.INDIVIDUAL) as IndividualTrustee;
    const formData = trustee ? mapIndividualTrusteeFromSessionToPage(trustee) : {};
    const relevant_period = req.query['relevant-period'];

    if (relevant_period || (trustee && trustee.relevant_period)) {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE, getPagePropertiesRelevantPeriod(true, trust, formData, trustee, appData.entity_name, req));
    } else {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE, getPageProperties(trust, formData, trustee, req));
    }

  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session = req.session as Session;
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trust = getTrustInReview(appData) as Trust;
    const relevant_period = req.query['relevant-period'];
    const errorList = validationResult(req);
    const errors = await getValidationErrors(appData, req);
    const formData: IndividualTrusteesFormCommon = req.body;

    if (!errorList.isEmpty() || errors.length) {
      const trustee = getTrustee(trust, trusteeId, TrusteeType.INDIVIDUAL) as IndividualTrustee;
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];

      if (relevant_period || (trustee && trustee.relevant_period)) {
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
          getPagePropertiesRelevantPeriod(true, trust, formData, trustee, appData.entity_name, req, formatValidationError([...errorListArray, ...errors])),
        );
      } else {
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
          getPageProperties(trust, formData, trustee, req, formatValidationError([...errorListArray, ...errors])),
        );
      }
    }

    const trusteeIndex = getTrusteeIndex(trust, trusteeId, TrusteeType.INDIVIDUAL);

    if (trust.INDIVIDUALS && trusteeIndex >= 0) {
      const trusteeToChange = trust.INDIVIDUALS[trusteeIndex];
      const updatedTrustee = mapIndividualTrusteeToSession(formData, trusteeToChange);
      trust.INDIVIDUALS[trusteeIndex] = updatedTrustee;
    } else {
      const trustee = mapIndividualTrusteeToSession(formData);
      trust.INDIVIDUALS?.push(trustee);
    }

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await updateOverseasEntity(req, session, appData);
    } else {
      await saveAndContinue(req, session);
    }
    setExtraData(req.session, appData);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);

  } catch (error) {
    next(error);
  }
};

const getBackLink = (req: Request, individualsReviewed: boolean) => {
  if (individualsReviewed) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
    });
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
    });
  }
};

const getPagePropertiesRelevantPeriod = (relevant_period, trust, formData, trustee: TrustIndividual, entityName, req: Request, errors?: FormattedValidationErrors) => {
  const pageProps = getPageProperties(trust, formData, trustee, req, errors);
  pageProps.formData.relevant_period = relevant_period;
  pageProps.pageData.entity_name = entityName;
  return pageProps;
};

const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const stillInvolvedErrors = checkTrustIndividualBeneficialOwnerStillInvolved(appData, req);
  const ceasedDateErrors = await checkTrustIndividualCeasedDate(appData, req);
  const interestedDateErrors = checkTrusteeInterestedDate(appData, req);
  return [...stillInvolvedErrors, ...ceasedDateErrors, ...interestedDateErrors];
};

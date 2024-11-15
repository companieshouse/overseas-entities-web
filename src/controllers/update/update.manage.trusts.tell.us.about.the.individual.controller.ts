import { NextFunction, Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';

import { Session } from '@companieshouse/node-session-handler';

import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
} from '../../config';
import { logger } from '../../utils/logger';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { mapIndividualTrusteeFromSessionToPage, mapIndividualTrusteeToSession } from '../../utils/trust/individual.trustee.mapper';
import { getTrustInReview, getTrustee, getTrusteeIndex } from '../../utils/update/review_trusts';
import { saveAndContinue } from '../../utils/save.and.continue';
import { FormattedValidationErrors, formatValidationError } from '../../middleware/validation.middleware';
import { TrusteeType } from '../../model/trustee.type.model';
import { IndividualTrustee, Trust, TrustIndividual } from '../../model/trust.model';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { IndividualTrusteesFormCommon } from '../../model/trust.page.model';
import { ApplicationData } from 'model';
import { checkTrustIndividualCeasedDate } from '../../validation/async';
import { checkTrustIndividualBeneficialOwnerStillInvolved } from '../../validation/stillInvolved.validation';

const getPageProperties = (trust, formData, trustee: TrustIndividual, url: string, errors?: FormattedValidationErrors) => {
  return {
    templateName: url ? url.replace(UPDATE_AN_OVERSEAS_ENTITY_URL, "") : UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
    backLinkUrl: getBackLink(trust.review_status.reviewed_individuals),
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
    formData,
    errors,
    uneditableDOB: trustee?.ch_references ? true : false,
    isUpdate: true // this is an update controller so we are safe to say that isUpdate is true
  };
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req.session);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];

    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.INDIVIDUAL) as IndividualTrustee;

    const formData = trustee ? mapIndividualTrusteeFromSessionToPage(trustee) : {};
    const relevant_period = req.query['relevant-period'];

    if (relevant_period || (trustee && trustee.relevant_period)) {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE, getPagePropertiesRelevantPeriod(true, trust, formData, trustee, appData.entity_name, req.url));
    } else {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE, getPageProperties(trust, formData, trustee, req.url));
    }

  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = await getApplicationData(req.session);
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
          getPagePropertiesRelevantPeriod(true, trust, formData, trustee, appData.entity_name, req.url, formatValidationError([...errorListArray, ...errors])),
        );
      } else {
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
          getPageProperties(trust, formData, trustee, req.url, formatValidationError([...errorListArray, ...errors])),
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

    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const getBackLink = (individualsReviewed: boolean) => {
  if (individualsReviewed) {
    return UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL;
  } else {
    return UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL;
  }
};

const getPagePropertiesRelevantPeriod = (relevant_period, trust, formData, trustee: TrustIndividual, entityName, url: string, errors?: FormattedValidationErrors) => {
  const pageProps = getPageProperties(trust, formData, trustee, url, errors);
  pageProps.formData.relevant_period = relevant_period;
  pageProps.pageData.entity_name = entityName;
  return pageProps;
};

// Get validation errors that depend on an asynchronous request
const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const stillInvolvedErrors = checkTrustIndividualBeneficialOwnerStillInvolved(appData, req);
  const ceasedDateErrors = await checkTrustIndividualCeasedDate(appData, req);

  return [...stillInvolvedErrors, ...ceasedDateErrors];
};

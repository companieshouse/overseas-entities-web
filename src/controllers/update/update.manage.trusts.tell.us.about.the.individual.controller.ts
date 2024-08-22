import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { Session } from '@companieshouse/node-session-handler';

import {
  ROUTE_PARAM_TRUSTEE_ID,
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

type TrustIndividualBeneficialOwnerPageProperties = { templateName: string,
  backLinkUrl: string
  pageParams: {
    title: string,
  },
  pageData: {
    trustData: {
      trustName: any
    },
    roleWithinTrustType: typeof RoleWithinTrustType,
      entity_name: string | undefined,
  },
  formData: TrustIndividual,
    errors: FormattedValidationErrors | undefined,
    uneditableDOB: boolean,
    isUpdate: boolean };

const getPageProperties = (trust, formData, trustee: TrustIndividual, errors?: FormattedValidationErrors) => {
  return {
    templateName: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
    backLinkUrl: getBackLink(trust.review_status.reviewed_individuals),
    pageParams: {
      title: 'Tell us about the individual',
    },
    pageData: {
      trustData: {
        trustName: trust?.trust_name
      },
      roleWithinTrustType: RoleWithinTrustType,
      entity_name: undefined,
    },
    formData,
    errors,
    uneditableDOB: trustee?.ch_references ? true : false,
    isUpdate: true // this is an update controller so we are safe to say that isUpdate is true
  };
};

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];

    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.INDIVIDUAL) as IndividualTrustee;

    const formData = trustee ? mapIndividualTrusteeFromSessionToPage(trustee) : {};
    const relevant_period = req.query ? req.query["relevant-period"] === "true" : false;

    const pageProps = getPageProperties(trust, formData, trustee);
    pageProps.formData.relevant_period = relevant_period || (trustee ? trustee.relevant_period : false);
    setEntityNameInRelevantPeriodPageBanner(pageProps, appData.entity_name);
    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE, pageProps);

  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = getApplicationData(req.session);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trust = getTrustInReview(appData) as Trust;

    const relevant_period = req.query['relevant-period'];
    const errorList = validationResult(req);
    const formData: IndividualTrusteesFormCommon = req.body;

    if (!errorList.isEmpty()) {
      let pageProps: TrustIndividualBeneficialOwnerPageProperties;
      const trustee = getTrustee(trust, trusteeId, TrusteeType.INDIVIDUAL) as IndividualTrustee;
      if (relevant_period) {
        pageProps = getPagePropertiesRelevantPeriod(relevant_period, trust, formData, trustee, appData.entity_name, formatValidationError(errorList.array()));
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
          pageProps,
        );
      } else {
        pageProps = getPageProperties(trust, formData, trustee, formatValidationError(errorList.array()));
        setEntityNameInRelevantPeriodPageBanner(pageProps, appData.entity_name);
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
          pageProps,
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

const getPagePropertiesRelevantPeriod = (relevant_period, trust, formData, trustee: TrustIndividual, entityName, errors?: FormattedValidationErrors) => {
  const pageProps = getPageProperties(trust, formData, trustee, errors);
  pageProps.formData.relevant_period = relevant_period;
  setEntityNameInRelevantPeriodPageBanner(pageProps, entityName);
  return pageProps;
};

export const setEntityNameInRelevantPeriodPageBanner = (pageProps, entityName: string | undefined) => {
  // name the entity for the page template
  if (pageProps && pageProps.pageData && entityName !== undefined) {
    pageProps.pageData.entity_name = entityName;
  }
  return pageProps;
};

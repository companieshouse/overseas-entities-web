import { NextFunction, Request, Response } from 'express';
import { validationResult } from "express-validator";
import { Session } from '@companieshouse/node-session-handler';

import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
} from '../../config';
import { logger } from '../../utils/logger';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { mapLegalEntityTrusteeFromSessionToPage, mapLegalEntityToSession } from '../../utils/trust/legal.entity.beneficial.owner.mapper';
import { getTrustInReview, getTrustee, getTrusteeIndex } from '../../utils/update/review_trusts';
import { saveAndContinue } from '../../utils/save.and.continue';
import { FormattedValidationErrors, formatValidationError } from '../../middleware/validation.middleware';
import { TrusteeType } from '../../model/trustee.type.model';
import { Trust, TrustCorporate } from '../../model/trust.model';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { CommonTrustData, TrustLegalEntityForm } from '../../model/trust.page.model';
import { ApplicationData } from '../../model';

type TrustLegalEntityBeneficialOwnerPageProperties = {
  backLinkUrl: string,
  templateName: string;
  pageParams: {
    title: string;
  },
  pageData: {
    trustData: CommonTrustData,
    roleWithinTrustType: typeof RoleWithinTrustType,
    entity_name?: string;
  },
  formData?: TrustLegalEntityForm,
  errors?: FormattedValidationErrors,
  isUpdate: boolean
};

const getPageProperties = (trust, formData, errors?: FormattedValidationErrors) => {
  return {
    templateName: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
    backLinkUrl: getBackLink(trust.review_status?.reviewed_legal_entities),
    pageParams: {
      title: 'Tell us about the legal entity',
    },
    pageData: {
      trustData: {
        trustId: trust?.trust_id,
        trustName: trust?.trust_name,
      },
      roleWithinTrustType: RoleWithinTrustType,
      entity_name: undefined,
    },
    formData,
    errors,
    isUpdate: true
  };
};

const getPagePropertiesRelevantPeriod = (isRelevantPeriod, trust, formData, entityName, errors?: FormattedValidationErrors) => {
  const pageProps = getPageProperties(trust, formData, errors);
  pageProps.formData.relevant_period = isRelevantPeriod;
  setEntityNameInRelevantPeriodPageBanner(pageProps, entityName);
  return pageProps;
};

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = getApplicationData(req.session);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];

    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.LEGAL_ENTITY) as TrustCorporate;

    const formData = trustee ? mapLegalEntityTrusteeFromSessionToPage(trustee) : {};
    const isRelevantPeriod = req.query ? req.query["relevant-period"] === "true" : false;

    if (isRelevantPeriod || (trustee && trustee.relevant_period)) {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, getPagePropertiesRelevantPeriod(true, trust, formData, appData.entity_name));
    } else {
      return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, getPageProperties(trust, formData));
    }
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

    const isRelevantPeriod = req.query['relevant-period'];
    const formData = req.body as TrustLegalEntityForm;
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
      let pageProps: TrustLegalEntityBeneficialOwnerPageProperties;
      if (isRelevantPeriod) {
        pageProps = getPagePropertiesRelevantPeriod(isRelevantPeriod, trust, formData, appData.entity_name, formatValidationError(errorList.array()));
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, pageProps,
        );
      } else {
        pageProps = getPageProperties(trust, formData, formatValidationError(errorList.array()));
        setEntityNameInRelevantPeriodPageBanner(pageProps, appData.entity_name);
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, pageProps,
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

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const saveAppData = async(req: Request, appData: ApplicationData) => {
  setExtraData(req.session, appData);
  await saveAndContinue(req, req.session as Session);
};

const getBackLink = (legalEntitiesReviewed: boolean) => {
  if (legalEntitiesReviewed) {
    return UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL;
  } else {
    return UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL;
  }
};

export const setEntityNameInRelevantPeriodPageBanner = (pageProps, entityName: string | undefined) => {
  // name the entity for the page template
  if (pageProps && pageProps.pageData && entityName !== undefined) {
    pageProps.pageData.entity_name = entityName;
  }
  return pageProps;
};

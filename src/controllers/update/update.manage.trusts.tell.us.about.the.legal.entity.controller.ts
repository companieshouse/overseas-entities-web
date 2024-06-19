import { NextFunction, Request, Response } from 'express';
import { validationResult } from "express-validator";
import * as config from '../../config';
import { Session } from '@companieshouse/node-session-handler';

import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
  UPDATE_MANAGE_TRUSTS_RELEVANT_PERIOD_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
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
import { TrustLegalEntityForm } from '../../model/trust.page.model';
import { ApplicationData } from '../../model';

const getPageProperties = (trust, formData, errors?: FormattedValidationErrors) => {
  return {
    templateName: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
    backLinkUrl: getBackLink(trust.review_status?.reviewed_legal_entities),
    pageParams: {
      title: 'Tell us about the legal entity',
    },
    pageData: {
      trustData: {
        trustName: trust?.trust_name,
      },
      roleWithinTrustType: RoleWithinTrustType,
    },
    formData,
    errors,
    isUpdate: true
  };
};

const getPagePropertiesRelevantPeriod = (relevantPeriod, trust, formData, errors?: FormattedValidationErrors) => {
  formData.relevantPeriod = relevantPeriod;
  formData.entity_name = trust.trust_name;
  return getPageProperties(trust, formData, errors);
};

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = getApplicationData(req.session);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const relevantPeriod = req.query['relevant-period'];

    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.LEGAL_ENTITY) as TrustCorporate;

    const formData = trustee ? mapLegalEntityTrusteeFromSessionToPage(trustee) : {};

    if (relevantPeriod) {
      return res.render(UPDATE_MANAGE_TRUSTS_RELEVANT_PERIOD_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, getPagePropertiesRelevantPeriod(relevantPeriod, trust, formData));
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

    const errorList = validationResult(req);
    const formData: TrustLegalEntityForm = req.body as TrustLegalEntityForm;

    if (!errorList.isEmpty()) {
      const relevantPeriod = req.query['relevant-period'];
      if (relevantPeriod) {
        return renderGetPageWithError(req, res);
      } else {
        return res.render(
          UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
          getPageProperties(trust, formData, formatValidationError(errorList.array())),
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
  await saveAndContinue(req, req.session as Session, false);
};

const getBackLink = (legalEntitiesReviewed: boolean) => {
  if (legalEntitiesReviewed) {
    return UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL;
  } else {
    return UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL;
  }
};

const renderGetPageWithError = (req: Request, res: Response) => {
  const errors = { errorList: [] } as any;
  errors.errorList.push({ href: `#toDoHandleRoleWithinTrustValidation-hint`, text: "Select its role within the trust" });
  return res.render(UPDATE_MANAGE_TRUSTS_RELEVANT_PERIOD_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, {
    backLinkUrl: `${config.UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
    templateName: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE,
    errors
  });
};

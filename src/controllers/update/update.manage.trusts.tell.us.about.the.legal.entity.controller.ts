import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

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

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];

    const trust = getTrustInReview(appData) as Trust;
    const trustee = getTrustee(trust, trusteeId, TrusteeType.LEGAL_ENTITY) as TrustCorporate;

    const formData = trustee ? mapLegalEntityTrusteeFromSessionToPage(trustee) : {};

    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE, getPageProperties(trust, formData));
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
      return res.render(
        UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE,
        getPageProperties(trust, formData, formatValidationError(errorList.array())),
      );
    }

    const trusteeIndex = getTrusteeIndex(trust, trusteeId, TrusteeType.LEGAL_ENTITY);

    if (trust.CORPORATES && trusteeIndex >= 0) {
      const trusteeToChange = trust.CORPORATES[trusteeIndex];
      const updatedTrustee = mapLegalEntityToSession(formData, trusteeToChange);
      console.log("\n\n\n >>>>>>>>>>>>>>>>>>>>>>>>>>>> WEBAPP update " + JSON.stringify(updatedTrustee) + "\n\n\n");
      trust.CORPORATES[trusteeIndex] = updatedTrustee;
    } else {
      const trustee = mapLegalEntityToSession(formData);
      console.log("\n\n\n >>>>>>>>>>>>>>>>>>>>>>>>>>>> WEBAPP create " + JSON.stringify(trustee) + "\n\n\n");
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

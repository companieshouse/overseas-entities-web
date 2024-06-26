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

    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE, getPageProperties(trust, formData, trustee));
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
    const formData: IndividualTrusteesFormCommon = req.body as IndividualTrusteesFormCommon;

    if (!errorList.isEmpty()) {
      const trustee = getTrustee(trust, trusteeId, TrusteeType.INDIVIDUAL) as IndividualTrustee;

      return res.render(
        UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
        getPageProperties(trust, formData, trustee, formatValidationError(errorList.array())),
      );
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
    await saveAndContinue(req, req.session as Session, false);

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

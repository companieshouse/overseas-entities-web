import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { Session } from '@companieshouse/node-session-handler';

import {
  ROUTE_PARAM_TRUSTEE_ID,
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
import { IndividualTrustee, Trust } from '../../model/trust.model';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { IndividualTrusteesFormCommon } from '../../model/trust.page.model';

const getPageProperties = (trust, formData, errors?: FormattedValidationErrors) => {
  return {
    templateName: UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
    backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
    pageParams: {
      title: 'Tell us about the individual',
    },
    pageData: {
      trustData: { trustName: trust?.trust_name },
      roleWithinTrustType: RoleWithinTrustType,
    },
    formData,
    errors,
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

    return res.render(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE, getPageProperties(trust, formData));
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
      return res.render(
        UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE,
        getPageProperties(trust, formData, formatValidationError(errorList.array())),
      );
    }

    const trustee = mapIndividualTrusteeToSession(formData);
    const trusteeIndex = getTrusteeIndex(trust, trusteeId, TrusteeType.INDIVIDUAL);

    if (trust.INDIVIDUALS && trusteeIndex >= 0) {
      trust.INDIVIDUALS[trusteeIndex] = trustee;
    } else {
      trust.INDIVIDUALS?.push(trustee);
    }

    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session, false);

    return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);
  } catch (error) {
    next(error);
  }
};

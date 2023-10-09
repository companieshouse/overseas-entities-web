import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import {
  ROUTE_PARAM_TRUSTEE_ID,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
  UPDATE_TRUSTS_TELL_US_ABOUT_FORMER_BO_PAGE,
  UPDATE_TRUSTS_TELL_US_ABOUT_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE,
} from '../../config';
import { HISTORICAL_BO_TEXTS } from '../../utils/trust.former.bo';
import { TrusteeType } from '../../model/trustee.type.model';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { validationResult } from 'express-validator';
import { formatValidationError } from '../../middleware/validation.middleware';
import { mapBeneficialOwnerToSession, mapFormerTrusteeFromSessionToPage } from '../../utils/trust/historical.beneficial.owner.mapper';
import { saveHistoricalBoInTrust, saveIndividualTrusteeInTrust, saveLegalEntityBoInTrust, saveTrustInApp } from '../../utils/trusts';
import { Session } from '@companieshouse/node-session-handler';
import { saveAndContinue } from '../../utils/save.and.continue';
import { INDIVIDUAL_BO_TEXTS } from '../../utils/trust.individual.beneficial.owner';
import { LEGAL_ENTITY_BO_TEXTS } from '../../utils/trust.legal.entity.bo';
import { mapLegalEntityToSession, mapLegalEntityTrusteeFromSessionToPage } from '../../utils/trust/legal.entity.beneficial.owner.mapper';
import { mapIndividualTrusteeFromSessionToPage, mapIndividualTrusteeToSession } from '../../utils/trust/individual.trustee.mapper';
import { ApplicationData } from '../../model';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';

export const getTrusteePage = (req: Request, res: Response, next: NextFunction, trusteeType: TrusteeType) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = getApplicationData(req.session);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trustInReview = appData.update?.review_trusts?.find(trust => trust.review_status?.in_review);
    const trustId = trustInReview?.trust_id ?? "";
    const formData = getFormData(trusteeType, appData, trustId, trusteeId);

    return res.render(getTemplateName(trusteeType), {
      templateName: getTemplateName(trusteeType),
      backLinkUrl: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
      pageParams: {
        title: getTitle(trusteeType)
      },
      pageData: {
        trusteeType: TrusteeType,
        trustData: {
          trustName: trustInReview?.trust_name,
          trustId: trustInReview?.trust_id,
        },
        roleWithinTrustType: RoleWithinTrustType,
      },
      formData
    });
  } catch (error) {
    next(error);
  }
};

export const postTrusteePage = async (req: Request, res: Response, next: NextFunction, trusteeType: TrusteeType) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const errorList = validationResult(req);
    const errors = formatValidationError(errorList.array());
    const formData = req.body;
    const appData = getApplicationData(req.session);
    const trustInReview = appData.update?.review_trusts?.find(trust => trust.review_status?.in_review);

    if (!errorList.isEmpty()) {
      return res.render(getTemplateName(trusteeType), {
        templateName: getTemplateName(trusteeType),
        backLinkUrl: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
        pageParams: {
          title: getTitle(trusteeType)
        },
        pageData: {
          trusteeType: TrusteeType,
          trustData: {
            trustName: trustInReview?.trust_name,
            trustId: trustInReview?.trust_id,
          },
          roleWithinTrustType: RoleWithinTrustType,
        },
        formData,
        errors
      });
    }

    const updatedTrust = saveBoToTrust(trusteeType, appData, trustInReview, formData);
    const updatedAppData = saveTrustInApp(appData, updatedTrust, true);
    const session = req.session as Session;
    setExtraData(session, updatedAppData);

    await saveAndContinue(req, session, true);

    return res.redirect(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

const getTemplateName = (trusteeType: TrusteeType) => {
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return UPDATE_TRUSTS_TELL_US_ABOUT_FORMER_BO_PAGE;
        break;
      case TrusteeType.INDIVIDUAL:
        return UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE;
        break;
      case TrusteeType.LEGAL_ENTITY:
        return UPDATE_TRUSTS_TELL_US_ABOUT_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE;
  }
};

const getTitle = (trusteeType: TrusteeType) => {
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return HISTORICAL_BO_TEXTS.title;
        break;
      case TrusteeType.INDIVIDUAL:
        return INDIVIDUAL_BO_TEXTS.title;
        break;
      case TrusteeType.LEGAL_ENTITY:
        return LEGAL_ENTITY_BO_TEXTS.title;
  }
};

const getFormData = (trusteeType: TrusteeType, appData: ApplicationData, trustId: string, trusteeId: string) => {
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return mapFormerTrusteeFromSessionToPage(appData, trustId, trusteeId, true);
        break;
      case TrusteeType.INDIVIDUAL:
        return mapIndividualTrusteeFromSessionToPage(appData, trustId, trusteeId, true);
        break;
      case TrusteeType.LEGAL_ENTITY:
        return mapLegalEntityTrusteeFromSessionToPage(appData, trustId, trusteeId, true);
  }
};

const saveBoToTrust = (trusteeType: TrusteeType, appData: ApplicationData, trustInReview, formData) => {
  let trusteeData;
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        trusteeData = mapBeneficialOwnerToSession(formData);
        return saveHistoricalBoInTrust(
          trustInReview,
          trusteeData,
        );
        break;
      case TrusteeType.INDIVIDUAL:
        trusteeData = mapIndividualTrusteeToSession(formData);
        return saveIndividualTrusteeInTrust(
          trustInReview,
          trusteeData,
        );
        break;
      case TrusteeType.LEGAL_ENTITY:
        trusteeData = mapLegalEntityToSession(formData);
        return saveLegalEntityBoInTrust(
          trustInReview,
          trusteeData,
        );
  }
};

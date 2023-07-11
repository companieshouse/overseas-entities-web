import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getBoIndividualAssignableToTrust, getBoOtherAssignableToTrust, getTrustArray, containsTrustData, saveTrustInApp, getTrustByIdFromApp } from '../utils/trusts';
import { getApplicationData, setExtraData } from '../utils/application.data';
import * as mapperDetails from '../utils/trust/details.mapper';
import * as mapperBo from '../utils/trust/beneficial.owner.mapper';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';
import { safeRedirect } from '../utils/http.ext';
import { validationResult } from 'express-validator/src/validation-result';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { saveAndContinue } from '../utils/save.and.continue';
import { Session } from '@companieshouse/node-session-handler';

export const TRUST_DETAILS_TEXTS = {
  title: 'Tell us about the trust',
  subtitle: 'You can add more trusts later.'
};

type TrustDetailPageProperties = {
  backLinkUrl: string;
  templateName: string;
  pageParams: {
    title: string;
    subtitle: string,
  };
  pageData: {
    beneficialOwners: PageModel.TrustBeneficialOwnerListItem[];
  };
  formData: PageModel.TrustDetailsForm,
  errors?: FormattedValidationErrors,
  url: string,
};

const getPageProperties = (
  req: Request,
  formData: PageModel.TrustDetailsForm,
  isUpdate: boolean,
  errors?: FormattedValidationErrors,
): TrustDetailPageProperties => {
  const appData: ApplicationData = getApplicationData(req.session);

  const boAvailableForTrust = [
    ...getBoIndividualAssignableToTrust(appData)
      .map(mapperBo.mapBoIndividualToPage),
    ...getBoOtherAssignableToTrust(appData)
      .map(mapperBo.mapBoOtherToPage),
  ];

  return {
    backLinkUrl: getBackLinkUrl(isUpdate, appData),
    templateName: getPageTemplate(isUpdate),
    pageParams: {
      title: TRUST_DETAILS_TEXTS.title,
      subtitle: TRUST_DETAILS_TEXTS.subtitle,
    },
    pageData: {
      beneficialOwners: boAvailableForTrust,
    },
    formData,
    errors,
    url: getUrl(isUpdate),
  };
};

export const getTrustDetails = (req: Request, res: Response, next: NextFunction, isUpdate: boolean): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const formData: PageModel.TrustDetailsForm = mapperDetails.mapDetailToPage(
      appData,
      trustId,
    );

    const pageProps = getPageProperties(req, formData, isUpdate);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrustDetails = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean) => {
  /**
   * Set/remove trust id to/from beneficial owner in Application data
   *
   * @param appData Application Data in Session
   * @param trustId Set/remove identifier
   * @param selectedBoIds set for selected beneficial owners
   */
  const updateBeneficialOwnersTrustInApp = (
    appData: ApplicationData,
    trustId: string,
    selectedBoIds: string[],
  ): ApplicationData => {
    const boIndividual = mapperDetails.mapBeneficialOwnerToSession(
      appData[BeneficialOwnerIndividualKey],
      selectedBoIds,
      trustId,
    );

    const boOther = mapperDetails.mapBeneficialOwnerToSession(
      appData[BeneficialOwnerOtherKey],
      selectedBoIds,
      trustId,
    );

    return {
      ...appData,
      [BeneficialOwnerOtherKey]: boOther,
      [BeneficialOwnerIndividualKey]: boIndividual,
    };
  };

  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    //  get trust data from session
    let appData: ApplicationData = getApplicationData(req.session);

    // check for errors
    const errorList = validationResult(req);
    const formData: PageModel.TrustDetailsForm = req.body as PageModel.TrustDetailsForm;

    if (!errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        formData,
        isUpdate,
        formatValidationError(errorList.array()),
      );

      return res.render(pageProps.templateName, pageProps);
    }

    //  map form data to session trust data
    const details = mapperDetails.mapDetailToSession(req.body);
    if (!details.trust_id) {
      details.trust_id = mapperDetails.generateTrustId(appData);
    }

    //  if present, get existing trust from session (as it might have attached trustees)
    const trust = getTrustByIdFromApp(appData, details.trust_id);
    Object.keys(details).forEach(key => trust[key] = details[key]);

    //  update trust  in application data at session
    appData = saveTrustInApp(appData, trust);

    //  update trusts in beneficial owners
    const selectedBoIds = req.body?.beneficialOwnersIds ?? [];
    appData = updateBeneficialOwnersTrustInApp(appData, details.trust_id, selectedBoIds);

    //  save to session
    const session = req.session as Session;
    setExtraData(session, appData);

    await saveAndContinue(req, session, true);

    return safeRedirect(res, getNextPage(isUpdate, details.trust_id));

  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

const getBackLinkUrl = (isUpdate: boolean, appData: ApplicationData) => {
  if (isUpdate){
    return config.UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL;
  } else {
    let backLinkUrl = `${config.TRUST_ENTRY_URL + config.TRUST_INTERRUPT_URL}`;

    if (containsTrustData(getTrustArray(appData))) {
      backLinkUrl = `${config.TRUST_ENTRY_URL + config.ADD_TRUST_URL}`;
    }

    return backLinkUrl;
  }
};

const getPageTemplate = (isUpdate: boolean) => {
  if (isUpdate){
    return config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE;
  } else {
    return config.TRUST_DETAILS_PAGE;
  }
};

const getUrl = (isUpdate: boolean) => {
  if (isUpdate){
    return config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  } else {
    return config.REGISTER_AN_OVERSEAS_ENTITY_URL;
  }
};

const getNextPage = (isUpdate: boolean, trustId: string) => {
  if (isUpdate){
    return config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL;
  } else {
    return `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`;
  }
};

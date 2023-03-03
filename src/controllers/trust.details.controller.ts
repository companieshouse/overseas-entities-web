import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getBoIndividualAssignableToTrust, getBoOtherAssignableToTrust, getTrustArray, containsTrustData } from '../utils/trusts';
import { getApplicationData, setExtraData } from '../utils/application.data';
import * as mapperDetails from '../utils/trust/details.mapper';
import * as mapperBo from '../utils/trust/beneficial.owner.mapper';
import { saveTrustInApp } from '../utils/trusts';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';
import { safeRedirect } from '../utils/http.ext';
import { validationResult } from 'express-validator/src/validation-result';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { saveAndContinue } from '../utils/save.and.continue';
import { Session } from '@companieshouse/node-session-handler';

const TRUST_DETAILS_TEXTS = {
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
};

const getPageProperties = (
  req: Request,
  formData: PageModel.TrustDetailsForm,
  errors?: FormattedValidationErrors,
): TrustDetailPageProperties => {
  const appData: ApplicationData = getApplicationData(req.session);

  const boAvailableForTrust = [
    ...getBoIndividualAssignableToTrust(appData)
      .map(mapperBo.mapBoIndividualToPage),
    ...getBoOtherAssignableToTrust(appData)
      .map(mapperBo.mapBoOtherToPage),
  ];

  let backLinkUrl = `${config.TRUST_ENTRY_URL + config.TRUST_INTERRUPT_URL}`;

  if (containsTrustData(getTrustArray(appData))) {
    backLinkUrl = `${config.TRUST_ENTRY_URL + config.ADD_TRUST_URL}`;
  }

  return {
    backLinkUrl,
    templateName: config.TRUST_DETAILS_PAGE,
    pageParams: {
      title: TRUST_DETAILS_TEXTS.title,
      subtitle: TRUST_DETAILS_TEXTS.subtitle,
    },
    pageData: {
      beneficialOwners: boAvailableForTrust,
    },
    formData,
    errors,
  };
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    console.log("RENDERING TRUST DETAILS");

    const appData: ApplicationData = getApplicationData(req.session);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const formData: PageModel.TrustDetailsForm = mapperDetails.mapDetailToPage(
      appData,
      trustId,
    );

    const pageProps = getPageProperties(req, formData);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const post = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
        formatValidationError(errorList.array()),
      );

      return res.render(pageProps.templateName, pageProps);
    }

    //  map form data to session trust data
    const details = mapperDetails.mapDetailToSession(req.body);
    if (!details.trust_id) {
      details.trust_id = mapperDetails.generateTrustId(appData);
    }

    //  update trust details in application data at session
    appData = saveTrustInApp(appData, details);

    //  update trusts in beneficial owners
    const selectedBoIds = req.body?.beneficialOwnersIds ?? [];
    appData = updateBeneficialOwnersTrustInApp(appData, details.trust_id, selectedBoIds);

    //  save to session
    const session = req.session as Session;
    setExtraData(session, appData);

    await saveAndContinue(req, session);

    return safeRedirect(res, `${config.TRUST_ENTRY_URL}/${details.trust_id}${config.TRUST_INVOLVED_URL}`);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

export {
  get,
  post,
  TRUST_DETAILS_TEXTS,
};

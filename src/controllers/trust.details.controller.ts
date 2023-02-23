import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { getBoIndividualAssignableToTrust, getBoOtherAssignableToTrust } from '../utils/trusts';
import { getApplicationData, setExtraData } from '../utils/application.data';
import * as mapperDetails from '../utils/trust/details.mapper';
import * as mapperBo from '../utils/trust/beneficial.owner.mapper';
import { saveTrustInApp } from '../utils/trusts';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';

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
    errors?: any[];
  };
  formData: PageModel.TrustDetailsForm,
};

const getPageProperties = (
  req: Request,
  formData: PageModel.TrustDetailsForm,
): TrustDetailPageProperties => {
  const appData: ApplicationData = getApplicationData(req.session);

  const boAvailableForTrust = [
    ...getBoIndividualAssignableToTrust(appData)
      .map(mapperBo.mapBoIndividualToPage),
    ...getBoOtherAssignableToTrust(appData)
      .map(mapperBo.mapBoOtherToPage),
  ];

  let backLinkUrl = `${config.TRUST_ENTRY_URL + config.TRUST_INTERRUPT_URL}`;
  const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
  console.log("TRUST DETAILS PULLED ID");
  console.log(trustId);

  if (trustId > "1") {
    const previousTrustId = Number(trustId) - 1;
    backLinkUrl = `${config.TRUST_ENTRY_URL + "/" + String(previousTrustId) + config.ADD_TRUST_URL}`;
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
  };
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

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

const post = (
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
    setExtraData(req.session, appData);

    return res.redirect(`${config.TRUST_ENTRY_URL}/${details.trust_id}${config.TRUST_INVOLVED_URL}`);
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

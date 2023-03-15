import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice
} from "../../model/beneficial.owner.type.model";

import { getApplicationData, setApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { EntityNumberKey } from "../../model/data.types.model";
import { ManagingOfficerKey, ManagingOfficerIndividual } from "../../model/managing.officer.model";
import { ManagingOfficerCorporateKey, ManagingOfficerCorporate } from "../../model/managing.officer.corporate.model";
import { mapToManagingOfficer, mapToManagingOfficerCorporate } from "../../utils/update/managing.officer.mapper";
import { getCompanyOfficers } from "../../service/company.managing.officer.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    await retrieveManagingOfficers(req, appData);

    return res.render(config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_REVIEW_URL,
      templateName: config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
      ...appData,
      noLists: true
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.redirect(getNextPage(req.body[BeneficialOwnerTypeKey]));
};

export const postSubmit = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.redirect(config.UPDATE_CHECK_YOUR_ANSWERS_URL);
};

const getNextPage = (beneficialOwnerTypeChoices: BeneficialOwnerTypeChoice | ManagingOfficerTypeChoice): string => {
  switch (beneficialOwnerTypeChoices) {
      case BeneficialOwnerTypeChoice.government:
        return config.UPDATE_BENEFICIAL_OWNER_GOV_URL;
      case BeneficialOwnerTypeChoice.otherLegal:
        return config.UPDATE_BENEFICIAL_OWNER_OTHER_URL;
      case ManagingOfficerTypeChoice.corporate:
        return config.UPDATE_MANAGING_OFFICER_CORPORATE_URL;
      case ManagingOfficerTypeChoice.individual:
        return config.UPDATE_MANAGING_OFFICER_URL;
      default:
        return config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL;
  }
};

export const retrieveManagingOfficers = async (req: Request, appData: ApplicationData) => {
  const officerResource = await getCompanyOfficers(req, appData[EntityNumberKey] as string);
  const session = Session as any;
  const raw = officerResource as any;
  if (officerResource !== undefined) {
    for (const item of (raw.items || [])) {
      const officer = item;
      if (item.officer_role === "secretary"){
        const managingOfficer: ManagingOfficerIndividual = mapToManagingOfficer(officer);
        setApplicationData(session, managingOfficer, ManagingOfficerKey);
      } else if (item.officer_role === "director") {
        const managingOfficerCorporate: ManagingOfficerCorporate = mapToManagingOfficerCorporate(officer);
        setApplicationData(session, managingOfficerCorporate, ManagingOfficerCorporateKey);
      }
    }
  } else {
    setApplicationData(session, [], ManagingOfficerKey);
    setApplicationData(session, [], ManagingOfficerCorporateKey);
  }
};

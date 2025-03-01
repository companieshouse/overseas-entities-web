import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../../config";
import { ApplicationData } from "../../model";
import { createAndLogErrorRequest, logger } from "../../utils/logger";
import { setExtraData } from "../../utils/application.data";
import { isActiveFeature } from "../../utils/feature.flag";
import { startPaymentsSession } from "../../service/payment.service";
import { getTransaction } from "../../service/transaction.service";
import { mapTrustApiReturnModelToWebModel } from "../../utils/trusts";
import { isRegistrationJourney } from "../../utils/url";
import { DueDiligenceKey } from "../../model/due.diligence.model";
import { OverseasEntityDueDiligenceKey } from "../../model/overseas.entity.due.diligence.model";

import { getOverseasEntity, updateOverseasEntity } from "../../service/overseas.entities.service";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../model/who.is.making.filing.model";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { ManagingOfficerIndividual, ManagingOfficerKey } from "../../model/managing.officer.model";

import {
  ID,
  Transactionkey,
  HasSoldLandKey,
  NonLegalFirmNoc,
  OverseasEntityKey,
  IsSecureRegisterKey,
} from "../../model/data.types.model";

export const getResumePage = async (req: Request, res: Response, next: NextFunction, resumePage: string) => {

  try {

    logger.debugRequest(req, `GET a saved OE submission`);

    // set missing request parameters used in the main journey
    if (req.params[config.ROUTE_PARAM_SUBMISSION_ID]) {
      req.params[config.ROUTE_PARAM_OVERSEAS_ENTITY_ID] = req.params[config.ROUTE_PARAM_SUBMISSION_ID];
    } else {
      req.params[config.ROUTE_PARAM_SUBMISSION_ID] = req.params[config.ROUTE_PARAM_OVERSEAS_ENTITY_ID];
    }

    const { transactionId, overseasEntityId } = req.params;
    const infoMsg = `Transaction ID: ${transactionId}, OverseasEntity ID: ${overseasEntityId}`;
    const isRegistration: boolean = isRegistrationJourney(req);
    logger.infoRequest(req, `Resuming OE - ${infoMsg}`);
    const appData: ApplicationData = await getOverseasEntity(req, transactionId, overseasEntityId);

    if (!Object.keys(appData || {}).length) {
      throw createAndLogErrorRequest(req, `Error on resuming OE - ${infoMsg}`);
    }

    const session = req.session as Session;
    await setWebApplicationData(req, session, appData, transactionId, overseasEntityId, isRegistration);
    const transactionResource = await getTransaction(req, transactionId);

    if (transactionResource.status === config.CLOSED_PENDING_PAYMENT) {
      const headersPaymentUrl = {
        headers: {
          [config.PAYMENT_REQUIRED_HEADER]: config.PAYMENTS_API_URL + config.PAYMENTS
        }
      };
      const baseURL = `${config.CHS_URL}${isRegistration ? config.REGISTER_AN_OVERSEAS_ENTITY_URL : config.UPDATE_AN_OVERSEAS_ENTITY_URL}`;
      const redirectPath = await startPaymentsSession(req, session, transactionId, overseasEntityId, headersPaymentUrl, baseURL);
      logger.infoRequest(req, `Payments Session created on Resume link with, Trans_ID: ${transactionId}, OE_ID: ${overseasEntityId}. Redirect to: ${redirectPath}`);
      return res.redirect(redirectPath);
    }

    return res.redirect(resumePage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

/**
 * Set default values needed for the web journey that are not part of OE API data model
 * nor part of the SDK mapper object.
 * Add IDs needed for the web to select single BOs or MOs on beneficial-owner-type screen and
 * related checkboxes for different pages
 * @param session
 * @param appData
 * @param transactionId
 * @param overseasEntityId
 */
const setWebApplicationData = async (
  req: Request,
  session: Session,
  appData: ApplicationData,
  transactionId: string,
  overseasEntityId: string,
  isRegistration: boolean
) => {

  appData[BeneficialOwnerIndividualKey] = (appData[BeneficialOwnerIndividualKey] as BeneficialOwnerIndividual[])
    .map(boi => { return { ...boi, [ID]: uuidv4() }; });
  appData[BeneficialOwnerOtherKey] = (appData[BeneficialOwnerOtherKey] as BeneficialOwnerOther[])
    .map(boo => { return { ...boo, [ID]: uuidv4() }; });
  appData[BeneficialOwnerGovKey] = (appData[BeneficialOwnerGovKey] as BeneficialOwnerGov[])
    .map(bog => { return { ...bog, [ID]: uuidv4() }; });
  appData[ManagingOfficerKey] = (appData[ManagingOfficerKey] as ManagingOfficerIndividual[])
    .map(moi => { return { ...moi, [ID]: uuidv4() }; });
  appData[ManagingOfficerCorporateKey] = (appData[ManagingOfficerCorporateKey] as ManagingOfficerCorporate[])
    .map(moc => { return { ...moc, [ID]: uuidv4() }; });

  if (!isRegistration || !isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    appData[HasSoldLandKey] = '0';
    appData[IsSecureRegisterKey] = '0';
    if (appData[OverseasEntityDueDiligenceKey] && Object.keys(appData[OverseasEntityDueDiligenceKey]).length) {
      appData[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    } else if (appData[DueDiligenceKey] && Object.keys(appData[DueDiligenceKey]).length) {
      appData[WhoIsRegisteringKey] = WhoIsRegisteringType.AGENT;
    }
  }

  appData[Transactionkey] = transactionId;
  appData[OverseasEntityKey] = overseasEntityId;

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)) {
    mapTrustApiReturnModelToWebModel(appData);
  }

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC) && (!appData.entity_number)) {
    console.debug("Removing old NOCs");
    appData[BeneficialOwnerIndividualKey].forEach(boi => { delete boi[NonLegalFirmNoc]; });
    appData[BeneficialOwnerOtherKey].forEach(boo => { delete boo[NonLegalFirmNoc]; });
    appData[BeneficialOwnerGovKey].forEach(bog => { delete bog[NonLegalFirmNoc]; });
  }

  if (isRegistration && isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    await updateOverseasEntity(req, req.session as Session, appData, true);
  }

  setExtraData(session, appData);
};

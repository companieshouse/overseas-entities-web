import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../../config";

import { ApplicationData } from "../../model";
import { createAndLogErrorRequest, logger } from "../../utils/logger";
import { setExtraData } from "../../utils/application.data";
import { isActiveFeature } from "../../utils/feature.flag";
import { getOverseasEntity } from "../../service/overseas.entities.service";

import {
  HasSoldLandKey,
  ID,
  IsSecureRegisterKey,
  OverseasEntityKey,
  Transactionkey
} from "../../model/data.types.model";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../model/who.is.making.filing.model";
import { OverseasEntityDueDiligenceKey } from "../../model/overseas.entity.due.diligence.model";
import { DueDiligenceKey } from "../../model/due.diligence.model";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { ManagingOfficerIndividual, ManagingOfficerKey } from "../../model/managing.officer.model";

import { startPaymentsSession } from "../../service/payment.service";
import { getTransaction } from "../../service/transaction.service";
import { mapTrustApiReturnModelToWebModel } from "../../utils/trusts";

export const getResumePage = async (req: Request, res: Response, next: NextFunction, resumePage: string) => {
  try {
    logger.debugRequest(req, `GET a saved OE submission`);

    const { transactionId, overseaEntityId } = req.params;
    const infoMsg = `Transaction ID: ${transactionId}, OverseasEntity ID: ${overseaEntityId}`;
    const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);

    logger.infoRequest(req, `Resuming OE - ${infoMsg}`);

    const appData: ApplicationData = await getOverseasEntity(req, transactionId, overseaEntityId);

    if (!Object.keys(appData || {}).length) {
      throw createAndLogErrorRequest(req, `Error on resuming OE - ${infoMsg}`);
    }

    const session = req.session as Session;
    setWebApplicationData(session, appData, transactionId, overseaEntityId);

    const transactionResource = await getTransaction(req, transactionId);

    if (transactionResource.status === config.CLOSED_PENDING_PAYMENT) {
      const headersPaymentUrl = {
        headers: {
          [config.PAYMENT_REQUIRED_HEADER]: config.PAYMENTS_API_URL + config.PAYMENTS
        }
      };

      const baseURL = `${config.CHS_URL}${isRegistration ? config.REGISTER_AN_OVERSEAS_ENTITY_URL : config.UPDATE_AN_OVERSEAS_ENTITY_URL}`;

      const redirectPath = await startPaymentsSession(req, session, transactionId, overseaEntityId, headersPaymentUrl, baseURL);

      logger.infoRequest(req, `Payments Session created on Resume link with, Trans_ID: ${transactionId}, OE_ID: ${overseaEntityId}. Redirect to: ${redirectPath}`);

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
 * @param overseaEntityId
 */
const setWebApplicationData = (session: Session, appData: ApplicationData, transactionId: string, overseaEntityId: string) => {

  appData[BeneficialOwnerIndividualKey] = (appData[BeneficialOwnerIndividualKey] as BeneficialOwnerIndividual[])
    .map( boi => { return { ...boi, [ID]: uuidv4() }; } );
  appData[BeneficialOwnerOtherKey] = (appData[BeneficialOwnerOtherKey] as BeneficialOwnerOther[] )
    .map( boo => { return { ...boo, [ID]: uuidv4() }; } );
  appData[BeneficialOwnerGovKey] = (appData[BeneficialOwnerGovKey] as BeneficialOwnerGov[])
    .map( bog => { return { ...bog, [ID]: uuidv4() }; } );
  appData[ManagingOfficerKey] = (appData[ManagingOfficerKey] as ManagingOfficerIndividual[])
    .map( moi => { return { ...moi, [ID]: uuidv4() }; } );
  appData[ManagingOfficerCorporateKey] = (appData[ManagingOfficerCorporateKey] as ManagingOfficerCorporate[])
    .map( moc => { return { ...moc, [ID]: uuidv4() }; } );

  appData[HasSoldLandKey] = '0';
  appData[IsSecureRegisterKey] = '0';
  appData[Transactionkey] = transactionId;
  appData[OverseasEntityKey] = overseaEntityId;

  if (appData[OverseasEntityDueDiligenceKey]) {
    if (Object.keys(appData[OverseasEntityDueDiligenceKey]).length) {
      appData[WhoIsRegisteringKey] = WhoIsRegisteringType.SOMEONE_ELSE;
    }
  } else if (appData[DueDiligenceKey]) {
    if (Object.keys(appData[DueDiligenceKey]).length) {
      appData[WhoIsRegisteringKey] = WhoIsRegisteringType.AGENT;
    }
  }

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)) {
    mapTrustApiReturnModelToWebModel(appData);
  }

  setExtraData(session, appData);
};

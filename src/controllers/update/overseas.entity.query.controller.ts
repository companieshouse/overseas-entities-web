import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData, setApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { OeNumberKey } from "../../model/data.types.model";

import { Entity } from "../../model/entity.model";
import { EntityKey } from "../../model/entity.model";
import { getCompanyRequest } from "../../service/overseas.entities.service";
import { OverseasEntityKey, Transactionkey } from "../../model/data.types.model";
import { Session } from "@companieshouse/node-session-handler";
import { createOverseasEntity } from "../../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../../service/transaction.service";
import { CompanyProfile } from "../../api/services/company-profile";
import { yesNoResponse } from "api/services/overseas-entities";

const DEMO_SAVE = false;

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      [OeNumberKey]: appData?.[OeNumberKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);
    const oeNumber = req.body[OeNumberKey];

    // AKDEBUG create submission inside transaction
    // For ROE API disable validation by setting feature flag to false in docker compose file:
    //  - FEATURE_FLAG_ENABLE_VALIDATION_25082022=false

    // AKDEBUG block 0 lookup entity
    logger.info("AKDEBUG lookup " + oeNumber);
    const companyDataResponse = await getCompanyRequest(req, oeNumber);
    if (!companyDataResponse) {
      logger.info("AKDEBUG OE not found " + oeNumber);
      return res.redirect(config.OVERSEAS_ENTITY_QUERY_URL);
    }

    logger.info("AKDEBUG found overseas entity");
    const data: Entity = mapCompanyProfileToEntity(companyDataResponse);

    logger.info("AKDEBUG Entity governed by " + data.law_governed);
    logger.info("AKDEBUG service address 1 " + data.service_address.line_1);
    logger.info("AKDEBUG registered office address 1 " + data.principal_address.line_1);

    if (DEMO_SAVE) {
      // AKDEBUG block 1 open
      const session = req.session as Session;
      setApplicationData(session, data, EntityKey);

      logger.info("AKDEBUG open transaction");

      const appData: ApplicationData = getApplicationData(session);
      const transactionID = await postTransaction(req, session);
      appData[Transactionkey] = transactionID;
      setExtraData(session, appData);

      // AKDEBUG block 2 save doc
      logger.info("AKDEBUG save submission");

      try {
        const overseasEntityID = await createOverseasEntity(req, session, transactionID);
        appData[OverseasEntityKey] = overseasEntityID;
        setExtraData(session, appData);
      } catch (error) {
        appData[OverseasEntityKey] = "";
        logger.info("AKDEBUG save failed");
        logger.errorRequest(req, error);
      }

      // AKDEBUG block 3 close transaction
      logger.info("AKDEBUG close transaction");
      const appData2: ApplicationData = getApplicationData(session);
      const transactionID2 = appData2[Transactionkey] as string;
      const overseasEntityID2 = appData2[OverseasEntityKey] as string;
      const transactionClosedResponse = await closeTransaction(req, session, transactionID2, overseasEntityID2);
      logger.infoRequest(req, `AKDEBUG Transaction Closed, ID: ${transactionID}`);
      logger.info("close status" + transactionClosedResponse.httpStatusCode.toString());
      // AKDBUG end
    }

    setExtraData(req.session, { ...getApplicationData(req.session), [OeNumberKey]: oeNumber });
    return res.redirect(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const mapCompanyProfileToEntity = (data: any): Entity => {
  const cp: CompanyProfile = data as CompanyProfile;
  return {
    name: cp.companyName,
    registration_number: cp.companyNumber,
    law_governed: cp.foreignCompanyDetails?.governedBy,
    legal_form: cp.foreignCompanyDetails?.legalForm,
    incorporation_country: cp.jurisdiction,
    public_register_name: cp.foreignCompanyDetails?.originatingRegistry.name,
    public_register_jurisdiction: cp.foreignCompanyDetails?.originatingRegistry.country,
    email: "",
    principal_address: {
      property_name_number: cp.registeredOfficeAddress?.premises,
      line_1: cp.registeredOfficeAddress?.addressLineOne,
      line_2: cp.registeredOfficeAddress?.addressLineTwo,
      town: cp.registeredOfficeAddress.locality,
      county: cp.registeredOfficeAddress?.region,
      country: cp.registeredOfficeAddress?.country,
      postcode: cp.registeredOfficeAddress?.postalCode
    },
    service_address: {
      property_name_number: cp.serviceAddress?.premises,
      line_1: cp.serviceAddress?.addressLineOne,
      line_2: cp.serviceAddress?.addressLineTwo,
      town: cp.serviceAddress?.locality,
      county: cp.serviceAddress?.region,
      country: cp.serviceAddress?.country,
      postcode: cp.serviceAddress?.postalCode,
    }
    /* ,
    is_service_address_same_as_principal_address: yesNoResponse.No,
    is_on_register_in_country_formed_in: yesNoResponse.No 
    */
  };
};

import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData, setApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { OeNumberKey } from "../../model/data.types.model";

import { Entity } from "../../model/entity.model";
import { EntityKey } from "../../model/entity.model";
import { OverseasEntityKey, Transactionkey } from "../../model/data.types.model";
import { Session } from "@companieshouse/node-session-handler";
import { createOverseasEntity } from "../../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../../service/transaction.service";


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
    const data: Entity = {
      name: 'Test OE ' + oeNumber,
      registration_number: oeNumber
    };

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

    setExtraData(req.session, { ...getApplicationData(req.session), [OeNumberKey]: oeNumber });
    return res.redirect(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

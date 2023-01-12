import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { mapCompanyProfileToOverseasEntity } from "../../utils/update/company.profile.mapper.to.oversea.entity";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../service/company.profile";
import { closeTransaction, postTransaction } from "../../service/transaction.service";
import { OverseasEntityKey, Transactionkey } from "../../model/data.types.model";
import { createOverseasEntity } from "../../service/overseas.entities.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    if (!appData.entity) {
      const id: string | any = appData?.oe_number;
      const companyDataResponse = await getCompanyProfile(req, id) as CompanyProfile;
      if (!companyDataResponse){
        return res.redirect(config.OVERSEAS_ENTITY_QUERY_URL);
      }
      const overseasEntity = mapCompanyProfileToOverseasEntity(companyDataResponse);
      appData.entity = overseasEntity;
      setExtraData(req.session, appData);
    }

    const backLinkUrl: string = config.OVERSEAS_ENTITY_REVIEW_PAGE; // to be changed
    const changeLinkUrl: string = config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL;
    const pageTitle: string = "Overseas entity details (NOT LIVE)";

    return res.render(config.OVERSEAS_ENTITY_REVIEW_PAGE, {
      templateName: config.OVERSEAS_ENTITY_REVIEW_PAGE,
      backLinkUrl,
      changeLinkUrl,
      pageTitle,
      appData
    });
  }  catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);

    logger.info("ENTITYUPDATESAVEDEMO transaction & save update document");

    // AKDEBUG block 1 open
    logger.info("ENTITYUPDATESAVEDEMO open transaction");

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    if (appData.entity && !appData.entity.registration_number) {
      appData.entity.registration_number = appData.oe_number;
    }

    const transactionID = await postTransaction(req, session);
    appData[Transactionkey] = transactionID;
    setExtraData(session, appData);

    // AKDEBUG block 2 save doc
    logger.info("ENTITYUPDATESAVEDEMO save submission **********>>>> " + appData.entity?.registration_number);

    try {
      const overseasEntityID = await createOverseasEntity(req, session, transactionID);
      appData[OverseasEntityKey] = overseasEntityID;
      setExtraData(session, appData);
    } catch (error) {
      appData[OverseasEntityKey] = "";
      logger.error("ENTITYUPDATESAVEDEMO save failed :-(");
      logger.errorRequest(req, error);
    }

    // AKDEBUG block 3 close transaction
    logger.info("ENTITYUPDATESAVEDEMO close transaction");
    const appData2: ApplicationData = getApplicationData(session);
    const transactionID2 = appData2[Transactionkey] as string;
    const overseasEntityID2 = appData2[OverseasEntityKey] as string;
    const transactionClosedResponse = await closeTransaction(req, session, transactionID2, overseasEntityID2);
    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);
    logger.info("ENTITYUPDATESAVEDEMO close status" + transactionClosedResponse.httpStatusCode.toString());
    // AKDBUG end

    return res.redirect("#");
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};


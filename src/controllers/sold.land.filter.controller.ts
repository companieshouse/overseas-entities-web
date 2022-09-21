import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { deleteApplicationData, getApplicationData, setExtraData } from "../utils/application.data";
import { HasSoldLandKey, LANDING_PAGE_QUERY_PARAM } from "../model/data.types.model";
import { createOverseasEntity } from "../service/overseas.entities.service";
import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Session } from "@companieshouse/node-session-handler";
import { getTransactionId, setSubmissionId, setTransactionId } from "../utils/session";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SOLD_LAND_FILTER_PAGE}`);

    if (req.query[LANDING_PAGE_QUERY_PARAM] === '0') {
      setTransactionId(req.session, '');
      setSubmissionId(req.session, '');
      deleteApplicationData(req.session);
    }

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.SOLD_LAND_FILTER_PAGE, {
      backLinkUrl: config.LANDING_PAGE_URL,
      templateName: config.SOLD_LAND_FILTER_PAGE,
      [HasSoldLandKey]: appData?.[HasSoldLandKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SOLD_LAND_FILTER_PAGE}`);
    const hasSoldLand = req.body[HasSoldLandKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [HasSoldLandKey]: hasSoldLand });

    if (hasSoldLand === '1') {
      return res.redirect(config.CANNOT_USE_URL);
    } else if (hasSoldLand === '0') {
      // POC
      // TODO only create if no submission key/id in session?
      const oeSubmissionId = await createNewOverseasEntity(req);
      // add the OE submission key into session
      setSubmissionId(req.session, oeSubmissionId);
      // End of POC
      return res.redirect(config.SECURE_REGISTER_FILTER_URL);
    }

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const createNewOverseasEntity = async (req: Request): Promise<string> => {
  const session = req.session as Session;
  //  get transaction id out of session
  const transactionId: string = getTransactionId(session);
  const overseaEntity: OverseasEntityCreated = await createOverseasEntity(req, session, transactionId as string);
  logger.infoRequest(req, `Overseas Entity Created, ID: ${overseaEntity.id}`);
  return overseaEntity.id;
};

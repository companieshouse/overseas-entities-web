import { NextFunction, Request, Response } from "express";

import {
  setApplicationData,
  getApplicationData,
  mapDataObjectToFields,
  setExtraData
} from "../../utils/application.data";
import { EntityKey } from "../../model/entity.model";
import { ApplicationData, ApplicationDataType } from "../../model";
import {
  AddressKeys,
  EntityNameKey
} from "../../model/data.types.model";
import { logger } from "../../utils/logger";
import { mapRequestToEntityData } from "../../utils/request.to.entity.mapper";
import * as config from "../../config";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../../model/address.model";
import { Session } from "@companieshouse/node-session-handler";
import { saveAndContinue } from "../../utils/save.and.continue";
import { isActiveFeature } from "../../utils/feature.flag";
import { fetchOverseasEntityEmailAddress } from "../../utils/update/fetch.overseas.entity.email";
import { getManagingOfficersPrivateData } from "../../service/private.overseas.entity.details";
import { ManagingOfficerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session = req.session as Session;

    const appData: ApplicationData = getApplicationData(session);

    await fetchOverseasEntityEmailAddress(appData, req, session);


    const overseasEntityId = appData.overseas_entity_id;
    const transactionId = appData.transaction_id;

    let moPrivateData: ManagingOfficerPrivateData[] | undefined = undefined;

    try {
      logger.info("AKDEBUG fetch MO private data");
      if (transactionId && overseasEntityId) {
        moPrivateData = await getManagingOfficersPrivateData(req, transactionId, overseasEntityId);
        logger.info("AKDEBUG fetched MO private data " + JSON.stringify(moPrivateData));
        if (!moPrivateData || moPrivateData.length === 0) {
          logger.info(`No private Managing Officer details were retrieved for overseas entity ${appData.entity_number}`);
        }
      }
    } catch (error) {
      logger.errorRequest(req, `Private Managing Officer details could not be retrieved for overseas entity ${appData.entity_number}`);
    }

    const entity = appData[EntityKey];
    const principalAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys)
      : {};

    const serviceAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[ServiceAddressKey], ServiceAddressKeys, AddressKeys)
      : {};

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
      templateName: config.ENTITY_PAGE,
      entityName: appData?.[EntityNameKey],
      ...entity,
      ...principalAddress,
      ...serviceAddress,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = mapRequestToEntityData(req);
    const session = req.session as Session;
    const entityName = req.body[EntityNameKey];

    setApplicationData(session, data, EntityKey);

    setExtraData(req.session, {
      ...getApplicationData(req.session),
      [EntityNameKey]: entityName
    });

    await saveAndContinue(req, session, false);
    const redirectUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
      ? config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL
      : config.BENEFICIAL_OWNER_STATEMENTS_PAGE;
    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

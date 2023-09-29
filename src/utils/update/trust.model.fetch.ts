import { ApplicationData } from "../../model";
import { getTrustData } from "../../../src/service/trust.data.service";
import { logger } from "../../utils/logger";
import { TrustData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { Request } from "express";
import { Trust } from "../../model/trust.model";
import { mapInputDate } from "./mapper.utils";

export const retrieveTrustData = async (req: Request, appData: ApplicationData) => {
  if (!hasFetchedTrustData(appData)) {
    initialiseTrustUpdateAppData(appData);
    if (appData.update) {
      await retrieveTrusts(req, appData);
      appData.update.trust_data_fetched = true;
    }
  }
};

const hasFetchedTrustData = (appData: ApplicationData) => appData?.update?.trust_data_fetched ?? false;

const initialiseTrustUpdateAppData = (appData: ApplicationData) => {
  if (!appData.update) {
    appData.update = {};
  }
  appData.update.review_trusts = [];
};

const retrieveTrusts = async (req: Request, appData: ApplicationData) => {

  const overseasEntityId = appData.overseas_entity_id;
  const transactionId = appData.transaction_id;

  if (transactionId === undefined || overseasEntityId === undefined) {
    logger.errorRequest(req, "Trust data could not be retrieved as transactionId or overseasEntityId is undefined");
    return;
  }

  const trusts: TrustData[] | undefined = await getTrustData(req, transactionId, overseasEntityId);

  if (trusts === undefined || trusts.length === 0) {
    logger.info(`No trusts found for overseas entity ${overseasEntityId}`);
    return;
  }

  for (const trust of trusts) {
    logger.info("Loaded trust " + trust.trustId);
    mapTrustData(trust, appData);
  }
};

const mapTrustData = (trustData: TrustData, appData: ApplicationData) => {
  const dateOfBirth = mapInputDate(trustData.creationDate);
  const trust: Trust = {
    trust_id: trustData.trustId,
    ch_reference: trustData.trustId,
    trust_name: trustData.trustName,
    creation_date_day: dateOfBirth?.day ?? "",
    creation_date_month: dateOfBirth?.month ?? "",
    creation_date_year: dateOfBirth?.year ?? "",
    unable_to_obtain_all_trust_info: trustData.unableToObtainAllTrustInfo ? "Yes" : "No",
  };
  appData.update?.review_trusts?.push(trust);
};

import { ApplicationData } from "../../model";
import {
  getTrustData,
  getIndividualTrustees,
  getCorporateTrustees,
  getTrustLinks
} from "../../../src/service/trust.data.service";
import { logger } from "../../utils/logger";
import { CorporateTrusteeData, IndividualTrusteeData, TrustData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { Request } from "express";
import { Trust } from "../../model/trust.model";
import { mapInputDate } from "./mapper.utils";

export const retrieveTrustData = async (req: Request, appData: ApplicationData) => {
  if (!hasFetchedTrustData(appData)) {
    initialiseTrustUpdateAppData(appData);
    if (appData.update) {
      await retrieveTrusts(req, appData);
      await retrieveTrustLinks(req, appData);
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

  for (const trustData of trusts) {
    logger.info("Loaded trust " + trustData.trustId);

    const trust = mapTrustData(trustData, appData);

    fetchAndMapIndivdualTrustees(req, transactionId, overseasEntityId, trust);

    fetchAndMapCorporateTrustees(req, transactionId, overseasEntityId, trust);
  }
};

export const mapTrustData = (trustData: TrustData, appData: ApplicationData) => {
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
  return trust;
};

const fetchAndMapIndivdualTrustees = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string,
  trust: Trust
) => {
  const individualTrustees = await getIndividualTrustees(req, transactionId, overseasEntityId, trust.trust_id);

  if (individualTrustees === undefined || individualTrustees.length === 0) {
    logger.info(`No individual trustees found for overseas entity ${overseasEntityId} and trust ${trust.trust_id}`);
    return;
  }

  for (const trustee of individualTrustees) {
    logger.info("Loaded individual trustee " + trustee.trusteeId);
    mapIndividualTrusteeData(trustee, trust);
  }
};

const mapIndividualTrusteeData = (trustee: IndividualTrusteeData, trust: Trust) => {
  logger.debug("Mapping individual trustee " + trustee.trusteeId + " for trust " + trust.trust_id);
  // TODO: map individual trustee data
};

const fetchAndMapCorporateTrustees = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string,
  trust: Trust
) => {
  const corporateTrustees = await getCorporateTrustees(req, transactionId, overseasEntityId, trust.trust_id);

  if (corporateTrustees === undefined || corporateTrustees.length === 0) {
    logger.info(`No corporate trustees found for overseas entity ${overseasEntityId} and trust ${trust.trust_id}`);
    return;
  }

  for (const trustee of corporateTrustees) {
    logger.info("Loaded corporate trustee " + trustee.trusteeId);
    mapCorporateTrusteeData(trustee, trust);
  }
};

const mapCorporateTrusteeData = (trustee: CorporateTrusteeData, trust: Trust) => {
  logger.debug("Mapping corporate trustee " + trustee.trusteeId + " for trust " + trust.trust_id);
  // TODO: map corporate trustee data
};

export const retrieveTrustLinks = async (req: Request, appData: ApplicationData) => {
  const overseasEntityId = appData.overseas_entity_id;
  const transactionId = appData.transaction_id;

  if (transactionId === undefined || overseasEntityId === undefined) {
    logger.errorRequest(req, "Trust links could not be retrieved as transactionId or overseasEntityId is undefined");
    return;
  }

  const trustLinks = await getTrustLinks(req, transactionId, overseasEntityId);

  if (trustLinks === undefined || trustLinks.length === 0) {
    logger.info(`No trust links found for overseas entity ${overseasEntityId}`);
    return;
  }

  for (const trustLink of trustLinks) {
    logger.info("Loaded trust link " + trustLink.trustId + " for coprporate appointment " + trustLink.corporateBodyAppointmentId);
    // TODO: map trust link data
  }
};

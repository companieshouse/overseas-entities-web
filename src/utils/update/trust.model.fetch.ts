import { ApplicationData } from "../../model";
import {
  getTrustData,
  getIndividualTrustees,
  getCorporateTrustees,
  getTrustLinks
} from "../../../src/service/trust.data.service";
import { logger } from "../../utils/logger";
import { CorporateTrusteeData, IndividualTrusteeData, TrustData, TrustLinkData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { Request } from "express";
import { Trust, TrustCorporate, TrustHistoricalBeneficialOwner, TrustIndividual } from "../../model/trust.model";
import { mapInputDate, splitNationalities } from "./mapper.utils";
import { RoleWithinTrustType } from "../../model/role.within.trust.type.model";
import { yesNoResponse } from "../../model/data.types.model";

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
    logger.debug("Loaded trust " + trustData.trustId);

    const trust = mapTrustData(trustData, appData);

    fetchAndMapIndivdualTrustees(req, transactionId, overseasEntityId, trust);

    fetchAndMapCorporateTrustees(req, transactionId, overseasEntityId, trust);
  }
};

export const mapTrustData = (trustData: TrustData, appData: ApplicationData) => {
  const dateOfBirth = mapInputDate(trustData.creationDate);
  const trust: Trust = {
    trust_id: (((appData.update?.review_trusts ?? []).length) + 1).toString(),
    ch_reference: trustData.trustId,
    trust_name: trustData.trustName,
    creation_date_day: dateOfBirth?.day ?? "",
    creation_date_month: dateOfBirth?.month ?? "",
    creation_date_year: dateOfBirth?.year ?? "",
    unable_to_obtain_all_trust_info: trustData.unableToObtainAllTrustInfo ? "Yes" : "No",
    INDIVIDUALS: [],
    CORPORATES: [],
    HISTORICAL_BO: []
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
    logger.debug("Loaded individual trustee " + trustee.trusteeId);
    mapIndividualTrusteeData(trustee, trust);
  }
};

const mapIndividualTrusteeData = (trustee: IndividualTrusteeData, trust: Trust) => {
  if (trustee.ceasedDate !== undefined) {
    mapHistoricalIndividualTrusteeData(trustee, trust);
    return;
  }
  const dateOfBirth = mapInputDate(trustee.dateOfBirth);
  const nationalities = splitNationalities(trustee.nationality);

  const individualTrustee: TrustIndividual = {
    id: ((trust.INDIVIDUALS ?? []).length + 1).toString(),
    ch_references: trustee.trusteeId,
    forename: trustee.trusteeForename1 ?? "",
    other_forenames: trustee.trusteeForename2 ?? "",
    surname: trustee.trusteeSurname,
    dob_day: dateOfBirth?.day ?? "",
    dob_month: dateOfBirth?.month ?? "",
    dob_year: dateOfBirth?.year ?? "",
    nationality: nationalities[0],
    second_nationality: nationalities.length > 1 ? nationalities[1] : undefined,
    type: mapTrusteeType(trustee.trusteeTypeId),

    ura_address_premises: "",
    ura_address_line_1: "",
    ura_address_locality: "",
    ura_address_country: "",
    ura_address_postal_code: ""
  };

  mapUsualResidentialAddress(individualTrustee, trustee);
  mapServiceAddress(individualTrustee, trustee);

  trust.INDIVIDUALS?.push(individualTrustee);
};

const mapHistoricalIndividualTrusteeData = (trustee: IndividualTrusteeData, trust: Trust) => {
  const ceasedDate = mapInputDate(trustee.ceasedDate);
  const dateOfBirth = mapInputDate(trustee.dateOfBirth);

  const historicalIndividualTrustee: TrustHistoricalBeneficialOwner = {
    id: ((trust.HISTORICAL_BO ?? []).length + 1).toString(),
    ch_references: trustee.trusteeId,
    forename: trustee.trusteeForename1,
    other_forenames: trustee.trusteeForename2 ?? "",
    surname: trustee.trusteeSurname,
    ceased_date_day: ceasedDate?.day ?? "",
    ceased_date_month: ceasedDate?.month ?? "",
    ceased_date_year: ceasedDate?.year ?? "",
    notified_date_day: dateOfBirth?.day ?? "",
    notified_date_month: dateOfBirth?.month ?? "",
    notified_date_year: dateOfBirth?.year ?? "",
    corporate_indicator: yesNoResponse.No
  };
  trust.HISTORICAL_BO?.push(historicalIndividualTrustee);
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
    logger.debug("Loaded corporate trustee " + trustee.trusteeId);
    mapCorporateTrusteeData(trustee, trust);
  }
};

const mapCorporateTrusteeData = (trustee: CorporateTrusteeData, trust: Trust) => {
  if (trustee.ceasedDate !== undefined) {
    mapHistoricalCorporateTrusteeData(trustee, trust);
    return;
  }
  const appointmentDate = mapInputDate(trustee.appointmentDate);

  const corporateTrustee: TrustCorporate = {
    id: ((trust.CORPORATES ?? []).length + 1).toString(),
    ch_references: trustee.trusteeId,
    type: mapTrusteeType(trustee.trusteeTypeId),
    name: trustee.trusteeName,
    date_became_interested_person_day: appointmentDate?.day ?? "",
    date_became_interested_person_month: appointmentDate?.month ?? "",
    date_became_interested_person_year: appointmentDate?.year ?? "",
    is_on_register_in_country_formed_in: trustee.onRegisterInCountryFormed ? yesNoResponse.Yes : yesNoResponse.No,
    identification_legal_authority: trustee.lawGoverned ?? "",
    identification_legal_form: trustee.legalForm ?? "",
    identification_place_registered: trustee.registerLocation ?? "",
    identification_registration_number: trustee.registrationNumber ?? "",
    identification_country_registration: trustee.country ?? "",

    ro_address_premises: "",
    ro_address_line_1: "",
    ro_address_locality: "",
    ro_address_region: "",
    ro_address_country: "",
    ro_address_postal_code: "",

    is_service_address_same_as_principal_address: yesNoResponse.No
  };

  mapResidentialAddress(corporateTrustee, trustee);
  mapServiceAddress(corporateTrustee, trustee);

  trust.CORPORATES?.push(corporateTrustee);
};

const mapHistoricalCorporateTrusteeData = (trustee: CorporateTrusteeData, trust: Trust) => {
  const ceasedDate = mapInputDate(trustee.ceasedDate);
  const appointmentDate = mapInputDate(trustee.appointmentDate);

  const historicalCorporateTrustee: TrustHistoricalBeneficialOwner = {
    id: ((trust.HISTORICAL_BO ?? []).length + 1).toString(),
    ch_references: trustee.trusteeId,
    corporate_name: trustee.trusteeName,
    ceased_date_day: ceasedDate?.day ?? "",
    ceased_date_month: ceasedDate?.month ?? "",
    ceased_date_year: ceasedDate?.year ?? "",
    notified_date_day: appointmentDate?.day ?? "",
    notified_date_month: appointmentDate?.month ?? "",
    notified_date_year: appointmentDate?.year ?? "",
    corporate_indicator: yesNoResponse.Yes
  };
  trust.HISTORICAL_BO?.push(historicalCorporateTrustee);
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
    logger.debug("Loaded trust link " + trustLink.trustId + " for coprporate appointment " + trustLink.corporateBodyAppointmentId);
    mapTrustLink(trustLink, appData);
  }
};

const mapTrustLink = (trustLink: TrustLinkData, appData: ApplicationData) => {
  const trust = appData.update?.review_trusts?.find((trust) => trust.ch_reference === trustLink.trustId);
  if (trust) {
    const individualBeneficialOwner = appData.beneficial_owners_individual?.find((beneficialOwner) => beneficialOwner.ch_reference === trustLink.corporateBodyAppointmentId);
    if (individualBeneficialOwner) {
      logger.debug("Linking individual beneficial owner " + individualBeneficialOwner.ch_reference + " to trust " + trust.ch_reference);
      if (individualBeneficialOwner.trust_ids === undefined) {
        individualBeneficialOwner.trust_ids = [];
      }
      individualBeneficialOwner.trust_ids.push(trust.trust_id);
    }
  }
};

const mapTrusteeType = (trusteeTypeId: string): RoleWithinTrustType => {
  switch (trusteeTypeId) {
      case "5005":
        return RoleWithinTrustType.INTERESTED_PERSON;
      case "5004":
        return RoleWithinTrustType.GRANTOR;
      case "5003":
        return RoleWithinTrustType.SETTLOR;
      case "5002":
      default:
        return RoleWithinTrustType.BENEFICIARY;
  }
};

const mapResidentialAddress = (trustee: TrustCorporate, trusteeData: CorporateTrusteeData) => {
  trustee.ro_address_premises = trusteeData.registeredOfficeAddress?.premises ?? "";
  trustee.ro_address_line_1 = trusteeData.registeredOfficeAddress?.addressLine1 ?? "";
  trustee.ro_address_line_2 = trusteeData.registeredOfficeAddress?.addressLine2;
  trustee.ro_address_locality = trusteeData.registeredOfficeAddress?.locality ?? "";
  trustee.ro_address_region = trusteeData.registeredOfficeAddress?.region ?? "";
  trustee.ro_address_country = trusteeData.registeredOfficeAddress?.country ?? "";
  trustee.ro_address_postal_code = trusteeData.registeredOfficeAddress?.postalCode ?? "";
  trustee.ro_address_care_of = trusteeData.registeredOfficeAddress?.careOf;
  trustee.ro_address_po_box = trusteeData.registeredOfficeAddress?.poBox;
};

const mapServiceAddress = (trustee: TrustIndividual | TrustCorporate, trusteeData: IndividualTrusteeData | CorporateTrusteeData) => {
  trustee.sa_address_premises = trusteeData.serviceAddress?.premises ?? "";
  trustee.sa_address_line_1 = trusteeData.serviceAddress?.addressLine1 ?? "";
  trustee.sa_address_line_2 = trusteeData.serviceAddress?.addressLine2;
  trustee.sa_address_locality = trusteeData.serviceAddress?.locality ?? "";
  trustee.sa_address_locality = trusteeData.serviceAddress?.locality ?? "";
  trustee.sa_address_locality = trusteeData.serviceAddress?.locality ?? "";
  trustee.sa_address_region = trusteeData.serviceAddress?.region ?? "";
  trustee.sa_address_country = trusteeData.serviceAddress?.country ?? "";
  trustee.sa_address_postal_code = trusteeData.serviceAddress?.postalCode ?? "";
  trustee.sa_address_care_of = trusteeData.serviceAddress?.careOf ?? "";
  trustee.sa_address_po_box = trusteeData.serviceAddress?.poBox ?? "";
};

const mapUsualResidentialAddress = (trustee: TrustIndividual, trusteeData: IndividualTrusteeData) => {
  trustee.ura_address_premises = trusteeData.usualResidentialAddress?.premises ?? "";
  trustee.ura_address_line_1 = trusteeData.usualResidentialAddress?.addressLine1 ?? "";
  trustee.ura_address_line_2 = trusteeData.usualResidentialAddress?.addressLine2;
  trustee.ura_address_locality = trusteeData.usualResidentialAddress?.locality ?? "";
  trustee.ura_address_locality = trusteeData.usualResidentialAddress?.locality ?? "";
  trustee.ura_address_locality = trusteeData.usualResidentialAddress?.locality ?? "";
  trustee.ura_address_region = trusteeData.usualResidentialAddress?.region;
  trustee.ura_address_country = trusteeData.usualResidentialAddress?.country ?? "";
  trustee.ura_address_postal_code = trusteeData.usualResidentialAddress?.postalCode ?? "";
  trustee.ura_address_care_of = trusteeData.usualResidentialAddress?.careOf;
  trustee.ura_address_po_box = trusteeData.usualResidentialAddress?.poBox;
};

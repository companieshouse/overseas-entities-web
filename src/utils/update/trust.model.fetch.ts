import { ApplicationData } from "../../model";
import {
  getTrustData,
  getIndividualTrustees,
  getCorporateTrustees,
  getTrustLinks
} from "../../service/trust.data.service";
import { logger } from "../../utils/logger";
import { CorporateTrusteeData, IndividualTrusteeData, TrustData, TrustLinkData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { Request } from "express";
import { Trust, TrustCorporate, TrustHistoricalBeneficialOwner, TrustIndividual, InterestedIndividualPersonTrustee } from "../../model/trust.model";
import { lowerCaseAllWordsExceptFirstLetters, mapInputDate, splitNationalities } from "./mapper.utils";
import { RoleWithinTrustType } from "../../model/role.within.trust.type.model";
import { yesNoResponse } from "../../model/data.types.model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "../../model/beneficial.owner.other.model";

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

const hasFetchedTrustData = (appData: ApplicationData) => appData.update?.trust_data_fetched ?? false;

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
    if (trustData.ceasedDate !== undefined && trustData.ceasedDate !== "") {
      logger.debug("Skipping ceased trust " + trustData.hashedTrustId);
      continue;
    }

    logger.debug("Loaded trust " + trustData.hashedTrustId);

    const trust = mapTrustData(trustData, appData);

    if (trust.ch_reference !== undefined && trust.ch_reference !== "") {
      await fetchAndMapIndivdualTrustees(req, transactionId, overseasEntityId, trust);
      await fetchAndMapCorporateTrustees(req, transactionId, overseasEntityId, trust);
    }
  }
};

export const mapTrustData = (trustData: TrustData, appData: ApplicationData) => {
  const dateOfBirth = mapInputDate(trustData.creationDate);

  let stillInvolved = trustData.trustStillInvolvedInOverseasEntityIndicator === "1" ? "Yes" : "No";

  // If 'trustStillInvolvedInOverseasEntityIndicator' isn't set (could be null or undefined), need to set an empty string
  if (trustData.trustStillInvolvedInOverseasEntityIndicator === null || trustData.trustStillInvolvedInOverseasEntityIndicator === undefined) {
    stillInvolved = "";
  }

  const trust: Trust = {
    trust_id: (((appData.update?.review_trusts ?? []).length) + 1).toString(),
    ch_reference: trustData.hashedTrustId,
    trust_name: trustData.trustName,
    creation_date_day: dateOfBirth?.day ?? "",
    creation_date_month: dateOfBirth?.month ?? "",
    creation_date_year: dateOfBirth?.year ?? "",
    trust_still_involved_in_overseas_entity: stillInvolved,
    unable_to_obtain_all_trust_info: trustData.unableToObtainAllTrustInfoIndicator ? "Yes" : "No",
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
  const individualTrustees = await getIndividualTrustees(req, transactionId, overseasEntityId, trust.ch_reference ?? "");

  if (individualTrustees === undefined || individualTrustees.length === 0) {
    logger.info(`No individual trustees found for overseas entity ${overseasEntityId} and trust ${trust.ch_reference ?? trust.trust_id}`);
    return;
  }

  for (const trustee of individualTrustees) {
    logger.debug("Loaded individual trustee " + trustee.hashedTrusteeId);
    mapIndividualTrusteeData(trustee, trust);
  }
};

export const mapIndividualTrusteeData = (trustee: IndividualTrusteeData, trust: Trust) => {
  const trusteeRoleType = mapTrusteeType(trustee.trusteeTypeId);
  if (trusteeRoleType === RoleWithinTrustType.HISTORICAL_BENEFICIAL_OWNER) {
    mapHistoricalIndividualTrusteeData(trustee, trust);
    return;
  }

  // This needs to be done after checking (and mapping) an historical individual trustee, as they will have ceased dates. It's
  // enough to simply check for the presence of a ceased date, since future dates cannot be entered in this field
  if (trustee.ceasedDate) {
    return;
  }

  const dateOfBirth = mapInputDate(trustee.dateOfBirth);
  const nationalities = splitNationalities(trustee.nationality);

  const individualTrustee: TrustIndividual = {
    id: ((trust.INDIVIDUALS ?? []).length + 1).toString(),
    ch_references: trustee.hashedTrusteeId,
    forename: trustee.trusteeForename1,
    other_forenames: trustee.trusteeForename2 ?? "",
    surname: trustee.trusteeSurname,
    dob_day: dateOfBirth?.day ?? "",
    dob_month: dateOfBirth?.month ?? "",
    dob_year: dateOfBirth?.year ?? "",
    nationality: lowerCaseAllWordsExceptFirstLetters(nationalities[0]),
    second_nationality: nationalities.length > 1 ? lowerCaseAllWordsExceptFirstLetters(nationalities[1]) : undefined,
    type: trusteeRoleType,

    ura_address_premises: "",
    ura_address_line_1: "",
    ura_address_locality: "",
    ura_address_country: "",
    ura_address_postal_code: "",

    is_service_address_same_as_usual_residential_address: yesNoResponse.No
  };

  mapUsualResidentialAddress(individualTrustee, trustee);
  mapServiceAddress(individualTrustee, trustee);
  individualTrustee.is_service_address_same_as_usual_residential_address = trustee.serviceAddress?.isServiceAddressSameAsUsualResidentialAddress ? yesNoResponse.Yes : yesNoResponse.No;

  if (individualTrustee.type === RoleWithinTrustType.INTERESTED_PERSON) {
    const appointmentDate = mapInputDate(trustee.appointmentDate);
    const InterestedPersonTrustee: InterestedIndividualPersonTrustee = {
      ...individualTrustee,
      type: RoleWithinTrustType.INTERESTED_PERSON,
      date_became_interested_person_day: appointmentDate?.day ?? "",
      date_became_interested_person_month: appointmentDate?.month ?? "",
      date_became_interested_person_year: appointmentDate?.year ?? "",
    };
    trust.INDIVIDUALS?.push(InterestedPersonTrustee);
  } else {
    trust.INDIVIDUALS?.push(individualTrustee);
  }
};

const mapHistoricalIndividualTrusteeData = (trustee: IndividualTrusteeData, trust: Trust) => {
  const ceasedDate = mapInputDate(trustee.ceasedDate);
  const appointmentDate = mapInputDate(trustee.appointmentDate);

  const historicalIndividualTrustee: TrustHistoricalBeneficialOwner = {
    id: ((trust.HISTORICAL_BO ?? []).length + 1).toString(),
    ch_references: trustee.hashedTrusteeId,
    forename: trustee.trusteeForename1,
    other_forenames: trustee.trusteeForename2 ?? "",
    surname: trustee.trusteeSurname,
    ceased_date_day: ceasedDate?.day ?? "",
    ceased_date_month: ceasedDate?.month ?? "",
    ceased_date_year: ceasedDate?.year ?? "",
    notified_date_day: appointmentDate?.day ?? "",
    notified_date_month: appointmentDate?.month ?? "",
    notified_date_year: appointmentDate?.year ?? "",
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
  const corporateTrustees = await getCorporateTrustees(req, transactionId, overseasEntityId, trust.ch_reference ?? "");

  if (corporateTrustees === undefined || corporateTrustees.length === 0) {
    logger.info(`No corporate trustees found for overseas entity ${overseasEntityId} and trust ${trust.ch_reference ?? trust.trust_id}`);
    return;
  }

  for (const trustee of corporateTrustees) {
    logger.debug("Loaded corporate trustee " + trustee.hashedTrusteeId);
    mapCorporateTrusteeData(trustee, trust);
  }
};

export const mapCorporateTrusteeData = (trustee: CorporateTrusteeData, trust: Trust) => {
  const trusteeRoleType = mapTrusteeType(trustee.trusteeTypeId);
  if (trusteeRoleType === RoleWithinTrustType.HISTORICAL_BENEFICIAL_OWNER) {
    mapHistoricalCorporateTrusteeData(trustee, trust);
    return;
  }

  // This needs to be done after checking (and mapping) an historical corporate trustee, as they will have ceased dates. It's
  // enough to simply check for the presence of a ceased date, since future dates cannot be entered in this field
  if (trustee.ceasedDate) {
    return;
  }

  const appointmentDate = mapInputDate(trustee.appointmentDate);

  const corporateTrustee: TrustCorporate = {
    id: ((trust.CORPORATES ?? []).length + 1).toString(),
    ch_references: trustee.hashedTrusteeId,
    type: trusteeRoleType,
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

  mapRegisteredOfficeAddress(corporateTrustee, trustee);
  mapServiceAddress(corporateTrustee, trustee);
  corporateTrustee.is_service_address_same_as_principal_address = trustee.serviceAddress?.isServiceAddressSameAsPrincipalAddress ? yesNoResponse.Yes : yesNoResponse.No;

  trust.CORPORATES?.push(corporateTrustee);
};

const mapHistoricalCorporateTrusteeData = (trustee: CorporateTrusteeData, trust: Trust) => {
  const ceasedDate = mapInputDate(trustee.ceasedDate);
  const appointmentDate = mapInputDate(trustee.appointmentDate);

  const historicalCorporateTrustee: TrustHistoricalBeneficialOwner = {
    id: ((trust.HISTORICAL_BO ?? []).length + 1).toString(),
    ch_references: trustee.hashedTrusteeId,
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
    logger.debug("Loaded trust link " + trustLink.hashedTrustId + " for coprporate appointment " + trustLink.hashedCorporateBodyAppointmentId);
    mapTrustLink(trustLink, appData);
  }
};

export const mapTrustLink = (trustLink: TrustLinkData, appData: ApplicationData) => {
  const trust = appData.update?.review_trusts?.find(t => t.ch_reference === trustLink.hashedTrustId);
  if (trust) {
    const individualBeneficialOwner = appData.beneficial_owners_individual?.find((beneficialOwner) => beneficialOwner.ch_reference === trustLink.hashedCorporateBodyAppointmentId);
    if (individualBeneficialOwner) {
      linkBoToTrust(individualBeneficialOwner, trust, 'individual beneficial owner');
      return;
    }

    const reviewIndividualBeneficialOwner = appData.update?.review_beneficial_owners_individual?.find((beneficialOwner) => beneficialOwner.ch_reference === trustLink.hashedCorporateBodyAppointmentId);
    if (reviewIndividualBeneficialOwner) {
      linkBoToTrust(reviewIndividualBeneficialOwner, trust, 'individual beneficial owner');
      return;
    }

    const corporateBeneficialOwner = appData.beneficial_owners_corporate?.find((beneficialOwner) => beneficialOwner.ch_reference === trustLink.hashedCorporateBodyAppointmentId);
    if (corporateBeneficialOwner) {
      linkBoToTrust(corporateBeneficialOwner, trust, 'corporate beneficial owner');
      return;
    }

    const reviewCorporateBeneficialOwner = appData.update?.review_beneficial_owners_corporate?.find((beneficialOwner) => beneficialOwner.ch_reference === trustLink.hashedCorporateBodyAppointmentId);
    if (reviewCorporateBeneficialOwner) {
      linkBoToTrust(reviewCorporateBeneficialOwner, trust, 'corporate beneficial owner');
      return;
    }
  }
};

const linkBoToTrust = (beneficialOwner: BeneficialOwnerIndividual | BeneficialOwnerOther, trust: Trust, boType: string) => {
  logger.debug(`Linking ${boType} ${beneficialOwner.ch_reference} to trust ${trust.ch_reference}`);
  if (!beneficialOwner.trust_ids) {
    beneficialOwner.trust_ids = [];
  }
  beneficialOwner.trust_ids.push(trust.trust_id);
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
        return RoleWithinTrustType.BENEFICIARY;
      case "5001":
        return RoleWithinTrustType.HISTORICAL_BENEFICIAL_OWNER;
      default:
        throw new Error(`Trustee Type ${trusteeTypeId} not recognised`);
  }
};

const mapRegisteredOfficeAddress = (trustee: TrustCorporate, trusteeData: CorporateTrusteeData) => {
  trustee.ro_address_premises = trusteeData.registeredOfficeAddress?.premises ?? "";
  trustee.ro_address_line_1 = trusteeData.registeredOfficeAddress?.addressLine1 ?? "";
  trustee.ro_address_line_2 = trusteeData.registeredOfficeAddress?.addressLine2 ?? "";
  trustee.ro_address_locality = trusteeData.registeredOfficeAddress?.locality ?? "";
  trustee.ro_address_region = trusteeData.registeredOfficeAddress?.region ?? "";
  trustee.ro_address_country = lowerCaseAllWordsExceptFirstLetters(trusteeData.registeredOfficeAddress?.country ?? "");
  trustee.ro_address_postal_code = trusteeData.registeredOfficeAddress?.postalCode ?? "";
  trustee.ro_address_care_of = trusteeData.registeredOfficeAddress?.careOf ?? "";
  trustee.ro_address_po_box = trusteeData.registeredOfficeAddress?.poBox || "";
};

const mapServiceAddress = (trustee: TrustIndividual | TrustCorporate, trusteeData: IndividualTrusteeData | CorporateTrusteeData) => {
  trustee.sa_address_premises = trusteeData.serviceAddress?.premises ?? "";
  trustee.sa_address_line_1 = trusteeData.serviceAddress?.addressLine1 ?? "";
  trustee.sa_address_line_2 = trusteeData.serviceAddress?.addressLine2 ?? "";
  trustee.sa_address_locality = trusteeData.serviceAddress?.locality ?? "";
  trustee.sa_address_locality = trusteeData.serviceAddress?.locality ?? "";
  trustee.sa_address_locality = trusteeData.serviceAddress?.locality ?? "";
  trustee.sa_address_region = trusteeData.serviceAddress?.region ?? "";
  trustee.sa_address_country = lowerCaseAllWordsExceptFirstLetters(trusteeData.serviceAddress?.country ?? "");
  trustee.sa_address_postal_code = trusteeData.serviceAddress?.postalCode ?? "";
  trustee.sa_address_care_of = trusteeData.serviceAddress?.careOf ?? "";
  trustee.sa_address_po_box = trusteeData.serviceAddress?.poBox ?? "";
};

const mapUsualResidentialAddress = (trustee: TrustIndividual, trusteeData: IndividualTrusteeData) => {
  trustee.ura_address_premises = trusteeData.usualResidentialAddress?.premises ?? "";
  trustee.ura_address_line_1 = trusteeData.usualResidentialAddress?.addressLine1 ?? "";
  trustee.ura_address_line_2 = trusteeData.usualResidentialAddress?.addressLine2 ?? "";
  trustee.ura_address_locality = trusteeData.usualResidentialAddress?.locality ?? "";
  trustee.ura_address_locality = trusteeData.usualResidentialAddress?.locality ?? "";
  trustee.ura_address_locality = trusteeData.usualResidentialAddress?.locality ?? "";
  trustee.ura_address_region = trusteeData.usualResidentialAddress?.region ?? "";
  trustee.ura_address_country = lowerCaseAllWordsExceptFirstLetters(trusteeData.usualResidentialAddress?.country ?? "");
  trustee.ura_address_postal_code = trusteeData.usualResidentialAddress?.postalCode ?? "";
  trustee.ura_address_care_of = trusteeData.usualResidentialAddress?.careOf ?? "";
  trustee.ura_address_po_box = trusteeData.usualResidentialAddress?.poBox ?? "";
};

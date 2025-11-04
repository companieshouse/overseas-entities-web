import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { BeneficialOwnerGov } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "../../model/beneficial.owner.other.model";
import { NatureOfControlJurisdiction, NatureOfControlType, yesNoResponse } from "../../model/data.types.model";
import { mapBOMOAddress, isSameAddress, mapDateOfBirth, mapSelfLink, mapInputDate, splitNationalities, mapBOIndividualName, lowerCaseAllWordsExceptFirstLetters } from "./mapper.utils";
import { logger } from "../../utils/logger";
import { BeneficialOwnerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";

type BeneficialOwnerType = BeneficialOwnerIndividual | BeneficialOwnerOther | BeneficialOwnerGov;

export const mapPscToBeneficialOwnerTypeIndividual = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerIndividual => {
  const service_address = mapBOMOAddress(psc.address);
  const nationalities = splitNationalities(psc.nationality);
  const result: BeneficialOwnerIndividual = {
    id: psc.links?.self,
    ch_reference: mapSelfLink(psc.links?.self),
    first_name: mapBOIndividualName(psc.nameElements),
    last_name: psc.nameElements?.surname,
    nationality: lowerCaseAllWordsExceptFirstLetters(nationalities[0]),
    second_nationality: nationalities.length > 1 ? lowerCaseAllWordsExceptFirstLetters(nationalities[1]) : undefined,
    date_of_birth: mapDateOfBirth(psc.dateOfBirth),
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address, undefined) ? yesNoResponse.Yes : yesNoResponse.No,
    usual_residential_address: undefined,
    service_address: service_address,
    start_date: mapInputDate(psc.notifiedOn),
    is_on_sanctions_list: psc.isSanctioned === true ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, false);
  return result;
};

export const mapPscToBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerOther => {
  const service_address = mapBOMOAddress(psc.address);
  const principal_address = mapBOMOAddress(undefined);

  const result: BeneficialOwnerOther = {
    id: psc.links?.self,
    ch_reference: mapSelfLink(psc.links?.self),
    name: psc.name,
    principal_address: principal_address,
    service_address: service_address,
    is_service_address_same_as_principal_address: undefined,
    legal_form: psc.identification?.legalForm,
    law_governed: psc.identification?.legalAuthority,
    public_register_name: psc.identification?.placeRegistered,
    registration_number: psc.identification?.registrationNumber,
    is_on_register_in_country_formed_in: psc.identification !== undefined && psc.identification?.registrationNumber ? yesNoResponse.Yes : yesNoResponse.No,
    start_date: mapInputDate(psc.notifiedOn),
    is_on_sanctions_list: psc.isSanctioned === true ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, false);
  return result;
};

export const mapPscToBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerGov => {
  const service_address = mapBOMOAddress(psc.address);
  const principal_address = mapBOMOAddress(undefined);

  const result: BeneficialOwnerGov = {
    id: psc.links?.self,
    ch_reference: mapSelfLink(psc.links?.self),
    name: psc.name,
    principal_address: principal_address,
    service_address: service_address,
    is_service_address_same_as_principal_address: undefined,
    legal_form: psc.identification?.legalForm,
    law_governed: psc.identification?.legalAuthority,
    start_date: mapInputDate(psc.notifiedOn),
    is_on_sanctions_list: psc.isSanctioned === true ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, true);
  return result;
};

const mapNatureOfControl = (psc: CompanyPersonWithSignificantControl, beneficialOwner: BeneficialOwnerType, isBeneficialGov: boolean) => {
  beneficialOwner.beneficial_owner_nature_of_control_types = [];
  beneficialOwner.non_legal_firm_members_nature_of_control_types = [];
  if (!isBeneficialGov) {
    beneficialOwner['trustees_nature_of_control_types'] = [];
  }
  beneficialOwner.non_legal_firm_control_nature_of_control_types = [];
  beneficialOwner.trust_control_nature_of_control_types = [];
  beneficialOwner.owner_of_land_person_nature_of_control_jurisdictions = [];
  beneficialOwner.owner_of_land_other_entity_nature_of_control_jurisdictions = [];

  psc.naturesOfControl?.forEach(natureType => {
    const natureKind = natureTypeMap.get(natureType);
    if (!natureKind) {
      return;
    }

    // get value from natureOfControlTypeMap or if that is null then get value from natureOfControlJurisdictionMap
    const natureOfControlTypeOrJurisdiction: NatureOfControlType | NatureOfControlJurisdiction | undefined =
      natureOfControlTypeMap.get(natureType) ?? natureOfControlJurisdictionMap.get(natureType);

    if (natureOfControlTypeOrJurisdiction) {
      addNatureOfControlToBeneficialOwner(natureKind, beneficialOwner, natureOfControlTypeOrJurisdiction, isBeneficialGov);
    }
  });
};

const addNatureOfControlToBeneficialOwner = (natureKind: BoTypes, beneficialOwner: BeneficialOwnerType, natureOfControlToAdd: NatureOfControlType | NatureOfControlJurisdiction, isBeneficialGov: boolean) => {
  if (isBeneficialGov && natureKind === BoTypes.TRUST_NATURE_OF_CONTROL) {
    return;
  }
  const boFieldName = natureOfControlKindToBOFieldMap.get(natureKind);

  if (!boFieldName) {
    logger.error("Unexpected nature of control for BO: " + natureKind);
    return;
  }

  beneficialOwner[boFieldName]?.push(natureOfControlToAdd);
};

enum BoTypes {
  BO_NATURE_OF_CONTROL = "BoNatureOfControl",
  TRUST_NATURE_OF_CONTROL = "TrustNatureOfControl",
  NON_LEGAL_NATURE_OF_CONTROL = "NonLegalNatureOfControl",
  CONTROL_OVER_TRUST_NATURE_OF_CONTROL = "ControlOverTrustNatureOfControl",
  CONTROL_OVER_FIRM_NATURE_OF_CONTROL = "ControlOverFirmNatureOfControl",
  REGISTERED_OWNER_AS_NOMINEE_PERSON_NATURE_OF_CONTROL = "RegisteredOwnerAsNomineePersonNatureOfControl",
  REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NATURE_OF_CONTROL = "RegisteredOwnerAsNomineeOtherEntityNatureOfControl",
}

export enum natureOfControl {
  OWNERSHIP_MORE_THAN_25_PERCENT_SHARE_ENTITY = 'ownership-of-shares-more-than-25-percent-registered-overseas-entity',
  VOTING_RIGHT_MORE_THAN_25_PERCENT_SHARE_ENTITY = 'voting-rights-more-than-25-percent-registered-overseas-entity',
  RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS = 'right-to-appoint-and-remove-directors-registered-overseas-entity',
  SIGNIFICANT_INFLUENCE_OR_CONTROL_ENTITY = 'significant-influence-or-control-registered-overseas-entity',

  RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_TRUST = 'right-to-appoint-and-remove-directors-as-trust-registered-overseas-entity',
  SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_TRUST = 'significant-influence-or-control-as-trust-registered-overseas-entity',
  VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_TRUST ='voting-rights-more-than-25-percent-as-trust-registered-overseas-entity',
  OWNERSHIP_MORE_THAN_25_PERCENT_AS_TRUST = 'ownership-of-shares-more-than-25-percent-as-trust-registered-overseas-entity',

  SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_FIRM = 'significant-influence-or-control-as-firm-registered-overseas-entity',
  RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_FIRM = 'right-to-appoint-and-remove-directors-as-firm-registered-overseas-entity',
  VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_FIRM = 'voting-rights-more-than-25-percent-as-firm-registered-overseas-entity',
  OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM = 'ownership-of-shares-more-than-25-percent-as-firm-registered-overseas-entity',

  OWNERSHIP_OF_SHARES_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_TRUST = 'ownership-of-shares-more-than-25-percent-as-control-over-trust-registered-overseas-entity',
  VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_TRUST = 'voting-rights-more-than-25-percent-as-control-over-trust-registered-overseas-entity',
  RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_CONTROL_OVER_TRUST = 'right-to-appoint-and-remove-directors-as-control-over-trust-registered-overseas-entity',
  SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_CONTROL_OVER_TRUST = 'significant-influence-or-control-as-control-over-trust-registered-overseas-entity',

  OWNERSHIP_OF_SHARES_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_FIRM = 'ownership-of-shares-more-than-25-percent-as-control-over-firm-registered-overseas-entity',
  VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_FIRM = 'voting-rights-more-than-25-percent-as-control-over-firm-registered-overseas-entity',
  RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_CONTROL_OVER_FIRM = 'right-to-appoint-and-remove-directors-as-control-over-firm-registered-overseas-entity',
  SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_CONTROL_OVER_FIRM = 'significant-influence-or-control-as-control-over-firm-registered-overseas-entity',

  REGISTERED_OWNER_AS_NOMINEE_PERSON_ENGLAND_AND_WALES = 'registered-owner-as-nominee-person-england-wales-registered-overseas-entity',
  REGISTERED_OWNER_AS_NOMINEE_PERSON_SCOTLAND = 'registered-owner-as-nominee-person-scotland-registered-overseas-entity',
  REGISTERED_OWNER_AS_NOMINEE_PERSON_NORTHERN_IRELAND = 'registered-owner-as-nominee-person-northern-ireland-registered-overseas-entity',

  REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_ENGLAND_AND_WALES = 'registered-owner-as-nominee-another-entity-england-wales-registered-overseas-entity',
  REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_SCOTLAND = 'registered-owner-as-nominee-another-entity-scotland-registered-overseas-entity',
  REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NORTHERN_IRELAND = 'registered-owner-as-nominee-another-entity-northern-ireland-registered-overseas-entity'
}

const natureTypeMap = new Map<string, BoTypes>([
  [natureOfControl.OWNERSHIP_MORE_THAN_25_PERCENT_SHARE_ENTITY, BoTypes.BO_NATURE_OF_CONTROL],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_SHARE_ENTITY, BoTypes.BO_NATURE_OF_CONTROL],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS, BoTypes.BO_NATURE_OF_CONTROL],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_ENTITY, BoTypes.BO_NATURE_OF_CONTROL],

  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],
  [natureOfControl.OWNERSHIP_MORE_THAN_25_PERCENT_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],

  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL],
  [natureOfControl.OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL],

  [natureOfControl.OWNERSHIP_OF_SHARES_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_TRUST, BoTypes.CONTROL_OVER_TRUST_NATURE_OF_CONTROL],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_TRUST, BoTypes.CONTROL_OVER_TRUST_NATURE_OF_CONTROL],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_CONTROL_OVER_TRUST, BoTypes.CONTROL_OVER_TRUST_NATURE_OF_CONTROL],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_CONTROL_OVER_TRUST, BoTypes.CONTROL_OVER_TRUST_NATURE_OF_CONTROL],

  [natureOfControl.OWNERSHIP_OF_SHARES_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_FIRM, BoTypes.CONTROL_OVER_FIRM_NATURE_OF_CONTROL],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_FIRM, BoTypes.CONTROL_OVER_FIRM_NATURE_OF_CONTROL],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_CONTROL_OVER_FIRM, BoTypes.CONTROL_OVER_FIRM_NATURE_OF_CONTROL],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_CONTROL_OVER_FIRM, BoTypes.CONTROL_OVER_FIRM_NATURE_OF_CONTROL],

  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_PERSON_ENGLAND_AND_WALES, BoTypes.REGISTERED_OWNER_AS_NOMINEE_PERSON_NATURE_OF_CONTROL],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_PERSON_SCOTLAND, BoTypes.REGISTERED_OWNER_AS_NOMINEE_PERSON_NATURE_OF_CONTROL],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_PERSON_NORTHERN_IRELAND, BoTypes.REGISTERED_OWNER_AS_NOMINEE_PERSON_NATURE_OF_CONTROL],

  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_ENGLAND_AND_WALES, BoTypes.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NATURE_OF_CONTROL],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_SCOTLAND, BoTypes.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NATURE_OF_CONTROL],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NORTHERN_IRELAND, BoTypes.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NATURE_OF_CONTROL]
]);

const natureOfControlTypeMap = new Map<string, NatureOfControlType>([
  [natureOfControl.OWNERSHIP_MORE_THAN_25_PERCENT_SHARE_ENTITY, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_SHARE_ENTITY, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_ENTITY, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL],

  [natureOfControl.OWNERSHIP_MORE_THAN_25_PERCENT_AS_TRUST, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_TRUST, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_TRUST, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_TRUST, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL],

  [natureOfControl.OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_FIRM, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_FIRM, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_FIRM, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL],

  [natureOfControl.OWNERSHIP_OF_SHARES_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_TRUST, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_TRUST, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_CONTROL_OVER_TRUST, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_CONTROL_OVER_TRUST, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL],

  [natureOfControl.OWNERSHIP_OF_SHARES_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_FIRM, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControl.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_CONTROL_OVER_FIRM, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControl.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_CONTROL_OVER_FIRM, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_CONTROL_OVER_FIRM, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL]
]);

const natureOfControlJurisdictionMap = new Map<string, NatureOfControlJurisdiction>([
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_PERSON_ENGLAND_AND_WALES, NatureOfControlJurisdiction.ENGLAND_AND_WALES],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_PERSON_SCOTLAND, NatureOfControlJurisdiction.SCOTLAND],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_PERSON_NORTHERN_IRELAND, NatureOfControlJurisdiction.NORTHERN_IRELAND],

  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_ENGLAND_AND_WALES, NatureOfControlJurisdiction.ENGLAND_AND_WALES],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_SCOTLAND, NatureOfControlJurisdiction.SCOTLAND],
  [natureOfControl.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NORTHERN_IRELAND, NatureOfControlJurisdiction.NORTHERN_IRELAND]
]);

const natureOfControlKindToBOFieldMap = new Map<BoTypes, string>([
  [BoTypes.BO_NATURE_OF_CONTROL, "beneficial_owner_nature_of_control_types"],
  [BoTypes.NON_LEGAL_NATURE_OF_CONTROL, "non_legal_firm_members_nature_of_control_types"],
  [BoTypes.TRUST_NATURE_OF_CONTROL, "trustees_nature_of_control_types"],
  [BoTypes.CONTROL_OVER_TRUST_NATURE_OF_CONTROL, "trust_control_nature_of_control_types"],
  [BoTypes.CONTROL_OVER_FIRM_NATURE_OF_CONTROL, "non_legal_firm_control_nature_of_control_types"],
  [BoTypes.REGISTERED_OWNER_AS_NOMINEE_PERSON_NATURE_OF_CONTROL, "owner_of_land_person_nature_of_control_jurisdictions"],
  [BoTypes.REGISTERED_OWNER_AS_NOMINEE_OTHER_ENTITY_NATURE_OF_CONTROL, "owner_of_land_other_entity_nature_of_control_jurisdictions"]
]);

export const mapIndividualBOPrivateData = (boPrivateData: BeneficialOwnerPrivateData[], beneficialOwner: BeneficialOwnerIndividual) => {
  logger.info(`mapIndividualBOPrivateData():`);
  for (const boData of boPrivateData) {
    logger.info(`boData.hashedId=${boData.hashedId} , beneficialOwner.ch_reference=${beneficialOwner.ch_reference}`);
    if (boData.hashedId === beneficialOwner.ch_reference) {
      beneficialOwner.usual_residential_address = mapBOMOAddress(boData.usualResidentialAddress);
      logger.info(`addressline1=${beneficialOwner.usual_residential_address?.line_1}`);
      logger.info(`addressline2=${beneficialOwner.usual_residential_address?.line_2}`);
      logger.info(`postcode=${beneficialOwner.usual_residential_address?.postcode}`);
      if (boData.dateOfBirth) {
        beneficialOwner.date_of_birth = mapInputDate(boData.dateOfBirth);
        beneficialOwner.have_day_of_birth = true;
      }
    }
  }
};

export const mapCorporateOrGovernmentBOPrivateData = (boPrivateData: BeneficialOwnerPrivateData[], beneficialOwner: BeneficialOwnerOther | BeneficialOwnerGov) => {
  for (const boData of boPrivateData) {
    console.log("HASHHH_ID" + boData.hashedId + "CH_REERENCEEE" + beneficialOwner.ch_reference );
    if (boData.hashedId === beneficialOwner.ch_reference) {
      beneficialOwner.principal_address = mapBOMOAddress(boData.principalAddress);
      console.log("ENDDDDDD" );
    }
  }
};


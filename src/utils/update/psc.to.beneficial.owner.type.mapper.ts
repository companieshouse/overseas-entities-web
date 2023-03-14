import { OfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { BeneficialOwnerGov } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "../../model/beneficial.owner.other.model";
import { Address, InputDate, NatureOfControlType, yesNoResponse } from "../../model/data.types.model";

export const mapPscToBeneficialOwnerTypeIndividual = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerIndividual => {
  const service_address = mapAddress(psc.address);
  // const address = mapAddress(undefined);

  const result: BeneficialOwnerIndividual = {
    id: psc.links?.self,
    link: {
      self: psc.links?.self
    },
    first_name: psc.nameElements?.forename,
    last_name: psc.nameElements?.surname,
    nationality: psc.nationality,
    second_nationality: undefined,
    date_of_birth: mapDateOfBirth(psc),
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address) ? yesNoResponse.Yes : yesNoResponse.No,
    usual_residential_address: undefined,
    service_address: service_address,
    start_date: psc.notifiedOn as any as InputDate,
    // is_on_sanctions_list: psc.isSanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, false);
  return result;
};

export const mapPscToBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerOther => {
  const service_address = mapAddress(psc.address);
  const principal_address = mapAddress(psc.address);

  const result: BeneficialOwnerOther = {
    id: psc.links?.self,
    link: {
      self: psc.links?.self
    },
    name: psc.name,
    principal_address: principal_address,
    service_address: service_address,
    is_service_address_same_as_principal_address: isSameAddress(service_address, principal_address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legalForm,
    law_governed: psc.identification?.legalAuthority,
    public_register_name: psc.identification?.placeRegistered,
    registration_number: psc.identification?.registrationNumber,
    is_on_register_in_country_formed_in: undefined,
    start_date: psc.notifiedOn as any as InputDate,
    // is_on_sanctions_list: psc.isSanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, false);
  return result;

};

export const mapPscToBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerGov => {
  const service_address = mapAddress(psc.address);
  const principal_address = mapAddress(undefined);

  const result: BeneficialOwnerGov = {
    id: psc.links?.self,
    link: {
      self: psc.links?.self
    },
    name: psc.name,
    principal_address: principal_address,
    service_address: service_address,
    is_service_address_same_as_principal_address: isSameAddress(service_address, principal_address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legalForm,
    law_governed: psc.identification?.legalAuthority,
    start_date: psc.notifiedOn as any as InputDate,
    // is_on_sanctions_list: psc.isSanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, true);
  return result;
};

const mapNatureOfControl = (psc: CompanyPersonWithSignificantControl, beneficialOwner: BeneficialOwnerIndividual| BeneficialOwnerOther, isBeneficialGov: boolean) => {
  psc.naturesOfControl?.forEach(natureType => {
    const controlKind = natureTypeMap.get(natureType);
    switch (controlKind) {
        case 'BoNatureOfControl':
          beneficialOwner.beneficial_owner_nature_of_control_types = NatureOfControlTypeMap.get(natureType) as unknown as NatureOfControlType[];
          break;
        case "NonLegalNatureOfControl":
          beneficialOwner.non_legal_firm_members_nature_of_control_types = NatureOfControlTypeMap.get(natureType) as unknown as NatureOfControlType[];
          break;
        case "TrustNatureOfControl":
          if (!isBeneficialGov){
            beneficialOwner.trustees_nature_of_control_types = NatureOfControlTypeMap.get(natureType) as unknown as NatureOfControlType[];
          }
          break;
        default:
          throw new Error("INVALID NATURE OF CONTROL TYPE");
    }
  });
};

enum BoTypes {
  BO_NATURE_OF_CONTROL = "BoNatureOfControl",
  TRUST_NATURE_OF_CONTROL = "TrustNatureOfControl",
  NON_LEGAL_NATURE_OF_CONTROL = "NonLegalNatureOfControl",
}

export enum natureOfControlMap {
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
  OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM = 'ownership-of-shares-more-than-25-percent-as-firm-registered-overseas-entity'
}

const natureTypeMap = new Map<string, string>([
  [natureOfControlMap.OWNERSHIP_MORE_THAN_25_PERCENT_SHARE_ENTITY, BoTypes.BO_NATURE_OF_CONTROL],
  [natureOfControlMap.VOTING_RIGHT_MORE_THAN_25_PERCENT_SHARE_ENTITY, BoTypes.BO_NATURE_OF_CONTROL],
  [natureOfControlMap.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS, BoTypes.BO_NATURE_OF_CONTROL],
  [natureOfControlMap.SIGNIFICANT_INFLUENCE_OR_CONTROL_ENTITY, BoTypes.BO_NATURE_OF_CONTROL],
  [natureOfControlMap.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],
  [natureOfControlMap.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],
  [natureOfControlMap.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],
  [natureOfControlMap.OWNERSHIP_MORE_THAN_25_PERCENT_AS_TRUST, BoTypes.TRUST_NATURE_OF_CONTROL],
  [natureOfControlMap.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL],
  [natureOfControlMap.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL],
  [natureOfControlMap.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL],
  [natureOfControlMap.OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL]
]);

const NatureOfControlTypeMap = new Map<string, string>([
  [natureOfControlMap.OWNERSHIP_MORE_THAN_25_PERCENT_SHARE_ENTITY, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControlMap.VOTING_RIGHT_MORE_THAN_25_PERCENT_SHARE_ENTITY, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControlMap.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControlMap.SIGNIFICANT_INFLUENCE_OR_CONTROL_ENTITY, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL],
  [natureOfControlMap.OWNERSHIP_MORE_THAN_25_PERCENT_AS_TRUST, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControlMap.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_TRUST, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControlMap.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_TRUST, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControlMap.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_TRUST, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL],
  [natureOfControlMap.OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM, NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  [natureOfControlMap.VOTING_RIGHT_MORE_THAN_25_PERCENT_AS_FIRM, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  [natureOfControlMap.RIGHT_TO_APPOINT_AND_REMOVE_DIRECTORS_AS_FIRM, NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  [natureOfControlMap.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_FIRM, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL]
]);

const mapDateOfBirth = (psc: CompanyPersonWithSignificantControl) => {
  return {
    day: psc.dateOfBirth?.day,
    month: psc.dateOfBirth?.month,
    year: psc.dateOfBirth?.year
  } as InputDate;
};

const mapAddress = (address: any): Address => {
  if (!address) {
    return {};
  }
  return {
    property_name_number: address?.premises,
    line_1: address?.address_line_1,
    line_2: address?.address_line_2,
    country: address?.region,
    town: address?.locality,
    county: undefined, // psc.address?.county,
    postcode: address?.postal_code
  };
};

type AddressMatches = {
  (address1: Address, address2?: Address): boolean;
  (address1: OfficeAddress, address2?: OfficeAddress): boolean;
};

export const isSameAddress: AddressMatches = (address1: any, address2?: any) => {
  return !address2 || Object.keys(address1).every(key => address1[key] === address2[key]);
};

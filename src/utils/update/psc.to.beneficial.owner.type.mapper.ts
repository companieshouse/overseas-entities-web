import { OfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyPersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { BeneficialOwnerGov } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "../../model/beneficial.owner.other.model";
import { Address, InputDate, NatureOfControlType, yesNoResponse } from "../../model/data.types.model";

export const mapPscToBeneficialOwnerTypeIndividual = (psc: CompanyPersonWithSignificantControlResource): BeneficialOwnerIndividual => {
  const service_address = mapAddress(psc.address);
  const result: BeneficialOwnerIndividual = {
    id: psc.links?.self,
    first_name: psc.name_elements?.forename,
    last_name: psc.name_elements?.surname,
    nationality: psc.nationality,
    // second_nationality: undefined,
    date_of_birth: mapDateOfBirth(psc),
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address) ? yesNoResponse.Yes : yesNoResponse.No,
    usual_residential_address: undefined,
    service_address: service_address,
    start_date: undefined,
    is_on_sanctions_list: psc.is_sanctioned === true ? yesNoResponse.Yes : yesNoResponse.No,

  };
  mapNatureOfControl(psc, result, false);
  return result;
};

export const mapPscToBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControlResource): BeneficialOwnerOther => {
  const service_address = mapAddress(psc.address);
  const principal_address = mapAddress(psc.address);

  const result: BeneficialOwnerOther = {
    id: psc.links?.self,
    name: psc.name,
    principal_address: principal_address,
    service_address: service_address,
    is_service_address_same_as_principal_address: isSameAddress(service_address, principal_address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legal_form,
    law_governed: psc.identification?.legal_authority,
    public_register_name: psc.identification?.place_registered,
    registration_number: psc.identification?.registration_number,
    is_on_register_in_country_formed_in: undefined,
    start_date: undefined,
    is_on_sanctions_list: psc.is_sanctioned === true ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, false);
  return result;

};

export const mapPscToBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControlResource): BeneficialOwnerGov => {
  const service_address = mapAddress(psc.address);
  const principal_address = mapAddress(undefined);

  const result: BeneficialOwnerGov = {
    id: psc.links?.self,
    name: psc.name,
    principal_address: principal_address,
    service_address: service_address,
    is_service_address_same_as_principal_address: isSameAddress(service_address, principal_address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legal_form,
    law_governed: psc.identification?.legal_authority,
    start_date: undefined,
    is_on_sanctions_list: psc.is_sanctioned === true ? yesNoResponse.Yes : yesNoResponse.No,
  };
  mapNatureOfControl(psc, result, true);
  return result;
};

const mapNatureOfControl = (psc: CompanyPersonWithSignificantControlResource, beneficialOwner: BeneficialOwnerIndividual| BeneficialOwnerOther | BeneficialOwnerGov, isBeneficialGov: boolean) => {
  psc.natures_of_control?.forEach(natureType => {
    const controlKind = natureTypeMap.get(natureType);
    switch (controlKind) {
        case 'BoNatureOfControl':
          beneficialOwner.beneficial_owner_nature_of_control_types = natureOfControlTypeMap.get(natureType) as unknown as NatureOfControlType[];
          break;
        case "NonLegalNatureOfControl":
          beneficialOwner.non_legal_firm_members_nature_of_control_types = natureOfControlTypeMap.get(natureType) as unknown as NatureOfControlType[];
          break;
        case "TrustNatureOfControl":
          if (!isBeneficialGov){
            beneficialOwner['trustees_nature_of_control_types'] = natureOfControlTypeMap.get(natureType) as unknown as NatureOfControlType[];
          }
          break;
        default:
          throw new Error('INVALID NATURE OF CONTROL TYPE');
    }
  });
};

enum BoTypes {
  BO_NATURE_OF_CONTROL = "BoNatureOfControl",
  TRUST_NATURE_OF_CONTROL = "TrustNatureOfControl",
  NON_LEGAL_NATURE_OF_CONTROL = "NonLegalNatureOfControl",
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
  OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM = 'ownership-of-shares-more-than-25-percent-as-firm-registered-overseas-entity'
}

const natureTypeMap = new Map<string, string>([
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
  [natureOfControl.OWNERSHIP_MORE_THAN_25_PERCENT_AS_FIRM, BoTypes.NON_LEGAL_NATURE_OF_CONTROL]
]);

const natureOfControlTypeMap = new Map<string, string>([
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
  [natureOfControl.SIGNIFICANT_INFLUENCE_OR_CONTROL_AS_FIRM, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL]
]);

const mapDateOfBirth = (psc: CompanyPersonWithSignificantControlResource) => {
  return {
    day: psc.date_of_birth?.day,
    month: psc.date_of_birth?.month,
    year: psc.date_of_birth?.year
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

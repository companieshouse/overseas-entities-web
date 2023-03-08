import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { AddressResource } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { BeneficialOwnerGov } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "../../model/beneficial.owner.other.model";
import { Address, InputDate, yesNoResponse } from "../../model/data.types.model";

export const mapPscToBeneficialOwnerTypeIndividual = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerIndividual => {
  return {
    id: psc.links?.self,
    first_name: psc.nameElements?.forename,
    last_name: psc.nameElements?.surname,
    nationality: psc.nationality,
    second_nationality: undefined,
    date_of_birth: mapDateOfBirth(psc),
    is_service_address_same_as_usual_residential_address: isSameAddress(psc?.address) ? yesNoResponse.Yes : yesNoResponse.No,
    usual_residential_address: mapAddress(psc),
    service_address: mapAddress(psc),
    beneficial_owner_nature_of_control_types: undefined,
    trustees_nature_of_control_types: undefined,
    non_legal_firm_members_nature_of_control_types: undefined,
    start_date: psc.notifiedOn as any, // any type not correct but to confirm
    // is_on_sanctions_list: psc.is_sanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
};

export const mapPscToBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerOther => {
  return {
    id: psc.links?.self,
    name: psc.name,
    principal_address: mapAddress(psc),
    service_address: mapAddress(psc),
    is_service_address_same_as_principal_address: isSameAddress(psc?.address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legalForm,
    law_governed: psc.identification?.legalAuthority,
    public_register_name: psc.identification?.placeRegistered,
    registration_number: psc.identification?.registrationNumber,
    is_on_register_in_country_formed_in: undefined,
    start_date: psc.notifiedOn as any, // any type not correct but to confirm
    beneficial_owner_nature_of_control_types: undefined,
    trustees_nature_of_control_types: undefined,
    non_legal_firm_members_nature_of_control_types: undefined,
    // is_on_sanctions_list: raw.is_sanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
};

export const mapPscToBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControl): BeneficialOwnerGov => {
  return {
    id: psc.links?.self,
    name: psc.name,
    principal_address: mapAddress(psc),
    service_address: mapAddress(psc),
    is_service_address_same_as_principal_address: isSameAddress(psc?.address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legalForm,
    law_governed: psc.identification?.legalAuthority,
    start_date: psc.notifiedOn as any, // any type not correct but to confirm
    beneficial_owner_nature_of_control_types: undefined,
    non_legal_firm_members_nature_of_control_types: undefined,
    // is_on_sanctions_list: raw.is_sanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
};

const mapDateOfBirth = (psc: CompanyPersonWithSignificantControl) => {
  return {
    day: psc.dateOfBirth?.day,
    month: psc.dateOfBirth?.month,
    year: psc.dateOfBirth?.year
  } as InputDate;
};

const mapAddress = (psc: CompanyPersonWithSignificantControl): Address => {
  return {
    property_name_number: psc.address?.premises,
    line_1: psc.address?.address_line_1,
    line_2: psc.address?.address_line_2,
    country: psc.address?.region,
    town: psc.address?.locality,
    county: undefined, // psc.address?.county,
    postcode: psc.address?.postal_code
  };
};

const isSameAddress = (home_address?: AddressResource) => {
  return !home_address || Object.keys(home_address).every(key => (home_address as any)[key]);
};

import { CompanyPersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { AddressResource } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { BeneficialOwnerGov } from "model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividual } from "model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "model/beneficial.owner.other.model";
import { Address, InputDate, yesNoResponse } from "model/data.types.model";

export const pscToBeneficialOwnerTypeIndividual = (psc: CompanyPersonWithSignificantControlResource): BeneficialOwnerIndividual => {
  return {
    id: psc.links.self,
    first_name: psc.name_elements?.forename,
    last_name: psc.name_elements?.surname,
    nationality: psc.nationality,
    second_nationality: undefined,
    date_of_birth: mapDateOfBirth(psc),
    is_service_address_same_as_usual_residential_address: isSameAddress(psc?.address) ? yesNoResponse.Yes : yesNoResponse.No,
    usual_residential_address: mapAddress(psc),
    service_address: mapAddress(psc),
    beneficial_owner_nature_of_control_types: undefined,
    trustees_nature_of_control_types: undefined,
    non_legal_firm_members_nature_of_control_types: undefined,
    start_date: mapStartDate(psc),
    // is_on_sanctions_list: psc.is_sanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
};

export const pscToBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControlResource): BeneficialOwnerOther => {
  return {
    id: psc.links.self,
    name: psc.name,
    principal_address: mapAddress(psc),
    service_address: mapAddress(psc),
    is_service_address_same_as_principal_address: isSameAddress(psc?.address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legal_form,
    law_governed: psc.identification?.legal_authority,
    public_register_name: psc.identification?.place_registered,
    registration_number: psc.identification?.registration_number,
    is_on_register_in_country_formed_in: undefined,
    start_date: mapStartDate(psc),
    beneficial_owner_nature_of_control_types: undefined,
    trustees_nature_of_control_types: undefined,
    non_legal_firm_members_nature_of_control_types: undefined,
    // is_on_sanctions_list: raw.is_sanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
};

export const pscToBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControlResource): BeneficialOwnerGov => {
  return {
    id: psc.links.self,
    name: psc.name,
    principal_address: mapAddress(psc),
    service_address: mapAddress(psc),
    is_service_address_same_as_principal_address: isSameAddress(psc?.address) ? yesNoResponse.Yes : yesNoResponse.No,
    legal_form: psc.identification?.legal_form,
    law_governed: psc.identification?.legal_authority,
    start_date: mapStartDate(psc),
    beneficial_owner_nature_of_control_types: undefined,
    non_legal_firm_members_nature_of_control_types: undefined,
    // is_on_sanctions_list: raw.is_sanctioned === "true" ? yesNoResponse.Yes : yesNoResponse.No,
  };
};

const mapDateOfBirth = (psc: CompanyPersonWithSignificantControlResource) => {
  return {
    day: psc.date_of_birth?.day,
    month: psc.date_of_birth?.month,
    year: psc.date_of_birth?.year
  } as InputDate;
};

const mapStartDate = (psc: CompanyPersonWithSignificantControlResource): InputDate => {
  return {
    day: psc.date_of_birth?.day,
    month: psc.date_of_birth?.month,
    year: psc.date_of_birth?.year
  } as InputDate;
};

const mapAddress = (psc: CompanyPersonWithSignificantControlResource): Address => {
  return {
    property_name_number: psc.address?.premises,
    line_1: psc.address?.address_line_1,
    line_2: psc.address?.address_line_2,
    country: psc.address?.region,
    town: psc.address.locality,
    county: undefined, // psc.address?.county,
    postcode: psc.address?.postal_code
  };
};

const isSameAddress = (home_address?: AddressResource, corresponse_address?: Address) => {
  return !home_address || Object.keys(home_address).every(key => (home_address as any)[key] === (corresponse_address as any)[key]);
};
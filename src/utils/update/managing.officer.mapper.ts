import { isSameAddress, mapBOMOAddress, mapDateOfBirth, mapInputDate, mapSelfLink, splitNationalities, lowerCaseAllWordsExceptFirstLetters } from "./mapper.utils";
import { CompanyOfficer, FormerNameResource } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ManagingOfficerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { ManagingOfficerIndividual } from "../../model/managing.officer.model";
import { ManagingOfficerCorporate } from "../../model/managing.officer.corporate.model";
import { yesNoResponse } from "../../model/data.types.model";

export const mapToManagingOfficer = (officer: CompanyOfficer): ManagingOfficerIndividual => {
  const service_address = mapBOMOAddress(officer.address);
  const address = undefined;
  const names = splitNames(officer.name);
  const nationalities = splitNationalities(officer.nationality);
  const formernames = getFormerNames(officer.formerNames);

  return {
    id: officer.links?.self,
    ch_reference: mapSelfLink(officer.links?.self),
    first_name: names[0],
    last_name: names[1],
    has_former_names: officer.formerNames ? yesNoResponse.Yes : yesNoResponse.No,
    former_names: formernames,
    date_of_birth: mapDateOfBirth(officer.dateOfBirth),
    nationality: lowerCaseAllWordsExceptFirstLetters(nationalities[0]),
    second_nationality: nationalities.length > 1 ? lowerCaseAllWordsExceptFirstLetters(nationalities[1]) : undefined,
    usual_residential_address: address,
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    start_date: mapInputDate(officer.appointedOn),
    occupation: officer.occupation,
    role_and_responsibilities: officer.responsibilities,
  };
};

export const mapToManagingOfficerCorporate = (officer: CompanyOfficer): ManagingOfficerCorporate => {
  const service_address = mapBOMOAddress(officer.address);
  const address = undefined;

  return {
    id: officer.links?.self,
    ch_reference: mapSelfLink(officer.links?.self),
    name: officer.name,
    principal_address: address,
    is_service_address_same_as_principal_address: undefined,
    service_address: service_address,
    start_date: mapInputDate(officer.appointedOn),
    legal_form: officer.identification?.legalForm,
    law_governed: officer.identification?.legalAuthority,
    is_on_register_in_country_formed_in: officer.identification !== undefined && officer.identification?.registrationNumber ? yesNoResponse.Yes : yesNoResponse.No,
    public_register_name: officer.identification?.placeRegistered,
    registration_number: officer.identification?.registrationNumber,
    role_and_responsibilities: officer.responsibilities,
    contact_full_name: officer.contactDetails?.contactName,
  };
};

export const splitNames = (officerName: string): string[] => {
  if (officerName === undefined) {
    return ["", ""];
  } else {
    const names = officerName.split(/\s*,\s*/);
    return [names[1], names[0]];
  }
};

export const getFormerNames = (formerNames?: FormerNameResource[]): string => {
  let allFormerNames = "";
  if (formerNames !== undefined) {
    for (let loop = 0; loop < formerNames.length; loop++) {
      const forenames = formerNames[loop].forenames;
      const surname = formerNames[loop].surname;
      const holder = forenames ? forenames.concat(" " + surname) : surname;
      if (loop === 0) {
        allFormerNames = holder ?? "";
      } else {
        allFormerNames += ", " + holder;
      }
    }
  }
  return allFormerNames;
};

export const mapIndividualMoPrivateData = (moPrivateData: ManagingOfficerPrivateData[], managingOfficer: ManagingOfficerIndividual) => {
  for (const managingOfficerData of moPrivateData) {
    if (managingOfficerData.hashedId === managingOfficer.ch_reference) {
      managingOfficer.usual_residential_address = mapBOMOAddress(managingOfficerData.residentialAddress);
      if (managingOfficerData.dateOfBirth) {
        managingOfficer.date_of_birth = mapInputDate(managingOfficerData.dateOfBirth);
        managingOfficer.have_day_of_birth = true;
      }
    }
  }
};

export const mapCorporateMoPrivateData = (moPrivateData: ManagingOfficerPrivateData[], managingOfficer: ManagingOfficerCorporate) => {
  for (const managingOfficerData of moPrivateData) {
    if (managingOfficerData.hashedId === managingOfficer.ch_reference) {
      managingOfficer.principal_address = mapBOMOAddress(managingOfficerData.principalAddress);
      managingOfficer.contact_email = managingOfficerData.contactEmailAddress;
    }
  }
};


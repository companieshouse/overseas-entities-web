import { isSameAddress, mapBOMOAddress, mapDateOfBirth, mapInputDate, mapSelfLink } from "./mapper.utils";
import { CompanyOfficer, FormerNameResource } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ManagingOfficerIndividual } from "../../model/managing.officer.model";
import { ManagingOfficerCorporate } from "../../model/managing.officer.corporate.model";
import { yesNoResponse } from "../../model/data.types.model";

export const mapToManagingOfficer = (officer: CompanyOfficer): ManagingOfficerIndividual => {
  const raw = officer as any;
  const service_address = mapBOMOAddress(officer.address);
  const address = undefined;
  const names = splitNames(officer.name);
  const formernames = getFormerNames(officer.formerNames);

  return {
    id: raw.links?.self,
    ch_reference: mapSelfLink(officer.links?.officer?.appointments),
    first_name: names[0],
    last_name: names[1],
    has_former_names: officer.formerNames ? yesNoResponse.Yes : yesNoResponse.No,
    former_names: formernames,
    date_of_birth: mapDateOfBirth(officer.dateOfBirth),
    nationality: officer.nationality,
    usual_residential_address: address,
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    start_date: mapInputDate(officer.appointedOn),
    occupation: officer.occupation,
    role_and_responsibilities: officer.officerRole,
  };
};

export const mapToManagingOfficerCorporate = (officer: CompanyOfficer): ManagingOfficerCorporate => {
  const raw = officer as any;
  const service_address = mapBOMOAddress(officer.address);
  const address = undefined;

  return {
    id: raw.links?.self,
    name: officer.name,
    principal_address: address,
    is_service_address_same_as_principal_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    start_date: mapInputDate(officer.appointedOn),
    legal_form: officer.identification?.legalForm,
    law_governed: officer.identification?.legalAuthority,
    is_on_register_in_country_formed_in: undefined,
    public_register_name: officer.identification?.placeRegistered,
    registration_number: officer.identification?.registrationNumber,
    role_and_responsibilities: officer.officerRole,
  };
};

export const splitNames = (officerName: string): string[] => {
  if (officerName === undefined) {
    return ["", ""];
  } else {
    const names = officerName.split(" ");
    if (names.length > 2) {
      let firstNames = "";
      for (let loop = 0; loop < names.length - 1; loop++) {
        firstNames += names[loop];
        if (loop !== names.length - 1) {
          firstNames += " ";
        }
      }
      return [firstNames, names[names.length - 1]];
    } else {
      return names;
    }
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

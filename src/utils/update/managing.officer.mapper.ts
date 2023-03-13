import { mapAddress, isSameAddress } from "./mapper.utils";
import { CompanyOfficer, FormerName } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ManagingOfficerIndividual } from "../../model/managing.officer.model";
import { ManagingOfficerCorporate } from "../../model/managing.officer.corporate.model";
import { InputDate, yesNoResponse } from "../../model/data.types.model";

export const mapToManagingOfficer = (officer: CompanyOfficer): ManagingOfficerIndividual => {
  console.log(officer);
  const raw = officer as any;
  const service_address = mapAddress(officer.address);
  const address = mapAddress(officer.address);
  const names = splitNames(officer.name);
  const formernames = getFormerNames(officer.formerNames);

  return {
    id: raw.links?.self,
    first_name: names[0],
    last_name: names[1],
    has_former_names: raw.formerNames ? yesNoResponse.Yes : yesNoResponse.No,
    former_names: formernames,
    date_of_birth: mapDateOfBirth(officer),
    nationality: officer.nationality,
    // appointed_on: officer.appointedOn,
    usual_residential_address: address,
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    occupation: officer.occupation,
    role_and_responsibilities: officer.officerRole
  };
};

export const mapToManagingOfficerCorporate = (officer: CompanyOfficer): ManagingOfficerCorporate => {
  console.log(officer);
  const raw = officer as any;
  const service_address = mapAddress(officer.address);
  const address = mapAddress(officer.address);

  return {
    id: raw.links?.self,
    name: officer.name,
    principal_address: address,
    is_service_address_same_as_principal_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    legal_form: officer.identification?.legalForm,
    law_governed: officer.identification?.legalAuthority,
    is_on_register_in_country_formed_in: undefined,
    public_register_name: officer.identification?.placeRegistered,
    registration_number: officer.identification?.registrationNumber,
    role_and_responsibilities: officer.officerRole,
  };
};

const mapDateOfBirth = (officer: CompanyOfficer) => {
  return {
    day: officer.dateOfBirth?.day,
    month: officer.dateOfBirth?.month,
    year: officer.dateOfBirth?.year
  } as InputDate;
};

export const splitNames = (officerName: string) => {
  if (officerName === undefined) {
    const names = ["", ""];
    return names;
  } else {
    const names = officerName.split(" ");
    if (names.length > 2) {
      const firstAndMiddleName = names[0].concat(" " + names[1]);
      names.shift;
      names[0] = firstAndMiddleName;
      return names;
    } else {
      return names;
    }
  }
};

export const getFormerNames = (formerNames?: FormerName[]) => {

  let allFormerNames;

  if (formerNames !== undefined) {
    for (let loop = 0; loop < formerNames.length; loop++) {
      const forenames = formerNames[loop].forenames;
      const surname = formerNames[loop].surname;
      const holder = forenames?.concat(" " + surname);
      if (loop === 0) {
        allFormerNames = holder;
      } else {
        allFormerNames += ", " + holder;
      }
    }
    return allFormerNames;
  }
};

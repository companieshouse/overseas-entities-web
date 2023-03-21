import { isSameAddress } from "./mapper.utils";
import { CompanyOfficer, FormerNameResource, DateOfBirth } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ManagingOfficerIndividual } from "../../model/managing.officer.model";
import { ManagingOfficerCorporate } from "../../model/managing.officer.corporate.model";
import { InputDate, yesNoResponse } from "../../model/data.types.model";

export const mapToManagingOfficer = (officer: CompanyOfficer): ManagingOfficerIndividual => {
  const raw = officer as any;
  const service_address = mapAddress(officer.address);
  const address = undefined;
  const names = splitNames(officer.name);
  const formernames = getFormerNames(officer.formerNames);

  const result: ManagingOfficerIndividual = {
    id: raw.links?.self,
    first_name: names[0],
    last_name: names[1],
    has_former_names: officer.formerNames ? yesNoResponse.Yes : yesNoResponse.No,
    former_names: formernames,
    date_of_birth: mapDateOfBirth(officer.dateOfBirth),
    nationality: officer.nationality,
    usual_residential_address: address,
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    occupation: officer.occupation,
    role_and_responsibilities: officer.officerRole,
  };
  return result;
};

export const mapToManagingOfficerCorporate = (officer: CompanyOfficer): ManagingOfficerCorporate => {
  const raw = officer as any;
  const service_address = mapAddress(officer.address);
  const address = undefined;

  const result: ManagingOfficerCorporate = {
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
  return result;
};

const mapDateOfBirth = (dateOfBirth: DateOfBirth | undefined) => {
  return {
    day: dateOfBirth?.day,
    month: dateOfBirth?.month,
    year: dateOfBirth?.year
  } as InputDate;
};

export const splitNames = (officerName: string) => {
  if (officerName === undefined) {
    const names = ["", ""];
    return names;
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
      const multipleFirstNames = [firstNames, names[names.length - 1]];
      return multipleFirstNames;
    } else {
      return names;
    }
  }
};

export const getFormerNames = (formerNames?: FormerNameResource[]) => {
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

export const mapAddress = (address: any) => {
  if (!address) {
    return {};
  }
  return {
    property_name_number: address.premises,
    line_1: address.addressLine1,
    line_2: address.addressLine2,
    town: address.locality,
    county: address.region,
    country: address.country,
    postcode: address.postalCode
  };
};


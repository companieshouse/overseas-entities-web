import { mapAddress, isSameAddress } from "./mapper.utils";
import { CompanyOfficerResource, FormerNameResource } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ManagingOfficerIndividual } from "../../model/managing.officer.model";
import { ManagingOfficerCorporate } from "../../model/managing.officer.corporate.model";
import { InputDate, yesNoResponse } from "../../model/data.types.model";

export const mapToManagingOfficer = (officer: CompanyOfficerResource): ManagingOfficerIndividual => {
  const raw = officer as any;
  const service_address = mapAddress(officer.address);
  const address = mapAddress(officer.address);
  const names = splitNames(officer.name);
  const formernames = getFormerNames(officer.former_names);

  const result: ManagingOfficerIndividual = {
    id: raw.links?.self,
    first_name: names[0],
    last_name: names[1],
    has_former_names: raw.former_names ? yesNoResponse.Yes : yesNoResponse.No,
    former_names: formernames,
    date_of_birth: mapDateOfBirth(officer),
    nationality: officer.nationality,
    usual_residential_address: address,
    is_service_address_same_as_usual_residential_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    occupation: officer.occupation,
    role_and_responsibilities: officer.officer_role,
  };
  return result;
};

export const mapToManagingOfficerCorporate = (officer: CompanyOfficerResource): ManagingOfficerCorporate => {
  const raw = officer as any;
  const service_address = mapAddress(officer.address);
  const address = mapAddress(officer.address);

  const result: ManagingOfficerCorporate = {
    id: raw.links?.self,
    name: officer.name,
    principal_address: address,
    is_service_address_same_as_principal_address: isSameAddress(service_address, address) ? yesNoResponse.Yes : yesNoResponse.No,
    service_address: service_address,
    legal_form: officer.identification?.legal_form,
    law_governed: officer.identification?.legal_authority,
    is_on_register_in_country_formed_in: undefined,
    public_register_name: officer.identification?.place_registered,
    registration_number: officer.identification?.registration_number,
    role_and_responsibilities: officer.officer_role,
  };
  return result;
};

const mapDateOfBirth = (officer: CompanyOfficerResource) => {
  return {
    day: officer.date_of_birth?.day,
    month: officer.date_of_birth?.month,
    year: officer.date_of_birth?.year
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
        if (loop !== names.length - 1) {
          firstNames += names[loop];
          if (loop !== names.length - 2) {
            firstNames += " ";
          }
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

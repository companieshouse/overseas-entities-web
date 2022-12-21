import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Entity } from "../../model/entity.model";

export const mapCompanyProfileToOverseasEntityToDTOUpdate = (cp: CompanyProfile): Entity => {
  if (!cp){
    return {} as Entity;
  }
  const entity: Entity = {
    name: cp?.companyName,
    registration_number: cp?.companyNumber,
    law_governed: "",
    legal_form: "",
    incorporation_country: cp?.jurisdiction,
    public_register_name: "",
    public_register_jurisdiction: "",
    email: "", // private data
    principal_address: {
      property_name_number: cp.registeredOfficeAddress?.premises,
      line_1: cp.registeredOfficeAddress?.addressLineOne,
      line_2: cp.registeredOfficeAddress?.addressLineTwo,
      town: cp.registeredOfficeAddress?.locality,
      county: cp.registeredOfficeAddress?.region,
      country: cp.registeredOfficeAddress?.country,
      postcode: cp.registeredOfficeAddress?.postalCode
    },
  // is_on_register_in_country_formed_in: isOnReg // breaks node
  //  ,
  // is_service_address_same_as_principal_address: yesNoResponse.No,
  };
  return entity;
};


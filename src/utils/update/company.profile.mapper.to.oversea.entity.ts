import { CompanyProfile, OfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { yesNoResponse } from "../../model/data.types.model";
import { Entity } from "../../model/entity.model";

export const mapCompanyProfileToOverseasEntity = (cp: CompanyProfile): Entity => {
  return {
    name: cp.companyName,
    registration_number: cp.companyNumber,
    law_governed: cp.foreignCompanyDetails?.governedBy,
    legal_form: cp.foreignCompanyDetails?.legalForm,
    incorporation_country: cp.jurisdiction,
    public_register_name: cp.foreignCompanyDetails?.originatingRegistry?.name,
    public_register_jurisdiction: cp.foreignCompanyDetails?.originatingRegistry?.country,
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
    service_address: {
      property_name_number: cp.serviceAddress?.premises,
      line_1: cp.serviceAddress?.addressLineOne,
      line_2: cp.serviceAddress?.addressLineTwo,
      town: cp.serviceAddress?.locality,
      county: cp.serviceAddress?.region,
      country: cp.serviceAddress?.country,
      postcode: cp.serviceAddress?.postalCode,
    },
    is_on_register_in_country_formed_in: cp.isOnRegisterInCountryFormedIn ? yesNoResponse.Yes : yesNoResponse.No,
    is_service_address_same_as_principal_address: isSameAddress(cp.registeredOfficeAddress, cp.serviceAddress) ? yesNoResponse.Yes : yesNoResponse.No
  };
};

const isSameAddress = (address1: OfficeAddress, address2?: OfficeAddress) => {
  return !address2 || Object.keys(address1).every(key => (address1 as any)[key] === (address2 as any)[key]);
};

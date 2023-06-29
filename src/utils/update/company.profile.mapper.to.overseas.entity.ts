import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { yesNoResponse } from "../../model/data.types.model";
import { Entity } from "../../model/entity.model";
import { isSameAddress, lowerCaseAllWordsExceptFirstLetters, mapAddress } from "../../utils/update/mapper.utils";

export const mapCompanyProfileToOverseasEntity = (cp: CompanyProfile): Entity => {
  const serviceAddress = mapAddress(cp.serviceAddress);
  const principalAddress = mapAddress(cp.registeredOfficeAddress);

  return {
    registration_number: cp.foreignCompanyDetails?.registrationNumber,
    law_governed: cp.foreignCompanyDetails?.governedBy,
    legal_form: cp.foreignCompanyDetails?.legalForm,
    incorporation_country: lowerCaseAllWordsExceptFirstLetters(cp.foreignCompanyDetails?.originatingRegistry?.country),
    public_register_name: cp.foreignCompanyDetails?.originatingRegistry?.name,
    public_register_jurisdiction: "",
    email: "", // private data
    service_address: serviceAddress,
    principal_address: principalAddress,
    is_on_register_in_country_formed_in: cp.isOnRegisterInCountryFormedIn ? yesNoResponse.Yes : yesNoResponse.No,
    is_service_address_same_as_principal_address: isSameAddress(cp.registeredOfficeAddress, cp.serviceAddress) ? yesNoResponse.Yes : yesNoResponse.No
  };
};

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { yesNoResponse, InputDate } from "../../model/data.types.model";
import { Entity } from "../../model/entity.model";
import { isSameAddress, mapAddress, mapInputDate } from "../../utils/update/mapper.utils";

export const mapCompanyProfileToOverseasEntity = (cp: CompanyProfile): [Entity, InputDate | undefined] => {
  const serviceAddress = mapAddress(cp.serviceAddress);
  const principalAddress = mapAddress(cp.registeredOfficeAddress);
  const next_due_date = mapInputDate(cp.confirmationStatement?.nextDue);
  return [{
    registration_number: cp.foreignCompanyDetails?.registrationNumber,
    law_governed: cp.foreignCompanyDetails?.governedBy,
    legal_form: cp.foreignCompanyDetails?.legalForm,
    incorporation_country: cp.jurisdiction,
    public_register_name: cp.foreignCompanyDetails?.originatingRegistry?.name,
    public_register_jurisdiction: cp.foreignCompanyDetails?.originatingRegistry?.country,
    email: "", // private data
    service_address: serviceAddress,
    principal_address: principalAddress,
    is_on_register_in_country_formed_in: cp.isOnRegisterInCountryFormedIn ? yesNoResponse.Yes : yesNoResponse.No,
    is_service_address_same_as_principal_address: isSameAddress(cp.registeredOfficeAddress, cp.serviceAddress) ? yesNoResponse.Yes : yesNoResponse.No
  }, next_due_date];
};

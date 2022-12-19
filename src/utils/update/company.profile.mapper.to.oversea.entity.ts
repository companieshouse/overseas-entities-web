import { ICompanyDetails } from "model/company.profile.model";
import { Address } from "../../model/data.types.model";

export const mapCompanyProfileToOverseasEntityToDTOUpdate = (data: any): ICompanyDetails => {
  if (!data){
    return {} as ICompanyDetails;
  }
  return {
    companyName: data?.companyName,
    dateOfCreation: data?.dateOfCreation,
    companyType: data?.type,
    companyNumber: data?.companyNumber,
    registeredOfficeAddress: mapCompanyAddressToOverseasEntityAddressDTO(data?.registeredOfficeAddress), // principal address
    // incorporationCountry: data?.foreign_company_details?.originating_registry?.country,
    // isOnRegisterInCountryFormedIn: mapYesOrNo(data),
    // serviceAddress: mapCompanyAddressToOverseasEntityAddressDTO(data?.registeredOfficeAddress),
    // legalForm: data?.legal_form,
    // lawGoverned: data?.foreign_company_details?.governed_by,
    // publicRegisterJurisdiction: data?.jurisdiction,
    // registrationNumber: data?.registration_number,
    // isServiceAddressSameAsPrincipalAddress: mapYesOrNo(data)
  };
};


export const mapCompanyAddressToOverseasEntityAddressDTO = (registeredOfficeAddress: any): Address => {
  return {
    line_1: registeredOfficeAddress?.addressLineOne,
    line_2: registeredOfficeAddress?.addressLineTwo,
    town: registeredOfficeAddress?.locality,
    county: registeredOfficeAddress?.region,
    country: registeredOfficeAddress?.country,
    postcode: registeredOfficeAddress?.postalCode
  };
}

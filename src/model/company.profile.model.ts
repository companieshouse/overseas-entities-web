import { Address } from "model/data.types.model";
export interface ICompanyDetails {
    companyName?: string;
    dateOfCreation?: string;
    companyType?: string;
    jurisdiction?: string;
    companyNumber?: string;
    registeredOfficeAddress?: Address;
    // incorporationCountry?: string;
    // principalAddress?: Address;
    // isServiceAddressSameAsPrincipalAddress?: yesNoResponse;
    // serviceAddress?: Address;
    // email?: string;
    // legalForm?: string;
    // lawGoverned?: string;
    // publicRegisterName?: string;
    // publicRegisterJurisdiction?: string;
    // registrationNumber?: string;
    // isOnRegisterInCountryFormedIn?: yesNoResponse;
}



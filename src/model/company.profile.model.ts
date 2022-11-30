import { Address } from "model/data.types.model";

export const companyProfileKey = "overseas_company_profile";
export interface ICompanyDetails {
    companyName?: string;
    dateOfCreation?: string;
    companyAddress?: Address
    companyType?: string;
    jurisdiction?: string;
    companyNumber?: string;
    addressLine1?: string;
    country?: string;
    postCode?: string;
    street?: string;
}



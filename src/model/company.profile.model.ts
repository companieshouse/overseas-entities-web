import { Address } from "model/data.types.model";
export interface ICompanyDetails {
    companyName?: string;
    dateOfCreation?: string;
    companyType?: string;
    jurisdiction?: string;
    companyNumber?: string;
    addressLine1?: string;
    country?: string;
    postCode?: string;
    street?: string;
    companyAddress?: Address;
}



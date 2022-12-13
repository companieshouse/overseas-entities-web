import { Address } from "model/data.types.model";
export interface ICompanyDetails {
    companyName?: string;
    dateOfCreation?: string;
    companyType?: string;
    jurisdiction?: string;
    companyNumber?: string;
    companyAddress?: Address;
}



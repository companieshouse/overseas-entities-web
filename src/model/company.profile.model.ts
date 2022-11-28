import { Address } from "model/data.types.model";

export interface ICompanyDetails {
    companyName?: string;
    dateOfCreation?: string;
    companyAddress?: Address
    companyType?: string;
}

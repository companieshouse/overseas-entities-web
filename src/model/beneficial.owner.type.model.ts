import { BeneficialOwnerTypeChoice } from "./data.types.model";

/*
  The BeneficialOwnerType fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerTypeKey = "beneficialOwnerType";
export const BeneficialOwnerTypeKeys: string[] = [ "beneficialOwnerType" ];


export interface BeneficialOwnerType {
  beneficialOwnerType?: BeneficialOwnerTypeChoice;
}

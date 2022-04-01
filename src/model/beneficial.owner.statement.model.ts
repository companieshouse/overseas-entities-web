import { beneficialOwnerStatementChoice } from "./data.types.model";

export const BeneficialOwnerStatementKey = "beneficialOwnerStatement";
export const BeneficialOwnerStatementKeys: string[] = [ "beneficialOwnerStatement" ];

export interface BeneficialOwnerStatement {
    beneficialOwnerStatement?: beneficialOwnerStatementChoice;
}

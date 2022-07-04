import { Address, InputDate } from "./data.types.model";

export const OverseasEntityDueDiligenceKey = "overseas_entity_due_diligence";

/*
  The OverseasEntityDueDiligence fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const OverseasEntityDueDiligenceKeys: string[] = [
  "identity_date",
  "name",
  "identity_address",
  "email",
  "supervisory_name",
  "aml_number",
  "partner_name"
];

export interface OverseasEntityDueDiligence {
  identity_date?: InputDate;
  name?: string
  identity_address?: Address;
  email?: string
  supervisory_name?: string
  aml_number?: string
  partner_name?: string
}

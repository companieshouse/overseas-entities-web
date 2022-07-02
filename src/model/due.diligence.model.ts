import { Address, InputDate } from "./data.types.model";

export const DueDiligenceKey = "due_diligence";

/*
  The DueDiligence fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const DueDiligenceKeys: string[] = [
  "identity_date",
  "name",
  "identity_address",
  "email",
  "supervisory_name",
  "aml_number",
  "agent_code",
  "partner_name",
  "diligence"
];

export interface DueDiligence {
  identity_date?: InputDate;
  name?: string
  identity_address?: Address;
  email?: string
  supervisory_name?: string
  aml_number?: string
  agent_code?: string
  partner_name?: string
  diligence?: string
}

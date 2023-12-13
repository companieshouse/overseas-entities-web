import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import {
  entityType,
  presenterType,
  dataType,
  beneficialOwnerGovType,
  beneficialOwnerOtherType,
  beneficialOwnerStatementType,
  beneficialOwnerIndividualType,
  managingOfficerCorporateType,
  managingOfficerType,
  trustType,
  dueDiligenceType,
  overseasEntityDueDiligenceType,
  updateType
} from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    entity_name?: string;
    entity_number?: string;
    presenter?: presenterType.Presenter;
    due_diligence?: dueDiligenceType.DueDiligence;
    overseas_entity_due_diligence?: overseasEntityDueDiligenceType.OverseasEntityDueDiligence;
    entity?: entityType.Entity;
    beneficial_owners_statement?: beneficialOwnerStatementType.BeneficialOwnersStatementType;
    beneficial_owners_individual?: beneficialOwnerIndividualType.BeneficialOwnerIndividual[];
    beneficial_owners_corporate?: beneficialOwnerOtherType.BeneficialOwnerOther[];
    beneficial_owners_government_or_public_authority?: beneficialOwnerGovType.BeneficialOwnerGov[];
    managing_officers_individual?: managingOfficerType.ManagingOfficerIndividual[];
    managing_officers_corporate?: managingOfficerCorporateType.ManagingOfficerCorporate[];
    trusts?: trustType.Trust[];
    payment?: CreatePaymentRequest;
    overseas_entity_id?: string;
    transaction_id?: string;
    has_sold_land?: string;
    is_secure_register?: string;
    who_is_registering?: string;
    update?: updateType.Update;
    is_remove?: boolean;
}

export const ApplicationDataArrayType = [
  "beneficial_owners_individual",
  "beneficial_owners_corporate",
  "beneficial_owners_government_or_public_authority",
  "managing_officers_individual",
  "managing_officers_corporate",
  "trusts"
];

export type ApplicationDataType =
  | presenterType.Presenter
  | dueDiligenceType.DueDiligence
  | overseasEntityDueDiligenceType.OverseasEntityDueDiligence
  | entityType.Entity
  | beneficialOwnerOtherType.BeneficialOwnerOther
  | beneficialOwnerIndividualType.BeneficialOwnerIndividual
  | beneficialOwnerGovType.BeneficialOwnerGov
  | managingOfficerCorporateType.ManagingOfficerCorporate
  | managingOfficerType.ManagingOfficerIndividual
  | trustType.Trust
  | CreatePaymentRequest
  | dataType.Address
  | updateType.Update;

import { ApplicationData } from "../../model";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";

export const hasFetchedBoAndMoData = (appData: ApplicationData) =>
  appData[BeneficialOwnerOtherKey] !== undefined ||
    appData[BeneficialOwnerGovKey] !== undefined ||
    appData[BeneficialOwnerIndividualKey] !== undefined ||
    appData[ManagingOfficerCorporateKey] !== undefined ||
    appData[ManagingOfficerKey] !== undefined;

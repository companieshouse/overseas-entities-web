import { SOLD_LAND_FILTER_URL } from '../../config';

import { ApplicationData } from '../../model/application.model';
import { HasSoldLandKey, IsSecureRegisterKey } from '../../model/data.types.model';
import { PresenterKey } from '../../model/presenter.model';
import { EntityKey } from '../../model/entity.model';
import { BeneficialOwnerStatementKey } from '../../model/beneficial.owner.statement.model';
import { BeneficialOwnerGovKey } from '../../model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividualKey } from '../../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../../model/beneficial.owner.other.model';
import { ManagingOfficerCorporateKey } from '../../model/managing.officer.corporate.model';
import { ManagingOfficerKey } from '../../model/managing.officer.model';

export const NavigationErrorMessage = `Navigation error, redirecting to ${SOLD_LAND_FILTER_URL} page, status_code=302`;

export const checkHasSoldLand = (appData: ApplicationData): boolean => {
  return !appData || appData[HasSoldLandKey] !== "0";
};

export const checkIsSecureRegister = (appData: ApplicationData): boolean => {
  return checkHasSoldLand(appData) || appData[IsSecureRegisterKey] !== "0";
};

export const checkPresenterDetailsNotEntered = (appData: ApplicationData): boolean => {
  return checkIsSecureRegister(appData) || !appData[PresenterKey];
};

export const checkEntityDetailsNotEntered = (appData: ApplicationData): boolean => {
  return checkPresenterDetailsNotEntered(appData) || !appData[EntityKey];
};

export const checkBeneficialOwnersStatementDetailsNotEntered = (appData: ApplicationData): boolean => {
  return checkEntityDetailsNotEntered(appData) || !appData[BeneficialOwnerStatementKey];
};

export const checkBOsOrMOsDetailsNotEntered = (appData: ApplicationData): boolean => {
  return checkBeneficialOwnersStatementDetailsNotEntered(appData) ||
  (
    !appData[BeneficialOwnerIndividualKey] &&
    !appData[BeneficialOwnerOtherKey] &&
    !appData[BeneficialOwnerGovKey] &&
    !appData[ManagingOfficerKey] &&
    !appData[ManagingOfficerCorporateKey]
  );
};


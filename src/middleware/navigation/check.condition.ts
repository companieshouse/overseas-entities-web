import { SOLD_LAND_FILTER_URL } from '../../config';

import { ApplicationData } from '../../model/application.model';
import { HasSoldLandKey, IsSecureRegisterKey, EntityNameKey, EntityNumberKey } from '../../model/data.types.model';
import { PresenterKey } from '../../model/presenter.model';
import { EntityKey } from '../../model/entity.model';
import { BeneficialOwnerStatementKey } from '../../model/beneficial.owner.statement.model';
import { WhoIsRegisteringKey } from '../../model/who.is.making.filing.model';
import { OverseasEntityDueDiligenceKey } from '../../model/overseas.entity.due.diligence.model';
import { DueDiligenceKey } from '../../model/due.diligence.model';
import { UpdateKey } from '../../model/update.type.model';
import { checkBOsDetailsEntered, checkMOsDetailsEntered } from '../../utils/application.data';

export const NavigationErrorMessage = `Navigation error, redirecting to ${SOLD_LAND_FILTER_URL} page, status_code=302`;

const checkHasAppData = (appData: ApplicationData): boolean => {
  return appData && Object.keys(appData).length !== 0;
};

export const checkHasSoldLandDetailsEntered = (appData: ApplicationData): boolean => {
  return checkHasAppData(appData) && appData[HasSoldLandKey] === "0";
};

export const checkIsSecureRegisterDetailsEntered = (appData: ApplicationData): boolean => {
  return checkHasSoldLandDetailsEntered(appData) && appData[IsSecureRegisterKey] === "0";
};

export const checkOverseasNameDetailsEntered = (appData: ApplicationData): boolean => {
  return checkIsSecureRegisterDetailsEntered(appData) && (appData[EntityNameKey] || "").length !== 0;
};

export const checkPresenterDetailsEntered = (appData: ApplicationData): boolean => {
  return checkOverseasNameDetailsEntered(appData) && Object.keys(appData[PresenterKey] || {}).length !== 0;
};

export const checkDueDiligenceDetailsEntered = (appData: ApplicationData): boolean => {
  return checkPresenterDetailsEntered(appData) && (
    Object.keys(appData[OverseasEntityDueDiligenceKey] || {}).length !== 0 ||
    Object.keys(appData[DueDiligenceKey] || {}).length !== 0
  );
};

export const checkEntityDetailsEntered = (appData: ApplicationData): boolean => {
  return checkDueDiligenceDetailsEntered(appData) && Object.keys(appData[EntityKey] || {}).length !== 0;
};

export const checkBeneficialOwnersStatementDetailsEntered = (appData: ApplicationData): boolean => {
  return checkEntityDetailsEntered(appData) && Object.keys(appData[BeneficialOwnerStatementKey] || {}).length !== 0;
};

export const checkBOsOrMOsDetailsEntered = (appData: ApplicationData): boolean => {
  return checkBeneficialOwnersStatementDetailsEntered(appData) &&
  (checkBOsDetailsEntered(appData) || checkMOsDetailsEntered(appData));
};

// UPDATE journey

export const checkOverseasEntityNumberEntered = (appData: ApplicationData): boolean => {
  return checkHasAppData(appData) && (appData[EntityNumberKey] || "").length !== 0;
};

export const checkHasOverseasEntity = (appData: ApplicationData): boolean => {
  return checkHasAppData(appData) && appData[EntityKey] !== undefined;
};

export const checkHasDateOfCreation = (appData: ApplicationData): boolean => {
  return checkHasAppData(appData) && appData[UpdateKey]?.date_of_creation !== undefined;
};

export const checkUpdatePresenterEntered = (appData: ApplicationData): boolean => {
  return checkOverseasEntityNumberEntered(appData) && Object.keys(appData[PresenterKey] || {}).length !== 0;
};

export const checkEntityUpdateDetailsEntered = (appData: ApplicationData): boolean => {
  return checkUpdatePresenterEntered(appData) && Object.keys(appData[EntityKey] || {}).length !== 0;
};

export const checkWhoIsFilingEntered = (appData: ApplicationData): boolean => {
  return checkHasAppData(appData) && (appData[WhoIsRegisteringKey] || "").length !== 0;
};

export const checkBOsOrMOsDetailsEnteredUpdate = (appData: ApplicationData): boolean => {
  return checkBOsDetailsEntered(appData) || checkMOsDetailsEntered(appData);
};

export const checkHasUpdateDueDiligenceDetails = (appData: ApplicationData): boolean => {
  return checkUpdatePresenterEntered(appData) && (
    Object.keys(appData[OverseasEntityDueDiligenceKey] || {}).length !== 0 ||
    Object.keys(appData[DueDiligenceKey] || {}).length !== 0
  );
};

export const checkUpdateDueDiligenceDetailsEntered = (appData: ApplicationData): boolean => {
  return checkHasOverseasEntity(appData) && checkHasUpdateDueDiligenceDetails(appData);
};

/* eslint-disable require-await */
import { Request } from 'express';
import { ValidationError } from "express-validator";

import * as config from '../../config';
import { ApplicationData } from "model";
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { ErrorMessages } from '../../validation/error.messages';
import { checkCeasedDateOnOrAfterDateOfBirth, checkCeasedDateOnOrAfterTrustCreationDate, checkIndividualCeasedDateOnOrAfterInterestedPersonStartDate, checkLegalEntityCeasedDateOnOrAfterInterestedPersonStartDate, historicalBOEndDateContext, historicalBOStartDateContext } from '../../validation/fields/date.validation';
import { dateContext } from '../../validation/fields/helper/date.validation.helper';
import { checkDatePreviousToFilingDate } from '../../validation/custom.validation';
import isAllowedUrls from './isAllowedUrls';
import { BeneficialOwnerIndividualKey } from '../../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../../model/beneficial.owner.other.model';
import { BeneficialOwnerGovKey } from '../../model/beneficial.owner.gov.model';
import { isActiveFeature } from '../../utils/feature.flag';

export const checkTrustIndividualCeasedDate = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    const condition = appData?.entity_number ||
      req.body["stillInvolved"] === "0" ||
      req.body["ceasedDateDay"] ||
      req.body["ceasedDateMonth"] ||
      req.body["ceasedDateYear"];

    if (condition) {
      checkCeasedDateOnOrAfterDateOfBirth(req, ErrorMessages.DATE_BEFORE_BIRTH_DATE_CEASED_TRUSTEE);

      await checkCeasedDateOnOrAfterTrustCreationDate(req, ErrorMessages.DATE_BEFORE_TRUST_CREATION_DATE_CEASED_TRUSTEE);

      if (req.body["roleWithinTrust"] === RoleWithinTrustType.INTERESTED_PERSON
        && req.body["dateBecameIPDay"]
        && req.body["dateBecameIPMonth"]
        && req.body["dateBecameIPYear"]) {
        checkIndividualCeasedDateOnOrAfterInterestedPersonStartDate(req, ErrorMessages.DATE_BEFORE_INTERESTED_PERSON_START_DATE_CEASED_TRUSTEE);
      }

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: 'ceasedDate',
      location: 'body',
    });

    return errors;
  }
};

export const checkTrusteeLegalEntityCeasedDate = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    const condition = req.body["stillInvolved"] === "0" ||
      req.body["ceasedDateDay"] ||
      req.body["ceasedDateMonth"] ||
      req.body["ceasedDateYear"];

    if (condition) {
      await checkCeasedDateOnOrAfterTrustCreationDate(req, ErrorMessages.DATE_BEFORE_TRUST_CREATION_DATE_CEASED_TRUSTEE);

      if (req.body["roleWithinTrust"] === RoleWithinTrustType.INTERESTED_PERSON
        && req.body["interestedPersonStartDateDay"]
        && req.body["interestedPersonStartDateMonth"]
        && req.body["interestedPersonStartDateYear"]) {
        checkLegalEntityCeasedDateOnOrAfterInterestedPersonStartDate(req, ErrorMessages.DATE_BEFORE_INTERESTED_PERSON_START_DATE_CEASED_TRUSTEE);
      }

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: 'ceasedDate',
      location: 'body',
    });

    return errors;
  }
};

const is_date_within_filing_period_trusts = async (req: Request, trustDateContext: dateContext, error_message: string) => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_HISTORICAL_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_HISTORICAL_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    if (req.body[trustDateContext.dayInput.name]) {
      await checkDatePreviousToFilingDate(
        req,
        req.body[trustDateContext.dayInput.name], req.body[trustDateContext.monthInput.name], req.body[trustDateContext.yearInput.name],
        error_message
      );

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: trustDateContext.dateInput.name,
      location: 'body',
    });

    return errors;
  }

};

export const filingPeriodTrustStartDateValidations = async (req: Request) => is_date_within_filing_period_trusts(req, historicalBOStartDateContext, ErrorMessages.START_DATE_BEFORE_FILING_DATE);

export const filingPeriodTrustCeaseDateValidations = async (req: Request) => is_date_within_filing_period_trusts(req, historicalBOEndDateContext, ErrorMessages.CEASED_DATE_BEFORE_FILING_DATE);

export const beneficialOwnersTypeEmptyNOCList = async (req: Request, appData: ApplicationData): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.BENEFICIAL_OWNER_TYPE_PAGE],
    [config.UPDATE_AN_OVERSEAS_ENTITY_URL, config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    const isActive = isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC);

    const boiList = checkIfBeneficialOwnerHasNOC(appData?.[BeneficialOwnerIndividualKey] ?? [], isActive);
    const booList = checkIfBeneficialOwnerHasNOC(appData?.[BeneficialOwnerOtherKey] ?? [], isActive);
    const bogList = checkIfBeneficialOwnerHasNOC(appData?.[BeneficialOwnerGovKey] ?? [], isActive);

    const boList: string[] = [...boiList, ...booList, ...bogList];

    if (boList.length) {
      throw new Error(`${ErrorMessages.MISSING_NATURE_OF_CONTROL} ${boList.join(", ")}`);
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: 'beneficial_owner_list',
      location: 'body',
    });

    return errors;
  }
};

const checkIfBeneficialOwnerHasNOC = (beneficialOwner, isActive: boolean): string[] => {
  return beneficialOwner?.filter(bo =>
    !bo?.beneficial_owner_nature_of_control_types?.length &&
      !bo?.trustees_nature_of_control_types?.length &&
      !bo?.non_legal_firm_control_nature_of_control_types?.length &&
      !bo?.trust_control_nature_of_control_types?.length &&
      !bo?.owner_of_land_person_nature_of_control_jurisdictions?.length &&
      !bo?.owner_of_land_other_entity_nature_of_control_jurisdictions?.length &&
      ((!isActive && !bo?.non_legal_firm_members_nature_of_control_types?.length)
      || (isActive && (bo?.non_legal_firm_members_nature_of_control_types?.length || !bo?.non_legal_firm_members_nature_of_control_types?.length))
      )
  ).map(bo => bo?.first_name ?? bo?.name);
};


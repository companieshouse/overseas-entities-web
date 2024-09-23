import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { principal_address_validations, principal_service_address_validations } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { checkAtLeastOneFieldHasValue } from "./custom.validation";
import {
  start_date_validations,
  ceased_date_validations
} from "./fields/date.validation";
import { isActiveFeature } from "../utils/feature.flag";
import { FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC } from "../config";

export const beneficial_owner_gov_name_validation = [
  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.BO_GOV_NAME)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
];

export const is_service_address_same_as_principal_address_validation = [
  body("is_service_address_same_as_principal_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS)
];

export const legal_form_validation = [
  body("legal_form")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS)
];

export const law_governed_validation = [
  body("law_governed")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS)
];

export const nature_of_control_validation = [
  body("beneficial_owner_nature_of_control_types").custom((value, { req }) => {
    const NOCS_TO_CHECK = [
      req.body.beneficial_owner_nature_of_control_types,
      req.body.non_legal_firm_members_nature_of_control_types
    ];

    if (isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)) {
      NOCS_TO_CHECK.push(
        req.body.trust_control_nature_of_control_types,
        req.body.non_legal_firm_control_nature_of_control_types,
        req.body.owner_of_land_person_nature_of_control_jurisdictions,
        req.body.owner_of_land_other_entity_nature_of_control_jurisdictions);
    }
    return checkAtLeastOneFieldHasValue(ErrorMessages.SELECT_NATURE_OF_CONTROL, ...NOCS_TO_CHECK);
  })
];

export const is_on_sanctions_list_validation = [
  body("is_on_sanctions_list")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST)
];

export const beneficialOwnerGov = [
  ...beneficial_owner_gov_name_validation,

  ...principal_address_validations(),

  ...is_service_address_same_as_principal_address_validation,

  ...principal_service_address_validations,

  ...legal_form_validation,

  ...law_governed_validation,

  ...nature_of_control_validation,

  ...is_on_sanctions_list_validation,

  ...start_date_validations,
];

export const updateBeneficialOwnerGov = [

  ...beneficialOwnerGov,

  body("is_still_bo").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_STILL_BENEFICIAL_OWNER),

  ...ceased_date_validations
];

export const updateReviewBeneficialOwnerGovValidator = [

  ...beneficial_owner_gov_name_validation,

  ...principal_address_validations(),

  ...is_service_address_same_as_principal_address_validation,

  ...principal_service_address_validations,

  ...legal_form_validation,

  ...law_governed_validation,

  ...nature_of_control_validation,

  ...is_on_sanctions_list_validation,

  body("is_still_bo").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_STILL_BENEFICIAL_OWNER),

  ...ceased_date_validations
];

import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue } from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { isActiveFeature } from "../../utils/feature.flag";
import * as config from "../../config";

export const nature_of_control_validations = [
  body("beneficial_owner_nature_of_control_types").custom((value, { req }) => {
    const NOCS_TO_CHECK = [
      req.body.beneficial_owner_nature_of_control_types,
      req.body.trustees_nature_of_control_types,
      req.body.non_legal_firm_members_nature_of_control_types
    ];

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)) {
      NOCS_TO_CHECK.push(req.body.trust_control_nature_of_control_types, req.body.owner_of_land_person_nature_of_control_jurisdictions, req.body.owner_of_land_other_entity_nature_of_control_jurisdictions);
    }
    return checkAtLeastOneFieldHasValue(ErrorMessages.SELECT_NATURE_OF_CONTROL, ...NOCS_TO_CHECK);
  })
];

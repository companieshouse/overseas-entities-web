import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken, ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { DESCRIPTION, REFERENCE } from "../../src/config";
import {
  APPLICATION_DATA_KEY,
  beneficialOwnerGovType,
  beneficialOwnerOtherType,
  ApplicationData,
  beneficialOwnerIndividualType,
  beneficialOwnerStatementType,
  entityType,
  managingOfficerCorporateType,
  managingOfficerType,
  presenterType
} from "../../src/model";
import {
  corpNatureOfControl,
  NatureOfControlType,
  yesNoResponse
} from "../../src/model/data.types.model";
import { ANY_MESSAGE_ERROR } from "./text.mock";

export const userMail = "userWithPermission@ch.gov.uk";
export const ACCESS_TOKEN_MOCK: IAccessToken = { access_token: 'accessToken' };

const SIGN_IN_INFO = {
  [SignInInfoKeys.SignedIn]: 1,
  [SignInInfoKeys.UserProfile]: { [UserProfileKeys.Email]: userMail },
  [SignInInfoKeys.AccessToken]: ACCESS_TOKEN_MOCK
};

export function getSessionRequestWithPermission(): Session {
  return new Session({
    [SessionKey.SignInInfo]: SIGN_IN_INFO as ISignInInfo
  });
}

export function getSessionRequestWithExtraData(): Session {
  const session = getSessionRequestWithPermission();
  session.setExtraData(APPLICATION_DATA_KEY, APPLICATION_DATA_MOCK);
  return session;
}

export const ADDRESS = {
  property_name_number: "1",
  line_1: "addressLine1",
  line_2: "addressLine2",
  town: "town",
  county: "county",
  country: "country",
  postcode: "BY 2"
};

export const SERVICE_ADDRESS = {
  property_name_number: "service1",
  line_1: "serviceAddressLine1",
  line_2: "serviceAddressLine2",
  town: "serviceTown",
  county: "serviceCounty",
  country: "serviceCountry",
  postcode: "SBY 2"
};

export const ADDRESS_FIELDS_MOCK = ["propertyNameNumber", "serviceAddressLine1", "serviceAddressLine2", "serviceAddressTown", "serviceAddressCounty", "country", "serviceAddressPostcode"];
export const ADDRESS_MOCK = {
  propertyNameNumber: "1",
  serviceAddressLine1: "addressLine1",
  serviceAddressLine2: "addressLine2",
  serviceAddressTown: "town",
  serviceAddressCounty: "county",
  country: "country",
  serviceAddressPostcode: "BY 2"
};

export const ENTITY_OBJECT_MOCK: entityType.Entity = {
  name: "overseasEntityName",
  incorporation_country: "incorporationCountry",
  principal_address: ADDRESS,
  is_service_address_same_as_principal_address: 1,
  service_address: {},
  email: "email",
  legal_form: "legalForm",
  law_governed: "governedLaw",
  public_register_name: "publicRegister",
  registration_number: "123"
};

export const ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS = {
  ...ENTITY_OBJECT_MOCK,
  is_service_address_same_as_principal_address: 0,
  service_address: SERVICE_ADDRESS
};

export const BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK =
  beneficialOwnerStatementType.BeneficialOwnerStatementType
    .all_identified_all_details;

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
  corporation_name: "TestCorporation",
  principal_address: ADDRESS,
  is_same_address: yesNoResponse.Yes,
  service_address: ADDRESS,
  legal_form: "TheLegalForm",
  law_governed: "TheLaw",
  register_name: "ThisRegister",
  register_number: "123456789",
  public_register: yesNoResponse.Yes,
  start_date: {
    day: 1,
    month: 1,
    year: 2011
  },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.over_25_percent_of_voting_rights],
  trustees_nature_of_control_types: [NatureOfControlType.appoint_or_remove_majority_board_directors],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.over_25_percent_of_shares],
  is_sanctioned: yesNoResponse.No
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  first_name: "Ivan",
  last_name: "Drago",
  date_of_birth: { day: 21, month: 3, year: 1947 },
  nationality: "Russian",
  usual_residential_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: 1, month: 3, year: 1999 },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.over_25_percent_of_shares],
  trustees_nature_of_control_types: [NatureOfControlType.over_25_percent_of_voting_rights],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.appoint_or_remove_majority_board_directors],
  is_on_sanctions_list: 0
};

export const BENEFICIAL_OWNER_GOV_OBJECT_MOCK: beneficialOwnerGovType.BeneficialOwnerGov = {
  corporationLawGoverned: "a11",
  corporationName: "my company name",
  corporationNatureOfControl: corpNatureOfControl.influence,
  corporationStartDate: {
    day: 12,
    month: 11,
    year: 1965
  },
  isServiceAddressSameAsPrincipalAddress: yesNoResponse.No,
  isOnSanctionsList: yesNoResponse.No,
  principalAddress: ADDRESS,
  serviceAddress: ADDRESS
};

export const MANAGING_OFFICER_OBJECT_MOCK: managingOfficerType.ManagingOfficer = {
  fullName: "Andrei Nikolayevich Bolkonsky",
  hasAFormerName: yesNoResponse.No,
  formerName: "",
  dateOfBirth: {
    day: 4,
    month: 11,
    year: 1830
  },
  nationality: "Russian",
  usualResidentialAddress: ADDRESS,
  businessOccupation: "Prince",
  roleAndResponsibilities: "None"
};

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK: managingOfficerCorporateType.ManagingOfficerCorporate = {
  officerName: "Joe Bloggs",
  usualResidentialAddress: ADDRESS,
  serviceAddress: ADDRESS,
  isSameAddress: yesNoResponse.Yes,
  whereOfficerRegistered: "France",
  legalForm: "legalForm",
  legalAuthority: "LegAuth",
  registrationNumber: "123456789",
  startDate: {
    day: 1,
    month: 1,
    year: 2011
  }
};

const PRESENTER_OBJECT_MOCK = {
  full_name: "fullName",
  phone_number: "phoneNumber",
  role: "other",
  role_title: "roleTitle",
  registration_number: "123"
} as presenterType.Presenter;

export const APPLICATION_DATA_MOCK: ApplicationData = {
  [presenterType.PresenterKey]: PRESENTER_OBJECT_MOCK,
  [entityType.EntityKey]: ENTITY_OBJECT_MOCK,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ BENEFICIAL_OWNER_GOV_OBJECT_MOCK ],
  [managingOfficerType.ManagingOfficerKey]: [ MANAGING_OFFICER_OBJECT_MOCK ],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [ MANAGING_OFFICER_CORPORATE_OBJECT_MOCK ]
};

export const ERROR: Error = new Error(ANY_MESSAGE_ERROR);
export const TRANSACTION_ID = "12345";
export const OVERSEAS_ENTITY_ID = "54321";
export const TRANSACTION = { reference: REFERENCE, description: DESCRIPTION };

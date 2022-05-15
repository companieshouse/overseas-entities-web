import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken, ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { DESCRIPTION, PAYMENT_PAID, PAYMENT_REQUIRED_HEADER, REFERENCE, REGISTER_AN_OVERSEAS_ENTITY_URL } from "../../src/config";
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
  presenterType,
  paymentType
} from "../../src/model";
import {
  NatureOfControlType,
  yesNoResponse
} from "../../src/model/data.types.model";
import { ANY_MESSAGE_ERROR } from "./text.mock";

export const ERROR: Error = new Error(ANY_MESSAGE_ERROR);
export const TRANSACTION_ID = "12345";
export const OVERSEAS_ENTITY_ID = "54321";
export const TRANSACTION = { reference: `${REFERENCE}_${TRANSACTION_ID}`, description: DESCRIPTION };
export const PAYMENT_URL = "http://payment";
export const STATE_ID = "ad83863d-7713-4b39-a625-3ec282d6710e";
export const PAYMENT_HEADER = { [PAYMENT_REQUIRED_HEADER]: PAYMENT_URL };
export const TRANSACTION_CLOSED_RESPONSE = {
  httpStatusCode: 202,
  resource: {
    ...TRANSACTION,
    status: "closed"
  },
};
export const PAYMENT_LINK_JOURNEY = "PAYMENT_LINK_JOURNEY";
export const STATE = `&state=${STATE_ID}`;
export const STATUS_PAID = `&status=${PAYMENT_PAID}`;
export const PAYMENT_QUERY_STRING = `?ref=${REFERENCE}_${TRANSACTION_ID}${STATE}${STATUS_PAID}`;
export const PAYMENT_WITH_TRANSACTION_URL = `${REGISTER_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/overseas-entity/${OVERSEAS_ENTITY_ID}/payment`;
export const PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING = `${PAYMENT_WITH_TRANSACTION_URL}${PAYMENT_QUERY_STRING}`;

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

export const SERVICE_ADDRESS_MOCK = {
  service_address_property_name_number: "1",
  service_address_line_1: "addressLine1",
  service_address_line_2: "addressLine2",
  service_address_town: "town",
  service_address_county: "county",
  service_address_country: "country",
  service_address_postcode: "BY 2"
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
  registration_number: "123",
  is_on_register_in_country_formed_in: 1
};

export const ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS = {
  ...ENTITY_OBJECT_MOCK,
  is_service_address_same_as_principal_address: 0,
  service_address: SERVICE_ADDRESS
};

export const BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK =
  beneficialOwnerStatementType.BeneficialOwnersStatementType
    .ALL_IDENTIFIED_ALL_DETAILS;

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
  name: "TestCorporation",
  principal_address: ADDRESS,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  service_address: ADDRESS,
  legal_form: "TheLegalForm",
  law_governed: "TheLaw",
  public_register_name: "ThisRegister",
  registration_number: "123456789",
  is_on_register_in_country_formed_in: yesNoResponse.Yes,
  start_date: { day: "1", month: "1", year: "2011" },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  trustees_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: 0
};


export const REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY = {
  name: "",
  principal_address: {},
  is_service_address_same_as_principal_address: "",
  service_address: {},
  legal_form: "",
  law_governed: "",
  public_register_name: "",
  registration_number: "",
  is_on_register_in_country_formed_in: "",
  start_date: { "start_date-day": "", "start_date-month": "", "start_date-year": "" },
  beneficial_owner_nature_of_control_types: "",
  trustees_nature_of_control_types: "",
  non_legal_firm_members_nature_of_control_types: "",
  is_on_sanctions_list: ""
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  first_name: "Ivan",
  last_name: "Drago",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Russian",
  usual_residential_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: "1", month: "3", year: "1999" },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  is_on_sanctions_list: 0
};

export const REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY = {
  first_name: "",
  last_name: "",
  date_of_birth: { 'date_of_birth-day': "",  "date_of_birth-month": "", "date_of_birth-year": "" },
  nationality: "",
  usual_residential_address: {},
  is_service_address_same_as_usual_residential_address: "",
  service_address: {},
  start_date: { "start_date-day": "", "start_date-month": "", "start_date-year": "" },
  beneficial_owner_nature_of_control_types: "",
  trustees_nature_of_control_types: "",
  non_legal_firm_members_nature_of_control_types: "",
  is_on_sanctions_list: ""
};

export const BENEFICIAL_OWNER_GOV_OBJECT_MOCK: beneficialOwnerGovType.BeneficialOwnerGov = {
  name: "my company name",
  principal_address: ADDRESS,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  service_address: ADDRESS,
  legal_form: "LegalForm",
  law_governed: "a11",
  start_date: { day: "12", month: "11", year: "1965" },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
};

export const REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY = {
  name: "",
  principal_address: {},
  is_service_address_same_as_principal_address: "",
  service_address: {},
  legal_form: "",
  law_governed: "",
  start_date: { "start_date-day": "", "start_date-month": "", "start_date-year": "" },
  beneficial_owner_nature_of_control_types: "",
  non_legal_firm_members_nature_of_control_types: "",
};

export const MANAGING_OFFICER_OBJECT_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  first_name: "Joe",
  last_name: "Bloggs",
  has_former_names: yesNoResponse.Yes,
  former_names: "Some name",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Utopian",
  usual_residential_address: ADDRESS,
  service_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
  occupation: "Some Occupation",
  role_and_responsibilities: "Some role and responsibilities"
};

export const REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY = {
  first_name: "",
  last_name: "",
  has_former_names: "",
  former_names: "",
  date_of_birth: { 'date_of_birth-day': "",  "date_of_birth-month": "", "date_of_birth-year": "" },
  nationality: "",
  usual_residential_address: {},
  service_address: {},
  is_service_address_same_as_usual_residential_address: "",
  occupation: "",
  role_and_responsibilities: ""
};

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK: managingOfficerCorporateType.ManagingOfficerCorporate = {
  name: "Joe Bloggs Ltd",
  principal_address: ADDRESS,
  service_address: ADDRESS,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  legal_form: "legalForm",
  law_governed: "LegAuth",
  is_on_register_in_country_formed_in: yesNoResponse.Yes,
  public_register_name: "register",
  registration_number: "123456789",
  start_date: { day: "1", month: "1", year: "2011" }
};

export const PRESENTER_OBJECT_MOCK: presenterType.Presenter = {
  full_name: "fullName",
  email: "user@domain.roe"
} ;

export const PAYMENT_OBJECT_MOCK: paymentType.Payment = {
  redirectUri: PAYMENT_WITH_TRANSACTION_URL,
  reference: `${REFERENCE}_${TRANSACTION_ID}`,
  resource: "any resource",
  state: "any state",
  transactionId: TRANSACTION_ID,
  overseasEntityId: OVERSEAS_ENTITY_ID,
} ;

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

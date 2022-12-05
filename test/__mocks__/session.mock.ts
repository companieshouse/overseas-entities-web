import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { Session } from "@companieshouse/node-session-handler";
import { AccessTokenKeys } from '@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys';
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
  trustType,
  dueDiligenceType
} from "../../src/model";
import {
  HasSoldLandKey,
  IsSecureRegisterKey,
  NatureOfControlType,
  OverseasEntityKey,
  PaymentKey,
  Transactionkey,
  yesNoResponse
} from "../../src/model/data.types.model";
import { TrustKey, Trust } from "../../src/model/trust.model";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../src/model/who.is.making.filing.model";
import { DUE_DILIGENCE_OBJECT_MOCK } from "./due.diligence.mock";
import { ADDRESS } from "./fields/address.mock";
import { DATE_OF_BIRTH, START_DATE } from "./fields/date.mock";
import { ANY_MESSAGE_ERROR } from "./text.mock";

export const BO_GOV_ID = "10722c3c-9301-4f46-ad8b-b30f5dcd76a0";
export const BO_GOV_ID_URL = "/" + BO_GOV_ID;
export const BO_IND_ID = "7ab403a0-4459-4ac0-b500-6d6f314da5b2";
export const BO_IND_ID_URL = "/" + BO_IND_ID;
export const BO_OTHER_ID = "e12267a4-ae92-4cfe-bea5-e3731463b2b1";
export const BO_OTHER_ID_URL = "/" + BO_OTHER_ID;
export const MO_IND_ID = "0dccbd5e-cc09-4f8f-828e-f7cc9fc352ac";
export const MO_IND_ID_URL = "/" + MO_IND_ID;
export const MO_CORP_ID = "2df18e59-74dd-42d7-9494-8d40b953ddbe";
export const MO_CORP_ID_URL = "/" + MO_CORP_ID;

export const COMPANY_NAME = "my company name";

export const EMAIL_ADDRESS = "user@domain.roe";
export const PUBLIC_REGISTER_NAME = "publicRegister";
export const PUBLIC_REGISTER_JURISDICTION = "jurisdiction";
export const REGISTRATION_NUMBER = "123";

export const ERROR: Error = new Error(ANY_MESSAGE_ERROR);
export const TRANSACTION_ID = "038138-572616-526863";
export const OVERSEAS_ENTITY_ID = "6281fe0790bdb128549bf09f";
export const TRANSACTION = {
  id: TRANSACTION_ID,
  reference: `${REFERENCE}_${TRANSACTION_ID}`,
  description: DESCRIPTION
};
export const PAYMENT_URL = "http://payment";
export const STATE_ID = "ad83863d-7713-4b39-a625-3ec282d6710e";
export const PAYMENT_HEADER = { [PAYMENT_REQUIRED_HEADER]: PAYMENT_URL };
export const TRANSACTION_POST_PARAMS = {
  reference: REFERENCE,
  companyName: "overseasEntityName",
  description: DESCRIPTION
};
export const TRANSACTION_CLOSED_PARAMS = {
  id: TRANSACTION_ID,
  reference: `${REFERENCE}_${OVERSEAS_ENTITY_ID}`,
  description: DESCRIPTION,
  status: "closed"
};
export const TRANSACTION_CLOSED_RESPONSE = {
  httpStatusCode: 200,
  resource: TRANSACTION_CLOSED_PARAMS
};
export const TRANSACTION_WITH_PAYMENT_HEADER = {
  ...TRANSACTION_CLOSED_RESPONSE,
  headers: PAYMENT_HEADER
};
export const PAYMENT_LINK_JOURNEY = "PAYMENT_LINK_JOURNEY";
export const STATE = `&state=${STATE_ID}`;
export const STATUS_PAID = `&status=${PAYMENT_PAID}`;
export const STATUS_DECLINED = `&status=DECLINED`;
export const REFERENCE_QUERY_STRING = `?ref=${REFERENCE}_${TRANSACTION_ID}`;
export const PAYMENT_QUERY_STRING = `${REFERENCE_QUERY_STRING}${STATE}${STATUS_PAID}`;
export const PAYMENT_WITH_TRANSACTION_URL = `${REGISTER_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/overseas-entity/${OVERSEAS_ENTITY_ID}/payment`;
export const PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING = `${PAYMENT_WITH_TRANSACTION_URL}${PAYMENT_QUERY_STRING}`;
export const PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING = `${PAYMENT_WITH_TRANSACTION_URL}${REFERENCE_QUERY_STRING}${STATE}${STATUS_DECLINED}`;
export const PAYMENT_JOURNEY_URL = "PAYMENT_JOURNEY_URL";
export const RR_CARRIAGE_RETURN = "abc-xyzž \r\n def";
export const PAYMENT_MOCK_VALUE = {
  resource: {
    links: { journey: PAYMENT_JOURNEY_URL },
    status: PAYMENT_PAID
  } as Payment,
  httpStatusCode: 200
};
export const PAYMENT_FAILURE_MOCK_VALUE = { errors: [ { error: ANY_MESSAGE_ERROR }], httpStatusCode: 500 };

export const userMail = "userWithPermission@ch.gov.uk";
export const mockNewAccessToken = "HmSD2E5RvLirVF6wIZY7tN2TgOzKwRpffPcTYi50S";
export const ACCESS_TOKEN_MOCK: IAccessToken = { [AccessTokenKeys.AccessToken]: 'accessToken' };
export const REFRESH_TOKEN_MOCK: IAccessToken = { [AccessTokenKeys.RefreshToken]: 'refreshToken' };

const SIGN_IN_INFO = {
  [SignInInfoKeys.SignedIn]: 1,
  [SignInInfoKeys.UserProfile]: { [UserProfileKeys.Email]: userMail },
  [SignInInfoKeys.AccessToken]: {
    ...ACCESS_TOKEN_MOCK,
    ...REFRESH_TOKEN_MOCK
  }
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

export const PRINCIPAL_ADDRESS_MOCK = {
  principal_address_property_name_number: "1",
  principal_address_line_1: "addressLine1",
  principal_address_line_2: "addressLine2",
  principal_address_town: "town",
  principal_address_county: "county",
  principal_address_country: "country",
  principal_address_postcode: "BY 2"
};

export const RESIDENTIAL_ADDRESS_MOCK = {
  usual_residential_address_property_name_number: "residential address 1",
  usual_residential_address_line_1: "residential address addressLine1",
  usual_residential_address_line_2: "residential address addressLine2",
  usual_residential_address_town: "residential address town",
  usual_residential_address_county: "residential address county",
  usual_residential_address_country: "residential address country",
  usual_residential_address_postcode: "res. add. BY 2"
};

export const ENTITY_OBJECT_MOCK: entityType.Entity = {
  name: "overseasEntityName",
  incorporation_country: "incorporationCountry",
  principal_address: ADDRESS,
  is_service_address_same_as_principal_address: 1,
  service_address: {},
  email: "entity.email@test.com",
  legal_form: "legalForm",
  law_governed: "governedLaw",
  public_register_name: PUBLIC_REGISTER_NAME,
  public_register_jurisdiction: PUBLIC_REGISTER_JURISDICTION,
  registration_number: REGISTRATION_NUMBER,
  is_on_register_in_country_formed_in: 1
};

export const ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS = {
  ...ENTITY_OBJECT_MOCK,
  is_service_address_same_as_principal_address: 0,
  service_address: SERVICE_ADDRESS
};

export const ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS = {
  name: "overseasEntityName",
  incorporation_country: "incorporationCountry",
  is_service_address_same_as_principal_address: "0",
  email: "email@test.gov.uk",
  legal_form: "legalForm",
  law_governed: "governedLaw",
  public_register_name: PUBLIC_REGISTER_NAME,
  public_register_jurisdiction: PUBLIC_REGISTER_JURISDICTION,
  registration_number: REGISTRATION_NUMBER,
  is_on_register_in_country_formed_in: "1",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK
};

export const ENTITY_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES = {
  name: "overseasEntityName",
  incorporation_country: "incorporationCountry",
  is_service_address_same_as_principal_address: "0",
  email: " " + EMAIL_ADDRESS + " ",
  legal_form: "legalForm",
  law_governed: "governedLaw",
  public_register_name: "publicRegister",
  public_register_jurisdiction: "jurisdiction",
  registration_number: "123",
  is_on_register_in_country_formed_in: "1",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK
};

export const BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK =
  beneficialOwnerStatementType.BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS;

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
  id: BO_OTHER_ID,
  name: "TestCorporation",
  principal_address: ADDRESS,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  service_address: ADDRESS,
  legal_form: "TheLegalForm",
  law_governed: "TheLaw",
  public_register_name: "ThisRegister",
  registration_number: "123456789",
  is_on_register_in_country_formed_in: yesNoResponse.Yes,
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  trustees_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: 0,
  ...START_DATE,
  trust_ids: []
};

export const BENEFICIAL_OWNER_OTHER_NO_TRUSTS_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
  id: BO_OTHER_ID,
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
  trustees_nature_of_control_types: [],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: 0,
  trust_ids: []
};

export const BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS = {
  name: "TestCorporation",
  is_service_address_same_as_principal_address: "1",
  legal_form: "TheLegalForm",
  law_governed: "TheLaw",
  public_register_name: "ThisRegister",
  registration_number: "123456789",
  is_on_register_in_country_formed_in: "1",
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  trustees_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: "0",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK,
  ...START_DATE
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
  id: BO_IND_ID,
  first_name: "Ivan",
  last_name: "Drago",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Russian",
  second_nationality: "",
  usual_residential_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: "1", month: "3", year: "1999" },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  is_on_sanctions_list: 1,
  trust_ids: []
};

export const BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...START_DATE,
  ...DATE_OF_BIRTH
};

export const BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ...START_DATE,
  ...DATE_OF_BIRTH
};

export const BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ...START_DATE,
  ...DATE_OF_BIRTH
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  is_on_sanctions_list: 1,
  is_service_address_same_as_usual_residential_address: 0,
  ...START_DATE,
  ...DATE_OF_BIRTH
};

export const BENEFICIAL_OWNER_INDIVIDUAL_REPLACE: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  first_name: "new name",
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...START_DATE,
  ...DATE_OF_BIRTH
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ...SERVICE_ADDRESS_MOCK,
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...START_DATE,
  ...DATE_OF_BIRTH
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  is_service_address_same_as_usual_residential_address: 0,
  ...SERVICE_ADDRESS_MOCK,
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...START_DATE,
  ...DATE_OF_BIRTH
};

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  ...PRINCIPAL_ADDRESS_MOCK,
  ...START_DATE,
  legal_form: "LegalForm",
  law_governed: "1234",
  is_on_register_in_country_formed_in: yesNoResponse.No
};

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  is_service_address_same_as_principal_address: yesNoResponse.No,
  ...PRINCIPAL_ADDRESS_MOCK,
  ...START_DATE,
  legal_form: "LegalForm",
  law_governed: "1234",
  is_on_register_in_country_formed_in: yesNoResponse.No
};

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  ...PRINCIPAL_ADDRESS_MOCK,
  ...START_DATE,
  legal_form: "LegalForm",
  law_governed: "1234",
  is_on_register_in_country_formed_in: yesNoResponse.Yes
};

export const BENEFICIAL_OWNER_OTHER_REPLACE: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  ...PRINCIPAL_ADDRESS_MOCK,
  ...START_DATE,
  legal_form: "LegalForm",
  law_governed: "1234",
  is_on_register_in_country_formed_in: yesNoResponse.Yes
};

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  ...PRINCIPAL_ADDRESS_MOCK,
  ...START_DATE,
  legal_form: "LegalForm",
  law_governed: "1234",
  is_on_register_in_country_formed_in: yesNoResponse.No
};

export const BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ...START_DATE
};

export const BENEFICIAL_OWNER_OTHER_RADIO_BUTTONS_ONLY: beneficialOwnerOtherType.BeneficialOwnerOther = {
  id: BO_IND_ID,
  is_on_sanctions_list: 1,
  is_service_address_same_as_principal_address: 0,
  ...START_DATE
};

export const BENEFICIAL_OWNER_OTHER_REQ_BODY_MOCK_WITH_MISSING_SERVICE_ADDRESS: beneficialOwnerOtherType.BeneficialOwnerOther = {
  id: BO_OTHER_ID,
  name: "TestCorporation",
  is_service_address_same_as_principal_address: yesNoResponse.No,
  principal_address: ADDRESS,
  legal_form: "TheLegalForm",
  law_governed: "TheLaw",
  public_register_name: "ThisRegister",
  registration_number: "123456789",
  is_on_register_in_country_formed_in: yesNoResponse.Yes,
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  trustees_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: 0,
  ...START_DATE,
  trust_ids: []
};

export const BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTS_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  first_name: "Ivan",
  last_name: "Drago",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Russian",
  usual_residential_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: "1", month: "3", year: "1999" },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  trustees_nature_of_control_types: [],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  is_on_sanctions_list: 0,
  trust_ids: []
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

export const BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES: beneficialOwnerGovType.BeneficialOwnerGov = {
  id: BO_IND_ID,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  service_address: ADDRESS
};

export const BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO: beneficialOwnerGovType.BeneficialOwnerGov = {
  id: BO_IND_ID,
  is_service_address_same_as_principal_address: yesNoResponse.No,
  service_address: ADDRESS
};

export const BENEFICIAL_OWNER_GOV_OBJECT_MOCK: beneficialOwnerGovType.BeneficialOwnerGov = {
  id: BO_GOV_ID,
  name: COMPANY_NAME,
  principal_address: ADDRESS,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  service_address: ADDRESS,
  legal_form: "LegalForm",
  law_governed: "a11",
  start_date: { day: "12", month: "11", year: "1965" },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: 1
};

export const BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS = {
  name: COMPANY_NAME,
  is_service_address_same_as_principal_address: "1",
  legal_form: "LegalForm",
  law_governed: "a11",
  ...START_DATE,
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: "1",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK
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
  non_legal_firm_members_nature_of_control_types: ""
};

export const REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION: beneficialOwnerGovType.BeneficialOwnerGov = {
  id: BO_GOV_ID,
  name: COMPANY_NAME,
  principal_address: ADDRESS,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  service_address: ADDRESS,
  legal_form: "LegalForm",
  law_governed: "a11",
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: 1
};

export const MANAGING_OFFICER_OBJECT_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  first_name: "Joe",
  last_name: "Bloggs",
  has_former_names: yesNoResponse.Yes,
  former_names: "Some name",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Malawian",
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
  occupation: " ",
  role_and_responsibilities: ""
};

export const REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS = {
  first_name: "some first name",
  last_name: "some last name",
  has_former_names: "0",
  former_names: "",
  nationality: "some nationality",
  is_service_address_same_as_usual_residential_address: "0",
  occupation: "some occupation",
  role_and_responsibilities: "some role and responsibilities",
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK,
  ...DATE_OF_BIRTH
};

export const REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION = {
  first_name: "some first name",
  last_name: "some last name",
  has_former_names: "0",
  former_names: "",
  nationality: "some nationality",
  is_service_address_same_as_usual_residential_address: "0",
  occupation: "some occupation",
  role_and_responsibilities: "some role and responsibilities",
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK
};

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK: managingOfficerCorporateType.ManagingOfficerCorporate = {
  id: MO_CORP_ID,
  name: "Joe Bloggs Ltd",
  principal_address: ADDRESS,
  service_address: ADDRESS,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  legal_form: "legalForm",
  law_governed: "LegAuth",
  is_on_register_in_country_formed_in: yesNoResponse.Yes,
  public_register_name: "register",
  registration_number: "123456789",
  role_and_responsibilities: "role and responsibilities text",
  contact_full_name: "Joe Bloggs",
  contact_email: "jbloggs@bloggs.co.ru"
};

export const REQ_BODY_MANAGING_OFFICER_CORPORATE_OBJECT_EMPTY = {
  name: "",
  is_service_address_same_as_principal_address: "",
  legal_form: "",
  law_governed: "",
  is_on_register_in_country_formed_in: "",
  public_register_name: "",
  registration_number: "",
  role_and_responsibilities: " ",
  contact_full_name: " ",
  usual_residential_address: {},
  service_address: {}
};

export const REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS = {
  name: "Joe Bloggs Ltd",
  is_service_address_same_as_principal_address: "0",
  legal_form: "legalForm",
  law_governed: "LegAuth",
  is_on_register_in_country_formed_in: "1",
  public_register_name: "register",
  registration_number: "123456789",
  role_and_responsibilities: "role and responsibilities text",
  contact_full_name: "contact name",
  contact_email: "jbloggs@bloggs.co.ru",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK,
  ...START_DATE
};

export const MANAGING_OFFICER_CORPORATE_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES = {
  name: "Joe Bloggs Ltd",
  is_service_address_same_as_principal_address: "0",
  legal_form: "legalForm",
  law_governed: "LegAuth",
  is_on_register_in_country_formed_in: "1",
  public_register_name: "register",
  registration_number: "123456789",
  role_and_responsibilities: "role and responsibilities text",
  contact_full_name: "contact name",
  contact_email: " " + EMAIL_ADDRESS + " ",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK,
  ...START_DATE
};

export const MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
  service_address: ADDRESS
};

export const MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  is_service_address_same_as_usual_residential_address: yesNoResponse.No,
  service_address: ADDRESS
};

export const MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  has_former_names: yesNoResponse.Yes,
  former_names: "John Doe"
};

export const MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  has_former_names: yesNoResponse.No,
  former_names: "John Doe"
};

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES: managingOfficerCorporateType.ManagingOfficerCorporate = {
  id: MO_CORP_ID,
  role_and_responsibilities: "",
  contact_full_name: "",
  contact_email: "",
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  service_address: ADDRESS,
};

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO: managingOfficerCorporateType.ManagingOfficerCorporate = {
  id: MO_CORP_ID,
  role_and_responsibilities: "",
  contact_full_name: "",
  contact_email: "",
  is_service_address_same_as_principal_address: yesNoResponse.No,
  service_address: ADDRESS,
};

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES: managingOfficerCorporateType.ManagingOfficerCorporate = {
  id: MO_CORP_ID,
  role_and_responsibilities: "",
  contact_full_name: "",
  contact_email: "",
  is_on_register_in_country_formed_in: yesNoResponse.Yes,
  public_register_name: "Reg",
  registration_number: "123456"
};

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO: managingOfficerCorporateType.ManagingOfficerCorporate = {
  id: MO_CORP_ID,
  role_and_responsibilities: "",
  contact_full_name: "",
  contact_email: "",
  is_on_register_in_country_formed_in: yesNoResponse.No,
  public_register_name: "Reg",
  registration_number: "123456"
};

export const PRESENTER_OBJECT_MOCK: presenterType.Presenter = {
  full_name: "fullName",
  email: EMAIL_ADDRESS
};

export const PRESENTER_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES: presenterType.Presenter = {
  full_name: "fullName",
  email: " " + EMAIL_ADDRESS + " "
};

export const PAYMENT_OBJECT_MOCK: CreatePaymentRequest = {
  redirectUri: PAYMENT_WITH_TRANSACTION_URL,
  reference: `${REFERENCE}_${TRANSACTION_ID}`,
  resource: "any resource",
  state: STATE_ID
};

export const TRUST_DATA: string = `[{
  "trust_name": "name of trust",
  "creation_date_day": "31",
  "creation_date_month": "12",
  "creation_date_year": "1999",
  "unable_to_obtain_all_trust_info": false,
  "INDIVIDUALS": [],
  "HISTORICAL_BO": [],
  "CORPORATES": []
}]`;

export const TRUST_DATA_NO_NAME: string = `[{
  "creation_date_day": "31",
  "creation_date_month": "12",
  "creation_date_year": "1999",
  "unable_to_obtain_all_trust_info": false,
  "INDIVIDUALS": [],
  "HISTORICAL_BO": [],
  "CORPORATES": []
}]`;

export const TRUST_DATA_NO_CREATION_DATE: string = `[{
  "trust_name": "name of trust",
  "unable_to_obtain_all_trust_info": false,
  "INDIVIDUALS": [],
  "HISTORICAL_BO": [],
  "CORPORATES": []
}]`;

export const TRUST_DATA_PARTIAL_CREATION_DATE: string = `[{
  "trust_name": "name of trust",
  "creation_date_day": "31",
  "creation_date_month": "",
  "creation_date_year": "1999",
  "unable_to_obtain_all_trust_info": false,
  "INDIVIDUALS": [],
  "HISTORICAL_BO": [],
  "CORPORATES": []
}]`;

export const TRUSTS_SUBMIT = {
  submit: "submit",
  beneficialOwners: "123",
  [trustType.TrustKey]: TRUST_DATA
};

export const TRUSTS_SUBMIT_MULTIPLE_BENEFICIAL_OWNERS = {
  submit: "submit",
  beneficialOwners: ["123", "456"],
  [trustType.TrustKey]: TRUST_DATA
};

export const TRUSTS_SUBMIT_NO_NAME = {
  submit: "submit",
  beneficialOwners: "123",
  [trustType.TrustKey]: TRUST_DATA_NO_NAME
};

export const TRUSTS_SUBMIT_NO_CREATION_DATE = {
  submit: "submit",
  beneficialOwners: "123",
  [trustType.TrustKey]: TRUST_DATA_NO_CREATION_DATE
};

export const TRUSTS_SUBMIT_PARTIAL_CREATION_DATE = {
  submit: "submit",
  beneficialOwners: "123",
  [trustType.TrustKey]: TRUST_DATA_PARTIAL_CREATION_DATE
};

export const TRUSTS_ADD_MORE = {
  add: "add",
  beneficialOwners: "123",
  [trustType.TrustKey]: TRUST_DATA
};

export const TRUSTS_EMPTY_TRUST_DATA = {
  add: "add",
  beneficialOwners: "123",
};

export const TRUSTS_EMPTY_CHECKBOX = {
  add: "add",
  [trustType.TrustKey]: TRUST_DATA
};

const hasSoldLandKey = '0';
const isSecureRegisterKey = '0';

export const TRUST: Trust = {
  trust_id: "",
  trust_name: "name of trust",
  creation_date_day: "31",
  creation_date_month: "12",
  creation_date_year: "1999",
  unable_to_obtain_all_trust_info: "No"
};

export const TRUST_NO_NAME: Trust = {
  trust_id: "",
  trust_name: "",
  creation_date_day: "31",
  creation_date_month: "12",
  creation_date_year: "1999",
  unable_to_obtain_all_trust_info: "No"
};

export const TRUST_NO_DATE: Trust = {
  trust_id: "",
  trust_name: "name of trust",
  creation_date_day: "",
  creation_date_month: "",
  creation_date_year: "",
  unable_to_obtain_all_trust_info: "No"
};

export const TRUST_PARTIAL_DATE: Trust = {
  trust_id: "",
  trust_name: "name of trust",
  creation_date_day: "31",
  creation_date_month: "",
  creation_date_year: "1999",
  unable_to_obtain_all_trust_info: "No"
};

export const APPLICATION_DATA_MOCK: ApplicationData = {
  [presenterType.PresenterKey]: PRESENTER_OBJECT_MOCK,
  [entityType.EntityKey]: ENTITY_OBJECT_MOCK,
  [dueDiligenceType.DueDiligenceKey]: DUE_DILIGENCE_OBJECT_MOCK,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ BENEFICIAL_OWNER_GOV_OBJECT_MOCK ],
  [managingOfficerType.ManagingOfficerKey]: [ MANAGING_OFFICER_OBJECT_MOCK ],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [ MANAGING_OFFICER_CORPORATE_OBJECT_MOCK ],
  [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT,
  [PaymentKey]: PAYMENT_OBJECT_MOCK,
  [OverseasEntityKey]: OVERSEAS_ENTITY_ID,
  [Transactionkey]: TRANSACTION_ID,
  [HasSoldLandKey]: hasSoldLandKey,
  [IsSecureRegisterKey]: isSecureRegisterKey,
  [TrustKey]: [TRUST]
};

export const APPLICATION_DATA_NO_TRUSTS_MOCK: ApplicationData = {
  [presenterType.PresenterKey]: PRESENTER_OBJECT_MOCK,
  [entityType.EntityKey]: ENTITY_OBJECT_MOCK,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTS_OBJECT_MOCK ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_NO_TRUSTS_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ BENEFICIAL_OWNER_GOV_OBJECT_MOCK ],
  [managingOfficerType.ManagingOfficerKey]: [ MANAGING_OFFICER_OBJECT_MOCK ],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [ MANAGING_OFFICER_CORPORATE_OBJECT_MOCK ],
  [PaymentKey]: PAYMENT_OBJECT_MOCK,
  [OverseasEntityKey]: OVERSEAS_ENTITY_ID,
  [Transactionkey]: TRANSACTION_ID
};

export const APPLICATION_DATA_NO_TRUST_NAME_MOCK: ApplicationData = {
  ...APPLICATION_DATA_NO_TRUSTS_MOCK,
  [TrustKey]: [TRUST_NO_NAME]
};

export const APPLICATION_DATA_NO_TRUST_DATE_MOCK: ApplicationData = {
  ...APPLICATION_DATA_NO_TRUSTS_MOCK,
  [TrustKey]: [TRUST_NO_DATE]
};

export const APPLICATION_DATA_PARTIAL_TRUST_DATE_MOCK: ApplicationData = {
  ...APPLICATION_DATA_NO_TRUSTS_MOCK,
  [TrustKey]: [TRUST_PARTIAL_DATE]
};

export const serviceNameOE = "overseasEntity";
export const fnNamePutOE = "putOverseasEntity";
export const fnNamePostOE = "postOverseasEntity";
export const fnNameGetOE = "getOverseasEntity";

export const serviceNameTransaction = "transaction";
export const fnNamePostTransaction = "postTransaction";
export const fnNamePutTransaction = "putTransaction";

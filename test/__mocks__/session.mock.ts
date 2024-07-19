import { Accounts, CompanyProfile, Links, RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ManagingOfficerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { Session } from "@companieshouse/node-session-handler";
import { AccessTokenKeys } from '@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys';
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken, ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import {
  DESCRIPTION,
  OVERSEAS_ENTITY,
  PAYMENT_PAID,
  PAYMENT_REQUIRED_HEADER,
  REFERENCE,
  TRANSACTION as TRANSACTION_PATH,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  RESUME,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL,
  UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL
} from "../../src/config";
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
  dueDiligenceType,
  updateType,
  removeType,
  relevantPeriodType
} from "../../src/model";
import {
  EntityNameKey,
  HasSoldLandKey,
  IsSecureRegisterKey,
  NatureOfControlType,
  EntityNumberKey,
  OverseasEntityKey,
  PaymentKey,
  Transactionkey,
  yesNoResponse,
  IsRemoveKey
} from "../../src/model/data.types.model";
import { TrustKey, Trust, TrustIndividual } from "../../src/model/trust.model";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../src/model/who.is.making.filing.model";
import { DUE_DILIGENCE_OBJECT_MOCK } from "./due.diligence.mock";
import { ADDRESS } from "./fields/address.mock";
import { DATE_OF_BIRTH, EMPTY_DATE, RESIGNED_ON_DATE, START_DATE } from "./fields/date.mock";
import { ANY_MESSAGE_ERROR } from "./text.mock";
import { EntityKey } from "../../src/model/entity.model";
import { OverseasEntityDueDiligenceKey } from "../../src/model/overseas.entity.due.diligence.model";
import { BeneficialOwnerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { RoleWithinTrustType } from "../../src/model/role.within.trust.type.model";

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
export const COMPANY_NUMBER = "SA000392";

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
export const PAYMENT_URL = "http://chs.local/payments";
export const STATE_ID = "ad83863d-7713-4b39-a625-3ec282d6710e";
export const PAYMENT_HEADER = { [PAYMENT_REQUIRED_HEADER]: PAYMENT_URL };
export const FULL_PAYMENT_REDIRECT_PATH = `${PAYMENT_URL}/11KlXILS123zoLXn22/pay`;
export const TRANSACTION_POST_PARAMS = {
  reference: REFERENCE,
  companyName: "overseasEntityName",
  companyNumber: "OE111129",
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
export const RESUME_SUBMISSION_URL = `${REGISTER_AN_OVERSEAS_ENTITY_URL}${TRANSACTION_PATH}/${TRANSACTION_ID}/${OVERSEAS_ENTITY}/${OVERSEAS_ENTITY_ID}/${RESUME}`;
export const RESUME_UPDATE_SUBMISSION_URL = `${UPDATE_AN_OVERSEAS_ENTITY_URL}${TRANSACTION_PATH}/${TRANSACTION_ID}/${OVERSEAS_ENTITY}/${OVERSEAS_ENTITY_ID}/${RESUME}`;
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

export function getSessionRequestWithExtraData(appData: ApplicationData = APPLICATION_DATA_MOCK): Session {
  const session = getSessionRequestWithPermission();
  session.setExtraData(APPLICATION_DATA_KEY, appData);
  return session;
}

export const MOCK_APP_DATA_MOS = {
  entity: { email: undefined },
  overseas_entity_id: "OE123",
  transaction_id: "123",
  update: {
    review_managing_officers_individual: [
      {
        id: 'MO1',
        ch_reference: 'hashedId1',
        first_name: 'MO1 firstName',
        last_name: 'MO1 lastName',
      },
      {
        id: 'MO1B',
        ch_reference: 'hashedId1B',
        first_name: 'MO1B firstName',
        last_name: 'MO1B lastName',
      }
    ],
    review_managing_officers_corporate: [
      {
        id: 'MO2',
        ch_reference: 'hashedId2',
        name: 'Mo2CorporateName'
      }
    ]
  }
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

export const DISTINCT_PRINCIPAL_ADDRESS_MOCK = {
  principal_address_property_name_number: "principal address 1",
  principal_address_line_1: "principal addressLine1",
  principal_address_line_2: "principal addressLine2",
  principal_address_town: "principal address town",
  principal_address_county: "principal address county",
  principal_address_country: "principal address country",
  principal_address_postcode: "princ. add . BY 2"
};

export const ENTITY_OBJECT_MOCK: entityType.Entity = {
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

export const REGISTER_ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS = {
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

export const UPDATE_ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS = {
  entity_name: "name of a company",
  incorporation_country: "incorporationCountry",
  is_service_address_same_as_principal_address: "0",
  email: "email@test.gov.uk",
  legal_form: "legalForm",
  law_governed: "governedLaw",
  public_register_name: PUBLIC_REGISTER_NAME,
  public_register_jurisdiction: PUBLIC_REGISTER_JURISDICTION,
  registration_number: REGISTRATION_NUMBER,
  is_on_register_in_country_formed_in: "1",
  [EntityNumberKey]: COMPANY_NUMBER,
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_MOCK
};

export const ENTITY_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES = {
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

export const BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
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
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  is_on_sanctions_list: 0,
  ...START_DATE,
  trust_ids: []
};

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ch_reference: "testchreference",
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
  trust_ids: [],
  ceased_date: { day: "1", month: "3", year: "2001" }
};

export const UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
  id: BO_OTHER_ID,
  ch_reference: "",
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

export const UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_REQ_MOCK = {
  ...UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  ...PRINCIPAL_ADDRESS_MOCK,
  is_still_bo: '1'
};

export const BENEFICIAL_OWNER_OTHER_NO_TRUSTS_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
  id: BO_OTHER_ID,
  ch_reference: "",
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

export const UPDATE_BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS = {
  ...BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS,
  is_still_bo: "1",
  ceased_date: {}
};

export const UPDATE_BENEFICIAL_OWNER_OTHER_MOCK_FOR_CEASE_VALIDATION = {
  ...BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS,
  is_still_bo: "0"
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
  ch_reference: undefined,
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

export const BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  ch_reference: undefined,
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
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  is_on_sanctions_list: 1,
  trust_ids: []
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_NO_ADDRESS: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  ch_reference: undefined,
  second_nationality: "",
  usual_residential_address: undefined,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: undefined,
  start_date: { day: "1", month: "3", year: "1999" },
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  ch_reference: "testchreference",
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
  trust_ids: [],
  ceased_date: { day: "1", month: "3", year: "2001" }
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF_NO_RESIDENTIAL: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  ch_reference: "9dsfdfjie494634mdfsffdsfdfs5",
  first_name: "Ivan",
  last_name: "Drago",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Russian",
  second_nationality: "",
  usual_residential_address: undefined,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: "1", month: "3", year: "1999" },
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  is_on_sanctions_list: 1,
  trust_ids: [],
  ceased_date: { day: "1", month: "3", year: "2001" }
};

export const UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  ch_reference: "",
  first_name: "Ivan",
  last_name: "Drago",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  have_day_of_birth: undefined,
  nationality: "Russian",
  second_nationality: "",
  usual_residential_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: "1", month: "3", year: "1999" },
  ceased_date: EMPTY_DATE,
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  is_on_sanctions_list: 1,
  trust_ids: []
};

export const UPDATE_BENEFICIAL_OWNER_HAVE_DAY_OF_BIRTH_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  ch_reference: "",
  first_name: "Ivan",
  last_name: "Drago",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  have_day_of_birth: true,
  nationality: "Russian",
  second_nationality: "",
  usual_residential_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: "1", month: "3", year: "1999" },
  ceased_date: EMPTY_DATE,
  beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
  trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS],
  non_legal_firm_members_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS],
  is_on_sanctions_list: 1,
  trust_ids: []
};

export const UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  id: BO_IND_ID,
  ch_reference: "string",
  first_name: "Jimmothy",
  last_name: "Johnnothy",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Russian",
  second_nationality: "",
  usual_residential_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: 1,
  service_address: ADDRESS,
  start_date: { day: "1", month: "3", year: "1999" },
  ceased_date: EMPTY_DATE,
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

export const REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA = {
  ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ceased_date: { day: "01", month: "04", year: "1920" },
  is_still_bo: "1",
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...START_DATE
};

export const REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_HAVE_DAY_OF_BIRTH = {
  ...UPDATE_BENEFICIAL_OWNER_HAVE_DAY_OF_BIRTH_OBJECT_MOCK,
  ceased_date: { day: "01", month: "04", year: "1920" },
  is_still_bo: "1",
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...START_DATE
};

export const REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_PARTIAL = {
  ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ceased_date: { day: "01", month: "04", year: "1920" },
  is_still_bo: "1",
};

export const UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
  is_still_bo: "1",
  ceased_date: {}
};

export const UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION = {
  ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
  is_still_bo: "0"
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

export const UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  ...PRINCIPAL_ADDRESS_MOCK,
  ...START_DATE,
  legal_form: "LegalForm",
  law_governed: "1234",
  is_on_register_in_country_formed_in: yesNoResponse.Yes,
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

export const UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO: beneficialOwnerOtherType.BeneficialOwnerOther = {
  ...UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
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
  date_of_birth: { 'date_of_birth-day': "", "date_of_birth-month": "", "date_of_birth-year": "" },
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

export const BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF: beneficialOwnerGovType.BeneficialOwnerGov = {
  ch_reference: "testchreference",
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
  is_on_sanctions_list: 1,
  ceased_date: undefined
};

export const UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK: beneficialOwnerGovType.BeneficialOwnerGov = {
  ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
};

export const REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA = {
  ceased_date: { day: "01", month: "04", year: "1920" },
  is_still_bo: "1",
  ...UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  ...RESIDENTIAL_ADDRESS_MOCK,
  ...START_DATE
};

export const UPDATE_REVIEW_BENEFICIAL_OWNER_MOCK_DATA = {
  ...UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  ch_reference: undefined,
  service_address: ADDRESS,
  ceased_date: EMPTY_DATE,
  is_still_bo: 1,
  ...PRINCIPAL_ADDRESS_MOCK,
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

export const UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS = {
  ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
  is_still_bo: "1",
  ceased_date: {}
};

export const UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION = {
  ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
  is_still_bo: "0"
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

export const REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION: beneficialOwnerGovType.BeneficialOwnerGov = {
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

export const MOCKED_PRIVATE_ADDRESS = {
  addressLine1: "private_addressLine1",
  addressLine2: "private_addressLine2",
  careOf: "private_careOf",
  country: "private_country",
  locality: "private_locality",
  poBox: "private_poBox",
  postalCode: "private_postalCode",
  premises: "private_premises",
  region: "private_region"
};

export const MOCK_MANAGING_OFFICERS_PRIVATE_DATA: ManagingOfficerPrivateData[] =
  [
    {
      residentialAddress: MOCKED_PRIVATE_ADDRESS,
      principalAddress: ADDRESS,
      dateOfBirth: "1990-01-01",
      contactNameFull: "John Doe",
      contactEmailAddress: "john.doe@example.com",
      hashedId: "hashedId1",
    },
    {
      residentialAddress: MOCKED_PRIVATE_ADDRESS,
      principalAddress: {
        ...MOCKED_PRIVATE_ADDRESS,
        premises: "M02 premises",
        addressLine1: "M02 principalAddress Ln1",
      },
      dateOfBirth: "1985-02-01",
      contactNameFull: "Jane Doe",
      contactEmailAddress: "jane.doe@example.com",
      hashedId: "hashedId2",
    },
  ];

export const MANAGING_OFFICER_OBJECT_PRIVATE_DATA_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  first_name: "Joe",
  last_name: "Bloggs",
  has_former_names: yesNoResponse.Yes,
  former_names: "Some name",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Malawian",
  usual_residential_address: {
    property_name_number: "URA 1",
    line_1: "URA addressLine1",
    line_2: "URA addressLine2",
    town: "URA town",
    county: "URA county",
    country: "URA country",
    postcode: "URA postcode"
  },
  service_address: {
    property_name_number: "SERVICE 1",
    line_1: "SERVICE addressLine1",
    line_2: "SERVICE addressLine2",
    town: "SERVICE town",
    county: "SERVICE county",
    country: "SERVICE country",
    postcode: "SERVICE postcode"
  },
  is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
  occupation: "Some Occupation",
  role_and_responsibilities: "Some role and responsibilities"
};

export const MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF: managingOfficerType.ManagingOfficerIndividual = {
  ...MANAGING_OFFICER_OBJECT_MOCK,
  ch_reference: 'hashedId1',
};

export const UPDATE_MANAGING_OFFICER_OBJECT_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  ...MANAGING_OFFICER_OBJECT_MOCK,
  ch_reference: "testchreference",
  start_date: { day: "21", month: "3", year: "2010" },
  resigned_on: { day: "1", month: "1", year: "2022" },
};

export const UPDATE_NEWLY_ADDED_MANAGING_OFFICER_OBJECT_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  ...MANAGING_OFFICER_OBJECT_MOCK,
  start_date: { day: "21", month: "3", year: "2010" },
  resigned_on: { day: "1", month: "1", year: "2022" },
};

export const UPDATE_REVIEW_MANAGING_OFFICER_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  ...UPDATE_MANAGING_OFFICER_OBJECT_MOCK,
  ...RESIDENTIAL_ADDRESS_MOCK,
  resigned_on: { day: "21", month: "3", year: "1970" },
  start_date: { day: "21", month: "3", year: "1960" },
  ...DATE_OF_BIRTH,
};

export const UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO = {
  ...UPDATE_MANAGING_OFFICER_OBJECT_MOCK,
  ...RESIDENTIAL_ADDRESS_MOCK,
  resigned_on: { day: "21", month: "3", year: "1970" },
  start_date: { day: "21", month: "3", year: "1960" },
  ...DATE_OF_BIRTH,
  is_still_mo: 1
};

export const UPDATE_MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF: managingOfficerType.ManagingOfficerIndividual = {
  ...MANAGING_OFFICER_OBJECT_MOCK,
  ch_reference: "testchreference"
};

export const UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  ch_reference: "testchreference",
  first_name: "Jimmy John",
  last_name: "Wabb",
  has_former_names: yesNoResponse.Yes,
  former_names: "Jimmothy James Jimminny, Finn McCumhaill, Test Tester",
  date_of_birth: { day: "01", month: "02", year: "1900" },
  nationality: "country1",
  usual_residential_address: ADDRESS,
  service_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
  occupation: "occupation",
  role_and_responsibilities: "role and responsibilities text"
};

export const UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  ch_reference: "testchreference",
  first_name: "Jimmy John",
  last_name: "Wabb",
  has_former_names: yesNoResponse.Yes,
  former_names: "Jimmothy James Jimminny, Finn McCumhaill, Test Tester",
  date_of_birth: { day: "01", month: "02", year: "1900" },
  nationality: "country1",
  second_nationality: "country2",
  usual_residential_address: ADDRESS,
  service_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
  occupation: "occupation",
  role_and_responsibilities: "role and responsibilities text"
};

export const UPDATE_MANAGING_OFFICER_HAVE_DAY_OF_BIRTH_MOCK: managingOfficerType.ManagingOfficerIndividual = {
  id: MO_IND_ID,
  ch_reference: "testchreference",
  first_name: "Jimmy John",
  last_name: "Wabb",
  has_former_names: yesNoResponse.Yes,
  former_names: "Jimmothy James Jimminny, Finn McCumhaill, Test Tester",
  date_of_birth: { day: "1", month: "02", year: "1900" },
  nationality: "country1",
  second_nationality: "country2",
  usual_residential_address: ADDRESS,
  service_address: ADDRESS,
  is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
  occupation: "occupation",
  role_and_responsibilities: "role and responsibilities text",
  have_day_of_birth: true
};

export const REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY = {
  first_name: "",
  last_name: "",
  has_former_names: "",
  former_names: "",
  date_of_birth: { 'date_of_birth-day': "", "date_of_birth-month": "", "date_of_birth-year": "" },
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

export const REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE = {
  ...REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS,
  ...START_DATE,
  is_still_mo: '1'
};

export const REQ_BODY_UPDATE_MANAGING_OFFICER_INACTIVE = {
  ...REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS,
  ...START_DATE,
  is_still_mo: '0',
  ...RESIGNED_ON_DATE
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
  ch_reference: undefined,
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

export const MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF: managingOfficerCorporateType.ManagingOfficerCorporate = {
  ...MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  ch_reference: 'mo-corporate-ch-ref',
};

export const UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK: managingOfficerCorporateType.ManagingOfficerCorporate = {
  ...MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  ch_reference: "testchreference",
  start_date: { day: "21", month: "3", year: "2010" },
  resigned_on: { day: "1", month: "1", year: "2022" }
};

export const UPDATE_NEWLY_ADDED_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK: managingOfficerCorporateType.ManagingOfficerCorporate = {
  ...MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  start_date: { day: "21", month: "3", year: "2010" },
  resigned_on: { day: "1", month: "1", year: "2022" }
};

export const UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF: managingOfficerCorporateType.ManagingOfficerCorporate = {
  ...MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  ch_reference: "testchreference"
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

export const REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE = {
  ...REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS,
  ...START_DATE,
  is_still_mo: '1',
  id: MO_CORP_ID
};

export const REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_INACTIVE = {
  ...REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS,
  ...START_DATE,
  is_still_mo: '0',
  ...RESIGNED_ON_DATE
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

export const UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES = {
  ...MANAGING_OFFICER_CORPORATE_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  is_still_mo: '1'
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

export const OVERSEAS_NAME_MOCK = "Overseas Entity Name";

export const PRESENTER_OBJECT_MOCK: presenterType.Presenter = {
  full_name: "fullName",
  email: EMAIL_ADDRESS
};

export const PRESENTER_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES: presenterType.Presenter = {
  full_name: "fullName",
  email: " " + EMAIL_ADDRESS + " "
};

export const UPDATE_OBJECT_MOCK: updateType.Update = {
  date_of_creation: { day: "1", month: "1", year: "2011" },
  filing_date: { day: "1", month: "1", year: "2022" },
  registrable_beneficial_owner: undefined,
  review_beneficial_owners_individual: [],
  review_beneficial_owners_corporate: [],
  review_beneficial_owners_government_or_public_authority: [],
  review_managing_officers_individual: [],
  review_managing_officers_corporate: [],
  review_trusts: [],
  no_change: true
};

export const REMOVE_OBJECT_MOCK: removeType.Remove = {
  is_not_proprietor_of_land: true
};

export const UPDATE_OBJECT_PRIVATE_DATA_MOCK: updateType.Update = {
  date_of_creation: { day: "1", month: "1", year: "2011" },
  filing_date: { day: "1", month: "1", year: "2022" },
  registrable_beneficial_owner: undefined,
  review_beneficial_owners_individual: [],
  review_beneficial_owners_corporate: [],
  review_beneficial_owners_government_or_public_authority: [],
  review_managing_officers_individual: [
    MANAGING_OFFICER_OBJECT_PRIVATE_DATA_MOCK
  ],
  review_managing_officers_corporate: [],
  no_change: true
};

export const UNDEFINED_UPDATE_OBJECT_MOCK: updateType.Update = {
  review_beneficial_owners_individual: undefined,
  review_beneficial_owners_government_or_public_authority: undefined,
};

export const UPDATE_OWNERS_DATA_WITH_VALUE: updateType.Update = {
  date_of_creation: { day: "1", month: "1", year: "2011" },
  filing_date: { day: "1", month: "1", year: "2022" },
  registrable_beneficial_owner: undefined,
  review_beneficial_owners_individual: [UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK],
  review_beneficial_owners_government_or_public_authority: [REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA],
  review_beneficial_owners_corporate: [UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_REQ_MOCK],
  review_managing_officers_individual: [MANAGING_OFFICER_OBJECT_MOCK],
  review_managing_officers_corporate: [MANAGING_OFFICER_CORPORATE_OBJECT_MOCK]
};

export const UPDATE_OBJECT_MOCK_REVIEW_MODEL: updateType.Update = {
  ...UPDATE_OBJECT_MOCK,
  ...UPDATE_OWNERS_DATA_WITH_VALUE
};

export const UPDATE_OBJECT_MOCK_REVIEW_BO_OTHER_MODEL: updateType.Update = {
  ...UPDATE_OBJECT_MOCK,
  review_beneficial_owners_corporate: [UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK]
};

export const UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE: updateType.Update = {
  ...UPDATE_OBJECT_MOCK,
  change_bo_relevant_period: relevantPeriodType.ChangeBoRelevantPeriodType.YES,
  trustee_involved_relevant_period: relevantPeriodType.TrusteeInvolvedRelevantPeriodType.YES,
  change_beneficiary_relevant_period: relevantPeriodType.ChangeBeneficiaryRelevantPeriodType.YES
};

export const UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE: updateType.Update = {
  ...UPDATE_OBJECT_MOCK,
  change_bo_relevant_period: relevantPeriodType.ChangeBoRelevantPeriodType.NO,
  trustee_involved_relevant_period: relevantPeriodType.TrusteeInvolvedRelevantPeriodType.NO,
  change_beneficiary_relevant_period: relevantPeriodType.ChangeBeneficiaryRelevantPeriodType.NO
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

export const TRUST_DATA_LEADING_AND_TRAILING_SPACES: string = `[{
  "trust_name": " name of trust ",
  "creation_date_day": "31",
  "creation_date_month": "12",
  "creation_date_year": "1999",
  "unable_to_obtain_all_trust_info": false,
  "INDIVIDUALS": [
    {
      "type": " Beneficiary ",
      "forename": "bob",
      "surname": "smith",
      "dob_day": "19",
      "dob_month": "03",
      "dob_year": "1976",
      "nationality": "welsh",
      "ura_address_line_1": "ss",
      "ura_address_locality": "dd",
      "ura_address_region": "dd",
      "ura_address_country": "wales",
      "ura_address_postal_code": "cf240tl",
      "sa_address_line_1": "ss",
      "sa_address_locality": "dd",
      "sa_address_region": "dd",
      "sa_address_country": "wales",
      "sa_address_postal_code": "cf240tl",
      "date_became_interested_person_day": "11",
      "date_became_interested_person_month": "11",
      "date_became_interested_person_year": "1987"
    }
  ],
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

export const TRUSTS_SUBMIT_LEADING_AND_TRAILING_WHITESPACE = {
  submit: "submit",
  beneficialOwners: "123",
  [trustType.TrustKey]: TRUST_DATA_LEADING_AND_TRAILING_SPACES
};

const hasSoldLandKey = '0';
const isSecureRegisterKey = '0';

export const TRUST: Trust = {
  trust_id: "",
  trust_name: "name of trust",
  creation_date_day: "31",
  creation_date_month: "12",
  creation_date_year: "1999",
  trust_still_involved_in_overseas_entity: "Yes",
  unable_to_obtain_all_trust_info: "No"
};

export const TRUST_NO_NAME: Trust = {
  trust_id: "",
  trust_name: "",
  creation_date_day: "31",
  creation_date_month: "12",
  creation_date_year: "1999",
  trust_still_involved_in_overseas_entity: "Yes",
  unable_to_obtain_all_trust_info: "No"
};

export const TRUST_NO_DATE: Trust = {
  trust_id: "",
  trust_name: "name of trust",
  creation_date_day: "",
  creation_date_month: "",
  creation_date_year: "",
  trust_still_involved_in_overseas_entity: "Yes",
  unable_to_obtain_all_trust_info: "No"
};

export const TRUST_PARTIAL_DATE: Trust = {
  trust_id: "",
  trust_name: "name of trust",
  creation_date_day: "31",
  creation_date_month: "",
  creation_date_year: "1999",
  trust_still_involved_in_overseas_entity: "Yes",
  unable_to_obtain_all_trust_info: "No"
};

export const OVER_SEAS_ENTITY_MOCK_DATA: CompanyProfile = {
  companyName: "acme",
  dateOfCreation: "1872-06-26",
  ...SERVICE_ADDRESS,
  type: "registered-overseas-entity",
  jurisdiction: "country1",
  companyNumber: "0E746324",
  companyStatus: "",
  companyStatusDetail: "",
  sicCodes: [],
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  registeredOfficeAddress: {} as RegisteredOfficeAddress,
  accounts: {} as Accounts,
  links: {} as Links
};

export const COMPANY_PROFILE_WITH_CONFIRMATION_STATEMENT_MOCK_DATA: CompanyProfile = {
  ...OVER_SEAS_ENTITY_MOCK_DATA,
  confirmationStatement: {
    nextDue: "2024-08-12",
    nextMadeUpTo: "2024-08-26",
    overdue: false,
    lastMadeUpTo: "2023-08-12"
  }
};

export const MANAGING_OFFICER_MOCK_MAP_DATA: CompanyOfficer = {
  address: {
    premises: "1 Acme Road",
    addressLine1: "addressLine1",
    addressLine2: "addressLine2",
    locality: "locality",
    careOf: "careOf",
    poBox: "pobox",
    postalCode: "BY 2",
    region: "region",
    country: "country"
  },
  appointedOn: "2023-04-01",
  countryOfResidence: "country1",
  dateOfBirth: {
    day: "1",
    month: "2",
    year: "1900"
  },
  ...DATE_OF_BIRTH,
  formerNames: [],
  identification: {
    legalForm: "all forms",
    legalAuthority: "country2",
    identificationType: "identification type",
    placeRegistered: "place",
    registrationNumber: "0000"
  },
  contactDetails: {
    contactName: "Test User"
  },
  links: {
    self: "selfLink",
    officer: {
      appointments: ""
    }
  },
  name: "Jimmy Wabb",
  nationality: "country1",
  occupation: "occupation",
  officerRole: "",
  resignedOn: "resigned"
};

export const PSC_BENEFICIAL_OWNER_MOCK_DATA: CompanyPersonWithSignificantControl = {
  address: {
    premises: "1 Acme Road",
    address_line_1: "addressLine1",
    address_line_2: "addressLine2",
    locality: "locality",
    careOf: "careOf",
    poBox: "pobox",
    postal_code: "BY 2",
    region: "region"
  },
  dateOfBirth: {
    day: "1",
    month: "2",
    year: "1900"
  },
  countryOfResidence: "country1",
  etag: "",
  links: {
    self: "",
    statement: ""
  },
  name: "acme",
  nameElements: {
    forename: "acme",
    surname: "doe",
  },
  nationality: "country1",
  naturesOfControl: [],
  notifiedOn: "2016-04-06",
  identification: {
    legalForm: "all forms",
    legalAuthority: "country2",
    countryRegistered: "country1",
    identificationType: "identification type",
    placeRegistered: "place",
    registrationNumber: "0000"
  }
};

export const TRUST_WITH_ID: Trust = {
  trust_id: "725",
  trust_name: "name of trust",
  creation_date_day: "31",
  creation_date_month: "12",
  creation_date_year: "1999",
  trust_still_involved_in_overseas_entity: "Yes",
  unable_to_obtain_all_trust_info: "No"
};

export const INDIVIUAL_TRUSTEE: TrustIndividual = {
  id: "1",
  ch_references: "CNFca5mzOxn9O_TW04SXGGolD-Y",
  forename: "INDIE",
  other_forenames: "",
  surname: "BENO",
  dob_day: "16",
  dob_month: "8",
  dob_year: "1982",
  nationality: "Bahraini",
  type: RoleWithinTrustType.SETTLOR,
  ura_address_premises: "1",
  ura_address_line_1: "INDIVIDUAL  ROAD",
  ura_address_locality: "INDIVIDUAL CITY",
  ura_address_country: "United Kingdom",
  ura_address_postal_code: "INDBO1",
  ura_address_line_2: "INDIVIDUAL VILLAGE",
  ura_address_region: "INDIVIDUAL COUNTY",
  ura_address_care_of: "",
  ura_address_po_box: "",
  sa_address_premises: "1",
  sa_address_line_1: "INDIVIDUAL  ROAD",
  sa_address_line_2: "INDIVIDUAL VILLAGE",
  sa_address_locality: "INDIVIDUAL CITY",
  sa_address_region: "INDIVIDUAL COUNTY",
  sa_address_country: "United Kingdom",
  sa_address_postal_code: "INDBO1",
  sa_address_care_of: "",
  sa_address_po_box: ""
};

export const CORPORATE_TRUSTEE = {
  id: "1",
  ch_references: "gUGj2sjjPhh7AooOzdPr4LMa3Ms",
  type: "Interested_Person",
  name: "Legal E trustee",
  date_became_interested_person_day: "10",
  date_became_interested_person_month: "9",
  date_became_interested_person_year: "2021",
  is_on_register_in_country_formed_in: 0,
  identification_legal_authority: "GOVERNING LAW",
  identification_legal_form: "LEGAL FORM",
  identification_place_registered: "",
  identification_registration_number: "",
  identification_country_registration: "",
  ro_address_premises: "1",
  ro_address_line_1: "LEGAL ROAD",
  ro_address_locality: "LEGAL CITY",
  ro_address_region: "",
  ro_address_country: "Guam",
  ro_address_postal_code: "",
  is_service_address_same_as_principal_address: 0,
  ro_address_line_2: "",
  ro_address_care_of: "",
  ro_address_po_box: "",
  sa_address_premises: "1",
  sa_address_line_1: "LEGAL ROAD",
  sa_address_line_2: "",
  sa_address_locality: "LEGAL CITY",
  sa_address_region: "",
  sa_address_country: "Guam",
  sa_address_postal_code: "",
  sa_address_care_of: "",
  sa_address_po_box: ""
};

export const APPLICATION_DATA_MOCK: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
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
  [TrustKey]: [TRUST],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_REMOVE_MOCK: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
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
  [TrustKey]: [TRUST],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK,
  [removeType.RemoveKey]: REMOVE_OBJECT_MOCK,
  [IsRemoveKey]: true
};

export const APPLICATION_DATA_REGISTRATION_MOCK: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
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

export const APPLICATION_DATA_MOCK_WITHOUT_UPDATE: ApplicationData = {
  ...APPLICATION_DATA_MOCK,
  [EntityNumberKey]: undefined,
  [updateType.UpdateKey]: undefined
};

export const APPLICATION_DATA_MOCK_N0_BOI: ApplicationData = {
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO ],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_MOCK_WITH_OWNER_UPDATE_REVIEW_DATA: ApplicationData = {
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: undefined,
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ ],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OWNERS_DATA_WITH_VALUE
};

export const APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO: ApplicationData = {
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_NO_ADDRESS ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO ],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK_REVIEW_MODEL
};

export const APPLICATION_DATA_BENEFICIAL_OWNER_UNDEFINED_UPDATE_REVIEW_BO: ApplicationData = {
  ...APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO,
  ...APPLICATION_DATA_MOCK_N0_BOI_WITH_UPDATE_REVIEW_BO[updateType.UpdateKey] = UNDEFINED_UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_MOCK_NO_NEWLY_ADDED_BOS_AND_MOS: ApplicationData = {
  ...APPLICATION_DATA_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF],
  [managingOfficerType.ManagingOfficerKey]: [MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF]
};

export const APPLICATION_DATA_CH_REF_UPDATE_MOCK: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
  [presenterType.PresenterKey]: PRESENTER_OBJECT_MOCK,
  [entityType.EntityKey]: ENTITY_OBJECT_MOCK,
  [dueDiligenceType.DueDiligenceKey]: DUE_DILIGENCE_OBJECT_MOCK,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF ],
  [managingOfficerType.ManagingOfficerKey]: [ UPDATE_MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF ],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [ UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF ],
  [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT,
  [PaymentKey]: PAYMENT_OBJECT_MOCK,
  [OverseasEntityKey]: OVERSEAS_ENTITY_ID,
  [Transactionkey]: TRANSACTION_ID,
  [HasSoldLandKey]: hasSoldLandKey,
  [IsSecureRegisterKey]: isSecureRegisterKey,
  [TrustKey]: [TRUST],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_CH_REF_REMOVE_MOCK: ApplicationData = {
  ...APPLICATION_DATA_CH_REF_UPDATE_MOCK,
  [IsRemoveKey]: true,
};

export const FETCH_BO_APPLICATION_DATA_MOCK: ApplicationData = {
  overseas_entity_id: '123',
  transaction_id: '345',
  entity_number: '1',
  update: {
    review_beneficial_owners_individual: [
      {
        id: '1111',
        ch_reference: '111',
        first_name: 'dummyFirst',
        last_name: 'dummy Last',
      }
    ],
    review_beneficial_owners_corporate: [
      {
        id: '2222',
        ch_reference: '222',
        name: 'corp'
      }
    ],
    review_beneficial_owners_government_or_public_authority: [
      {
        id: '3333',
        ch_reference: '333',
        name: 'gov'
      }
    ]
  }
};

export const FETCH_BO_APPLICATION_DATA_MOCK_NO_CH_REF: ApplicationData = {
  overseas_entity_id: '123',
  transaction_id: '345',
  entity_number: '1',
  update: {
    review_beneficial_owners_individual: [
      {
        id: '1111',
        first_name: 'dummyFirst',
        last_name: 'dummy Last',
      }
    ],
    review_beneficial_owners_corporate: [
      {
        id: '2222',
        name: 'corp'
      }
    ],
    review_beneficial_owners_government_or_public_authority: [
      {
        id: '3333',
        name: 'gov'
      }
    ]
  }
};

export const FETCH_TRUST_APPLICATION_DATA_MOCK: ApplicationData = {
  overseas_entity_id: '123',
  transaction_id: '345',
  entity_number: '1'
};

export const PRIVATE_BO_INDIVIDUAL_MOCK_DATA_CH_REFERENCE = "RandomeaP1EB70SSD9SLmiK5Y";
export const PRIVATE_BO_GOV_MOCK_DATA_CH_REFERENCE = "9TeildEUMY5Xnw2gbPxGO3jCod8";
export const PRIVATE_BO_CORP_MOCK_DATA_CH_REFERENCE = "9dsfdfjie494634mdfsffdsfdfs5";

export const PRIVATE_BO_INDIVIDUAL_MOCK_DATA: BeneficialOwnerPrivateData = {
  hashedId: PRIVATE_BO_INDIVIDUAL_MOCK_DATA_CH_REFERENCE,
  dateBecameRegistrable: "2023-04-17 00:00:00.0",
  isServiceAddressSameAsUsualAddress: "N",
  dateOfBirth: "1979-04-19 00:00:000",
  usualResidentialAddress: {
    addressLine1: "72 COWLEY AVENUE",
    addressLine2: "QUIA EX ESSE SINT EU",
    careOf: "",
    country: "KUWAIT",
    locality: "AD EUM DEBITIS EST E",
    poBox: "FGdg",
    postalCode: "76022",
    premises: "REAGAN HICKMAN",
    region: "ULLAM DOLORUM CUPIDA"
  },
  principalAddress: {
    addressLine1: undefined,
    addressLine2: undefined,
    careOf: undefined,
    country: undefined,
    locality: undefined,
    poBox: undefined,
    postalCode: undefined,
    premises: undefined,
    region: undefined
  }
};

export const PRIVATE_BO_CORP_MOCK_DATA: BeneficialOwnerPrivateData = {
  hashedId: PRIVATE_BO_CORP_MOCK_DATA_CH_REFERENCE,
  dateBecameRegistrable: "2023-04-17 00:00:00.0",
  isServiceAddressSameAsUsualAddress: "N",
  dateOfBirth: "02-06-1998",
  principalAddress: {
    addressLine1: "72 COWLEY AVENUE",
    addressLine2: "QUIA EX ESSE SINT EU",
    careOf: "",
    country: "KUWAIT",
    locality: "AD EUM DEBITIS EST E",
    poBox: "FGdg",
    postalCode: "76022",
    premises: "REAGAN HICKMAN",
    region: "ULLAM DOLORUM CUPIDA"
  },
  usualResidentialAddress: undefined
};

export const PRIVATE_BO_GOV_MOCK_DATA: BeneficialOwnerPrivateData = {
  hashedId: PRIVATE_BO_GOV_MOCK_DATA_CH_REFERENCE,
  dateBecameRegistrable: "2023-04-17 00:00:00.0",
  isServiceAddressSameAsUsualAddress: "N",
  dateOfBirth: "02-06-1998",
  principalAddress: {
    addressLine1: "72 COWLEY AVENUE",
    addressLine2: "QUIA EX ESSE SINT EU",
    careOf: "",
    country: "Kuwait",
    locality: "AD EUM DEBITIS EST E",
    poBox: "FGdg",
    postalCode: "76022",
    premises: "REAGAN HICKMAN",
    region: "ULLAM DOLORUM CUPIDA"
  },
  usualResidentialAddress: undefined
};

export const PRIVATE_BENEFICAL_OWNERS_MOCK_DATA: BeneficialOwnerPrivateData[] = [
  PRIVATE_BO_INDIVIDUAL_MOCK_DATA, PRIVATE_BO_CORP_MOCK_DATA, PRIVATE_BO_GOV_MOCK_DATA
];

export const PRIVATE_BO_MOCK_DATA_PRINCIPAL_ADDRESS: BeneficialOwnerPrivateData[] = [
  PRIVATE_BO_CORP_MOCK_DATA
];

export const PRIVATE_BO_MOCK_DATA_UNDEFINED: BeneficialOwnerPrivateData[] = [{}];

export const APPLICATION_DATA_UPDATE_BO_MOCK: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
  [presenterType.PresenterKey]: PRESENTER_OBJECT_MOCK,
  [entityType.EntityKey]: ENTITY_OBJECT_MOCK,
  [dueDiligenceType.DueDiligenceKey]: DUE_DILIGENCE_OBJECT_MOCK,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK ],
  [managingOfficerType.ManagingOfficerKey]: [ MANAGING_OFFICER_OBJECT_MOCK ],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [ MANAGING_OFFICER_CORPORATE_OBJECT_MOCK ],
  [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT,
  [PaymentKey]: PAYMENT_OBJECT_MOCK,
  [OverseasEntityKey]: OVERSEAS_ENTITY_ID,
  [Transactionkey]: TRANSACTION_ID,
  [HasSoldLandKey]: hasSoldLandKey,
  [IsSecureRegisterKey]: isSecureRegisterKey,
  [TrustKey]: [TRUST],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_REMOVE_BO_MOCK: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_BO_MOCK,
  [IsRemoveKey]: true,
};

export const APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
  [presenterType.PresenterKey]: PRESENTER_OBJECT_MOCK,
  [entityType.EntityKey]: ENTITY_OBJECT_MOCK,
  [dueDiligenceType.DueDiligenceKey]: DUE_DILIGENCE_OBJECT_MOCK,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [],
  [managingOfficerType.ManagingOfficerKey]: [],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [],
  [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT,
  [OverseasEntityKey]: OVERSEAS_ENTITY_ID,
  [IsSecureRegisterKey]: isSecureRegisterKey,
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_UPDATE_BO_MO_MOCK: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_BO_MOCK,
  [managingOfficerType.ManagingOfficerKey]: [ UPDATE_MANAGING_OFFICER_OBJECT_MOCK ],
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: [ UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK ]
};

export const APPLICATION_DATA_MOCK_NEWLY_ADDED_BO: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK]
};

export const APPLICATION_DATA_UPDATE_BO_MOCK_NO_USUAL_ADDRESS: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_NO_ADDRESS ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK ],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_EMPTY_BO_MOCK: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_BO_MOCK,
  ...APPLICATION_DATA_UPDATE_BO_MOCK["beneficial_owners_individual"] = [ ]
};

export const APPLICATION_DATA_UPDATE_NO_BO_TRUSTEES_MOCK: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_BO_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK ]
};

export const APPLICATION_DATA_MULTIPLE_BO_MOCK: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_BO_MOCK,
  ...APPLICATION_DATA_UPDATE_BO_MOCK["beneficial_owners_individual"] = [UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION]
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

export const APPLICATION_DATA_WITH_TRUST_ID_MOCK: ApplicationData = {
  ...APPLICATION_DATA_NO_TRUSTS_MOCK,
  [TrustKey]: [TRUST_WITH_ID]
};

export const APPLICATION_DATA_UPDATE_MO_MOCK_UNSUBMITTED: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
  [managingOfficerType.ManagingOfficerKey]: [UPDATE_MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_UPDATE_MO_MOCK: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_NO_ADDRESS ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ],
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: [ UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK ],
  [managingOfficerType.ManagingOfficerKey]: [UPDATE_REVIEW_MANAGING_OFFICER_MOCK],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_UPDATE_MO_PRIVATE_DATA_MOCK: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_MO_MOCK,
  [updateType.UpdateKey]: UPDATE_OBJECT_PRIVATE_DATA_MOCK
};

export const APPLICATION_DATA_UNSUBMITTED_UPDATE_REVIEW_MO: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_MO_MOCK_UNSUBMITTED,
  ...APPLICATION_DATA_UPDATE_MO_MOCK_UNSUBMITTED[updateType.UpdateKey] = UNDEFINED_UPDATE_OBJECT_MOCK
};

export const APPLICATION_DATA_MANAGING_INDIVIDUAL_UPDATE_REVIEW_MO: ApplicationData = {
  ...APPLICATION_DATA_UPDATE_MO_MOCK,
  ...APPLICATION_DATA_UPDATE_MO_MOCK[updateType.UpdateKey] = UPDATE_OWNERS_DATA_WITH_VALUE,
};

export const APPLICATION_DATA_UPDATE_NO_TRUSTS_MOCK: ApplicationData = {
  [EntityNameKey]: OVERSEAS_NAME_MOCK,
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
  [TrustKey]: [],
  [EntityNumberKey]: COMPANY_NUMBER,
  [updateType.UpdateKey]: UPDATE_OBJECT_MOCK
};

export const serviceNameOE = "overseasEntity";
export const fnNamePutOE = "putOverseasEntity";
export const fnNamePostOE = "postOverseasEntity";
export const fnNameGetOE = "getOverseasEntity";

export const serviceNameTransaction = "transaction";
export const fnNamePostTransaction = "postTransaction";
export const fnNamePutTransaction = "putTransaction";
export const fnNameGetTransaction = "getTransaction";

export const serviceNameCompanyOfficers = "companyOfficers";
export const fnNameGetCompanyOfficers = "getCompanyOfficers";

// update overseas entity mocks
export const companyServiceNameOE = "companyProfile";
export const fnGetCompanyNameGetOE = "getCompanyProfile";

// update overseas entity payment
export const UPDATE_PAYMENT_WITH_TRANSACTION_URL = `${UPDATE_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/overseas-entity/${OVERSEAS_ENTITY_ID}/payment`;
export const UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING = `${UPDATE_PAYMENT_WITH_TRANSACTION_URL}${PAYMENT_QUERY_STRING}`;
export const UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING = `${UPDATE_PAYMENT_WITH_TRANSACTION_URL}${REFERENCE_QUERY_STRING}${STATE}${STATUS_DECLINED}`;
export const UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST = `${UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL}?index=0`;
export const UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST = `${UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL}?index=0`;
export const UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST = `${UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL}?index=0`;

// get company psc mocks
export const serviceNameGetCompanyPsc = "companyPsc";
export const fnNameGetCompanyPsc = "getCompanyPsc";

export const RESET_DATA_FOR_CHANGE_RESPONSE = {
  [PaymentKey]: undefined,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: undefined,
  [updateType.UpdateKey]: {
    registrable_beneficial_owner: undefined
  }
};

export const RESET_DATA_FOR_NO_CHANGE_RESPONSE = {
  [EntityNameKey]: "Test1",
  [presenterType.PresenterKey]: PRESENTER_OBJECT_MOCK,
  [OverseasEntityKey]: OVERSEAS_ENTITY_ID,
  [Transactionkey]: TRANSACTION_ID,
  [HasSoldLandKey]: hasSoldLandKey,
  [IsSecureRegisterKey]: isSecureRegisterKey,
  [EntityNumberKey]: COMPANY_NUMBER,
  [WhoIsRegisteringKey]: undefined,
  [dueDiligenceType.DueDiligenceKey]: undefined,
  [OverseasEntityDueDiligenceKey]: undefined,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: undefined,
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: undefined,
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: undefined,
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: undefined,
  [managingOfficerType.ManagingOfficerKey]: undefined,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: undefined,
  [PaymentKey]: undefined,
  [TrustKey]: undefined,
  [EntityKey]: {
    email: "",
    incorporation_country: "",
    is_on_register_in_country_formed_in: 0,
    is_service_address_same_as_principal_address: 0,
    law_governed: undefined,
    legal_form: undefined,
    principal_address: {},
    public_register_name: "",
    registration_number: undefined
  },
  [updateType.UpdateKey]: {
    registrable_beneficial_owner: undefined,
    bo_mo_data_fetched: true,
    review_beneficial_owners_individual: [
      {
        beneficial_owner_nature_of_control_types: [],
        ch_reference: "RandomeaP1EB70SSD9SLmiK5Y",
        date_of_birth: {
          day: "01",
          month: "undefined",
          year: undefined,
        },
        first_name: undefined,
        id: "/company/OE111129/persons-with-significant-control/individual/RandomeaP1EB70SSD9SLmiK5Y",
        is_on_sanctions_list: 0,
        is_service_address_same_as_usual_residential_address: 0,
        last_name: undefined,
        nationality: "British",
        non_legal_firm_members_nature_of_control_types: [],
        second_nationality: undefined,
        service_address: {
          country: "Wales",
          county: undefined,
          line_1: undefined,
          line_2: undefined,
          postcode: undefined,
          property_name_number: "Companies House",
          town: "Limavady",
        },
        start_date: undefined,
        trustees_nature_of_control_types: [],
        usual_residential_address: undefined,
      }
    ],
    review_beneficial_owners_corporate: [
      {
        beneficial_owner_nature_of_control_types: [],
        ch_reference: "OtherBOP1EB70SSD9SLmiK5Y",
        id: "/company/OE111129/persons-with-significant-control/corporate-entity/OtherBOP1EB70SSD9SLmiK5Y",
        is_on_register_in_country_formed_in: 0,
        is_on_sanctions_list: 0,
        is_service_address_same_as_principal_address: undefined,
        law_governed: undefined,
        legal_form: undefined,
        name: "Mr Other Beneficial Owner",
        non_legal_firm_members_nature_of_control_types: [],
        principal_address: {},
        public_register_name: undefined,
        registration_number: undefined,
        service_address: {
          country: "Wales",
          county: undefined,
          line_1: undefined,
          line_2: undefined,
          postcode: undefined,
          property_name_number: "Companies House",
          town: "Limavady",
        },
        start_date: undefined,
        trustees_nature_of_control_types: [],
      }
    ],
    review_beneficial_owners_government_or_public_authority: [
      {
        beneficial_owner_nature_of_control_types: [],
        ch_reference: "RandomeaP1EB70SSD9SLmiK5Y",
        id: "/company/OE111129/persons-with-significant-control/legal-person/RandomeaP1EB70SSD9SLmiK5Y",
        is_on_sanctions_list: 0,
        is_service_address_same_as_principal_address: undefined,
        law_governed: undefined,
        legal_form: undefined,
        name: "Mr Random Notreal Person",
        non_legal_firm_members_nature_of_control_types: [],
        principal_address: {},
        service_address: {
          country: "Wales",
          county: undefined,
          line_1: undefined,
          line_2: undefined,
          postcode: undefined,
          property_name_number: "Companies House",
          town: "Limavady",
        },
        start_date: undefined,
      }
    ],
    review_managing_officers_corporate: [
      {
        ch_reference: "officers2",
        contact_full_name: "Test User",
        id: "/company/OE111129/officers2",
        is_on_register_in_country_formed_in: 0,
        is_service_address_same_as_principal_address: undefined,
        law_governed: undefined,
        legal_form: undefined,
        name: "Rev MO Corporate",
        principal_address: undefined,
        public_register_name: undefined,
        registration_number: undefined,
        role_and_responsibilities: undefined,
        service_address: {
          country: "England",
          county: "Gloucestershire",
          line_1: "Cerney House",
          line_2: "North Cerney",
          postcode: "GL7 7BX",
          property_name_number: "Samron House",
          town: "Cirencester",
        },
        start_date: {
          day: "1",
          month: "1",
          year: "2023"
        },
      }
    ],
    review_managing_officers_individual: [
      {
        ch_reference: "officers1",
        id: "/company/OE111129/officers1",
        role_and_responsibilities: undefined,
        service_address: {
          country: "England",
          county: "Gloucestershire",
          line_1: "Cerney House",
          line_2: "North Cerney",
          postcode: "GL7 7BX",
          property_name_number: "Samron House",
          town: "Cirencester",
        },
        start_date: {
          day: "1",
          month: "1",
          year: "2023"
        },
      }
    ],
  }
};

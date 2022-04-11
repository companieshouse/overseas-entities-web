import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken, ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { DESCRIPTION, REFERENCE } from "../../src/config";
import {
  APPLICATION_DATA_KEY,
  beneficialOwnerGovType,
  beneficialOwnerTypeType,
  managingOfficerTypeType,
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
  BeneficialOwnerStatementChoice,
  BeneficialOwnerTypeChoice,
  corpNatureOfControl, ManagingOfficerTypeChoice,
  natureOfControl,
  statementCondition,
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
  service_address: ADDRESS_MOCK
};

export const BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK: beneficialOwnerStatementType.BeneficialOwnerStatement = {
  beneficialOwnerStatement: BeneficialOwnerStatementChoice.allIdentifiedAllSupplied
};

export const BENEFICIAL_OWNER_TYPE_OBJECT_MOCK: beneficialOwnerTypeType.BeneficialOwnerType = {
  beneficialOwnerType: [ BeneficialOwnerTypeChoice.individual, BeneficialOwnerTypeChoice.otherLegal, BeneficialOwnerTypeChoice.government ]
};

export const MANAGING_OFFICER_TYPE_OBJECT_MOCK: managingOfficerTypeType.ManagingOfficerType = {
  managingOfficerType: [ ManagingOfficerTypeChoice.individual, ManagingOfficerTypeChoice.corporate ]
};

export const BENEFICIAL_OWNER_OTHER_OBJECT_MOCK: beneficialOwnerOtherType.BeneficialOwnerOther = {
  corporationName: "TestCorporation",
  principalAddress: ADDRESS,
  isSameAddress: yesNoResponse.Yes,
  serviceAddress: ADDRESS,
  lawGoverned: "TheLaw",
  startDate: {
    day: 1,
    month: 1,
    year: 2011
  },
  natureOfControl: natureOfControl.over25upTo50Percent,
  statementCondition: statementCondition.statement1,
  isSanctioned: yesNoResponse.No
};

export const BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK: beneficialOwnerIndividualType.BeneficialOwnerIndividual = {
  fullName: "Ivan Drago",
  dateOfBirth: {
    day: 21,
    month: 3,
    year: 1947
  },
  ownerNationality: "Russian",
  usualResidentialAddress: ADDRESS,
  serviceAddress: ADDRESS,
  natureOfControl: natureOfControl.over50under75Percent
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

const BENEFICIAL_OWNER_PRESENTER_OBJECT_MOCK = {
  fullName: "fullName",
  phoneNumber: "phoneNumber",
  role: "other",
  roleTitle: "roleTitle",
  registrationNumber: "123"
} as presenterType.Presenter;

export const APPLICATION_DATA_MOCK: ApplicationData = {
  [presenterType.PresenterKey]: BENEFICIAL_OWNER_PRESENTER_OBJECT_MOCK,
  [entityType.EntityKey]: ENTITY_OBJECT_MOCK,
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  [beneficialOwnerStatementType.BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  [beneficialOwnerTypeType.BeneficialOwnerTypeKey]: BENEFICIAL_OWNER_TYPE_OBJECT_MOCK,
  [managingOfficerTypeType.ManagingOfficerTypeKey]: MANAGING_OFFICER_TYPE_OBJECT_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  [beneficialOwnerGovType.BeneficialOwnerGovKey]: BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  [managingOfficerType.ManagingOfficerKey]: MANAGING_OFFICER_OBJECT_MOCK,
  [managingOfficerCorporateType.ManagingOfficerCorporateKey]: MANAGING_OFFICER_CORPORATE_OBJECT_MOCK
};

export const ERROR: Error = new Error(ANY_MESSAGE_ERROR);
export const TRANSACTION_ID = "12345";
export const TRANSACTION = { reference: REFERENCE, description: DESCRIPTION };

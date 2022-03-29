import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { ApplicationData, APPLICATION_DATA_KEY, beneficialOwnerTypeType, beneficialOwnerOtherType, entityType, presenterType } from "../../src/model";
import {
  BeneficialOwnerTypeChoice,
  natureOfControl,
  statementCondition,
  yesNoResponse
} from "../../src/model/data.types.model";

export const userMail = "userWithPermission@ch.gov.uk";

const SIGN_IN_INFO = {
  [SignInInfoKeys.SignedIn]: 1,
  [SignInInfoKeys.UserProfile]: {
    [UserProfileKeys.Email]: userMail
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

const ADDRESS = {
  addressLine1: "addressLine1",
  addressLine2: "addressLine2",
  town: "town",
  county: "county",
  postcode: "BY 2"
};

export const ENTITY_OBJECT_MOCK: entityType.Entity = {
  overseasEntityName: "overseasEntityName",
  incorporationCountry: "incorporationCountry",
  principalAddress: ADDRESS,
  isAddressSameAsPrincipalAddress: 0,
  serviceAddress: {},
  email: "email",
  legalForm: "legalForm",
  governedLaw: "governedLaw",
  publicRegister: "publicRegister",
  registrationNumber: 123
};

export const BENEFICIAL_OWNER_TYPE_OBJECT_MOCK: beneficialOwnerTypeType.BeneficialOwnerType = {
  beneficialOwnerType: [ BeneficialOwnerTypeChoice.individual, BeneficialOwnerTypeChoice.otherLegal ]
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

export const APPLICATION_DATA_MOCK: ApplicationData = {
  [presenterType.PresenterKey]: {
    fullName: "fullName",
    phoneNumber: "phoneNumber",
    role: 2,
    roleTitle: "roleTitle",
    registrationNumber: 123
  },
  [entityType.EntityKey]: {},
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  [beneficialOwnerTypeType.BeneficialOwnerTypeKey]: BENEFICIAL_OWNER_TYPE_OBJECT_MOCK
};


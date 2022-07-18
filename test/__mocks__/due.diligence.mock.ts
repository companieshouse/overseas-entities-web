import { DueDiligence } from "../../src/model/due.diligence.model";
import {
  ADDRESS,
  IDENTITY_ADDRESS_REQ_BODY_EMPTY_MOCK,
  IDENTITY_ADDRESS_REQ_BODY_MAX_LENGTH_MOCK,
  IDENTITY_ADDRESS_REQ_BODY_MOCK,
} from "./fields/address.mock";
import { DATE, EMPTY_DATE } from "./fields/date.mock";

const TEN_CHARACTERS_LENGTH = "LKJHG.asdf";
const FIFTY_CHARACTERS_LENGTH = "ABCDEabcde0123456789QWERTYUIOPqwertyuiopZXCVBzxcvb";

const MAX_256 = FIFTY_CHARACTERS_LENGTH.repeat(5) + TEN_CHARACTERS_LENGTH;

export const DUE_DILIGENCE_OBJECT_MOCK: DueDiligence = {
  identity_date: DATE,
  name: "Any name",
  identity_address: ADDRESS,
  email: "email@email.ch",
  supervisory_name: "Any supervisory name",
  aml_number: "Any AML number",
  agent_code: "Any agent code",
  partner_name: "Any partner name",
  diligence: "agree"
};

export const DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK = {
  ...DUE_DILIGENCE_OBJECT_MOCK,
  ...IDENTITY_ADDRESS_REQ_BODY_MOCK,
};

const DUE_DILIGENCE_EMPTY_OBJECT_MOCK: DueDiligence = {
  identity_date: EMPTY_DATE,
  name: "",
  identity_address: {},
  email: "",
  supervisory_name: "",
  aml_number: "",
  agent_code: "",
  partner_name: "",
  diligence: ""
};

const DUE_DILIGENCE_MAX_LENGTH_OBJECT_MOCK: DueDiligence = {
  identity_date: DATE,
  name: MAX_256,
  identity_address: {},
  email: MAX_256,
  supervisory_name: MAX_256,
  aml_number: MAX_256,
  agent_code: MAX_256,
  partner_name: MAX_256,
  diligence: "agree"
};

export const DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK = {
  ...DUE_DILIGENCE_EMPTY_OBJECT_MOCK,
  ...IDENTITY_ADDRESS_REQ_BODY_EMPTY_MOCK,
};

export const DUE_DILIGENCE_REQ_BODY_MAX_LENGTH_FIELDS_OBJECT_MOCK = {
  ...DUE_DILIGENCE_MAX_LENGTH_OBJECT_MOCK,
  ...IDENTITY_ADDRESS_REQ_BODY_MAX_LENGTH_MOCK,
};

export const DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE = {
  ...DUE_DILIGENCE_OBJECT_MOCK,
};

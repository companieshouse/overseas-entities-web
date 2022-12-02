import { DueDiligence } from "../../src/model/due.diligence.model";
import {
  ADDRESS,
  IDENTITY_ADDRESS_REQ_BODY_EMPTY_MOCK,
  IDENTITY_ADDRESS_REQ_BODY_MAX_LENGTH_MOCK,
  IDENTITY_ADDRESS_REQ_BODY_MOCK,
} from "./fields/address.mock";
import { MAX_256 } from "./max.length.mock";
import { DATE, EMPTY_DATE } from "./fields/date.mock";

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

export const DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES = {
  identity_date: DATE,
  name: "Any name",
  identity_address: ADDRESS,
  email: " user@domain.roe ",
  supervisory_name: "Any supervisory name",
  aml_number: "Any AML number",
  agent_code: "Any agent code",
  partner_name: "Any partner name",
  diligence: "agree",
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
  name: MAX_256 + "1",
  identity_address: {},
  email: MAX_256 + "1",
  supervisory_name: MAX_256 + "1",
  aml_number: MAX_256 + "1",
  agent_code: MAX_256 + "1",
  partner_name: MAX_256 + "1",
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

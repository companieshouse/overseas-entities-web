import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ANY_MESSAGE_ERROR } from "./text.mock";

export const MO_MOCK = {
  "address": {
    "region": "Gloucestershire",
    "postalCode": "GL7 7BX",
    "locality": "Cirencester",
    "addressLine2": "North Cerney",
    "addressLine1": "Cerney House",
    "country": "England",
    "premises": "Samron House"
  },
  "appointedOn": "2023-01-01",
  "links": {
    "self": "/company/OE111129/officers1",
    "officer": {
      "appointments": "/officers/secretary1/appointments"
    }
  },
  "name": "Dr MO Individual",
  "officerRole": "managing-officer",
  "contactDetails": {
    contactName: "Test User"
  }
};

export const MO_CORPORATE_MOCK = {
  "address": {
    "region": "Gloucestershire",
    "postalCode": "GL7 7BX",
    "locality": "Cirencester",
    "addressLine2": "North Cerney",
    "addressLine1": "Cerney House",
    "country": "England",
    "premises": "Samron House"
  },
  "appointedOn": "2023-01-01",
  "links": {
    "self": "/company/OE111129/officers2",
    "officer": {
      "appointments": "/officers/secretary1/appointments"
    }
  },
  "name": "Rev MO Corporate",
  "officerRole": "corporate-managing-officer",
  "contactDetails": {
    contactName: "Test User"
  }
};

export const MOCK_GET_COMPANY_OFFICERS: CompanyOfficers = {
  "inactiveCount": '0',
  "links": {
    "self": "/company/OE111129/officers",
  },
  "kind": "officer-list",
  "itemsPerPage": '35',
  "etag": "015ab53552e02f53c8d92e50a678d30628256e73",
  "activeCount": '2',
  "startIndex": '0',
  "items": [
    MO_MOCK,
    MO_CORPORATE_MOCK
  ],
  "resignedCount": '0',
  "totalResults": '2'
};

export const MOCK_GET_COMPANY_OFFICERS_RESPONSE: ApiResponse<CompanyOfficers> = {
  httpStatusCode: 200,
  resource: MOCK_GET_COMPANY_OFFICERS
};

export const MOCK_GET_COMPANY_OFFICERS_UNAUTHORISED_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 401,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

export const MOCK_GET_COMPANY_OFFICERS_NOT_FOUND_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 404,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  CompanyPersonsWithSignificantControlStatementsResource
} from "@companieshouse/api-sdk-node/dist/services/company-psc-statements";
import { ANY_MESSAGE_ERROR } from "./text.mock";

const NO_INDIVIDUAL_STATEMENT_MOCK = {
  "links": {
    "self": "/company/OE000001/persons-with-significant-control-statements/123"
  },
  "notified_on": "2025-01-01T00:00:10.100Z",
  "etag": "1234",
  "kind": "persons-with-significant-control-statement",
  "statement": "no-individual-or-entity-with-signficant-control"
};

export const MOCK_GET_COMPANY_PSC_STATEMENTS_RESOURCE_INDIVIDUAL = {
  "active_count": '1',
  "ceased_count": '',
  "items": [
    NO_INDIVIDUAL_STATEMENT_MOCK
  ],
  "items_per_page": '25',
  "links": {
    "self": "/company/OE000001/persons-with-significant-control-statements"
  },
  "start_index": '0',
  "total_results": '1'
};

export const MOCK_GET_COMPANY_PSC_STATEMENTS_RESPONSE: ApiResponse<CompanyPersonsWithSignificantControlStatementsResource> = {
  httpStatusCode: 200,
  resource: MOCK_GET_COMPANY_PSC_STATEMENTS_RESOURCE_INDIVIDUAL
};

export const MOCK_GET_COMPANY_PSC_STATEMENTS_UNAUTHORISED_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 401,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

export const MOCK_GET_COMPANY_PSC_STATEMENTS_NOT_FOUND_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 404,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

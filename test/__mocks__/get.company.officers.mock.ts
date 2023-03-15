import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { CompanyOfficersResource } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { ANY_MESSAGE_ERROR } from "./text.mock";

export const MOCK_GET_COMPANY_OFFICERS_RESOURCE: CompanyOfficersResource = {
  "inactive_count": '0',
  "links": {
    "self": "/company/OE111129/officers"
  },
  "kind": "officer-list",
  "items_per_page": '35',
  "etag": "015ab53552e02f53c8d92e50a678d30628256e73",
  "active_count": '2',
  "start_index": '0',
  "items": [
    {
      "address": {
        "region": "Gloucestershire",
        "postal_code": "GL7 7BX",
        "locality": "Cirencester",
        "address_line_2": "North Cerney",
        "address_line_1": "Cerney House",
        "country": ""
      },
      "appointed_on": "",
      "links": {
        "officer": {
          "appointments": "/officers/secretary1/appointments"
        }
      },
      "name": "JONES, Tim Bill",
      "officer_role": "secretary"
    }
  ],
  "resigned_count": '0',
  "total_results": '2'
};

export const MOCK_GET_COMPANY_OFFICERS_RESPONSE: ApiResponse<CompanyOfficersResource> = {
  httpStatusCode: 200,
  resource: MOCK_GET_COMPANY_OFFICERS_RESOURCE
};

export const MOCK_GET_COMPANY_OFFICERS_UNAUTHORISED_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 401,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

export const MOCK_GET_COMPANY_OFFICERS_NOT_FOUND_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 404,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

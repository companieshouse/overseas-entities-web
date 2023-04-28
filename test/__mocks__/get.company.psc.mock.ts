import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { ANY_MESSAGE_ERROR } from "./text.mock";

export const MOCK_GET_COMPANY_PSC_RESOURCE = {
  "active_count": '1',
  "ceased_count": '',
  "items": [
    {
      "natures_of_control": [
        'ownership-of-shares-more-than-25-percent-registered-overseas-entity',
        'ownership-of-shares-more-than-25-percent-as-trust-registered-overseas-entity',
      ],
      "kind": "individual-person-with-significant-control",
      "name_elements": {
        "middleName": "Notreal",
        "forename": "Random",
        "title": "Mr",
        "surname": "Person"
      },
      "name": "Mr Random Notreal Person",
      "notified_on": "2022-04-06",
      "nationality": "British",
      "address": {
        "postal_code": "CF14 3UZ",
        "premises": "Companies House",
        "locality": "Limavady",
        "country": "Wales",
        "address_line_1": "Crown Way"
      },
      "country_of_residence": "Wales",
      "date_of_birth": {
        "month": '8',
        "year": '1983'
      },
      "links": {
        "self": "/company/OE111129/persons-with-significant-control/individual/RandomeaP1EB70SSD9SLmiK5Y"
      },
      "etag": "8cb9d4c9ba82059ff01ed123405bc41c1bc4db40"
    },
    {
      "natures_of_control": [
        'ownership-of-shares-more-than-25-percent-registered-overseas-entity',
        'ownership-of-shares-more-than-25-percent-as-trust-registered-overseas-entity',
      ],
      "kind": "individual-person-with-significant-control",
      "name_elements": {
        "middleName": "Second",
        "forename": "Beneficialowner",
        "title": "Mr",
        "surname": "Test"
      },
      "name": "Mr Second BeneficialOwner Test",
      "notified_on": "2000-03-02",
      "nationality": "Irish",
      "address": {
        "postal_code": "CB11 1AB",
        "premises": "Queens House",
        "locality": "Test",
        "country": "Ireland",
        "address_line_1": "Prince way"
      },
      "country_of_residence": "Ireland",
      "date_of_birth": {
        "month": '1',
        "year": '1992'
      },
      "links": {
        "self": "/company/OE111129/persons-with-significant-control/individual/HashedkeyP1EB70SSD9SLmiK5Y"
      },
      "etag": "1ab9d4c9ba82059ff01ed123405bc41c1bc4ad20"
    }
  ],
  "items_per_page": '25',
  "links": {
    "self": "/company/OE111129/persons-with-significant-control"
  },
  "start_index": '0',
  "total_results": ''
};

export const MOCK_GET_COMPANY_PSC_RESOURCE_CORPORATE_ENTITY = {
  "active_count": '1',
  "ceased_count": '',
  "items": [
    {
      "natures_of_control": [
        'ownership-of-shares-more-than-25-percent-registered-overseas-entity'
      ],
      "kind": "corporate-entity-beneficial-owner",
      "name_elements": {
        "middleName": "Beneficial",
        "forename": "Other",
        "title": "Mr",
        "surname": "Owner"
      },
      "name": "Mr Other Beneficial Owner",
      "notified_on": "2021-01-16",
      "nationality": "Irish",
      "address": {
        "postal_code": "CF14 3UZ",
        "premises": "Companies House",
        "locality": "Limavady",
        "country": "Wales",
        "address_line_1": "Crown Way"
      },
      "country_of_residence": "Wales",
      "date_of_birth": {
        "month": '8',
        "year": '1992'
      },
      "links": {
        "self": "/company/OE111129/persons-with-significant-control/corporate-entity/OtherBOP1EB70SSD9SLmiK5Y"
      },
      "etag": "8cb9d4c9ba82059ff01ed123405bc41c1bc4db40"
    },
  ],
  "items_per_page": '25',
  "start_index": '0',
  "total_results": ''
};

export const MOCK_GET_COMPANY_PSC_RESPONSE: ApiResponse<CompanyPersonsWithSignificantControlResource> = {
  httpStatusCode: 200,
  resource: MOCK_GET_COMPANY_PSC_RESOURCE
};

export const MOCK_GET_COMPANY_PSC_UNAUTHORISED_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 401,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

export const MOCK_GET_COMPANY_PSC_NOT_FOUND_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 404,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

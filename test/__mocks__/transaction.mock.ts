import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ANY_MESSAGE_ERROR } from "./text.mock";

export const MOCK_TRANSACTION_ID = "075044-629416-739860";

export const MOCK_GET_TRANSACTION = {
  "closed_at": "2023-01-17T20:09:07Z",
  "company_name": "Test1",
  "etag": "1b72eddd5ee869c6a02c56575b270722d28d7ae0",
  "status": "closed pending paymentx",
  "links": {
    "self": "/transactions/075044-629416-739860",
    "payment": "/transactions/075044-629416-739860/payment"
  },
  "closed_by": {
    "language": "en",
    "email": "email@ch.gov.uk",
    "id": "123456789asdfghjk"
  },
  "reference": "OverseasEntitiesReference_63c6fff8151ae73c3f28002b",
  "kind": "transaction",
  "created_at": "2023-01-17T20:07:19Z",
  "id": "075044-629416-739860",
  "created_by": {
    "language": "en",
    "id": "123456789asdfghjk",
    "email": "email@ch.gov.uk"
  },
  "resources": {
    "/transactions/075044-629416-739860/overseas-entity/63c6fff8151ae73c3f28002b": {
      "kind": "overseas-entity",
      "links": {
        "costs": "/transactions/075044-629416-739860/overseas-entity/63c6fff8151ae73c3f28002b/costs",
        "validation_status": "/transactions/075044-629416-739860/overseas-entity/63c6fff8151ae73c3f28002b/validation-status",
        "resource": "/transactions/075044-629416-739860/overseas-entity/63c6fff8151ae73c3f28002b"
      }
    }
  },
  "description": "Overseas Entities Transaction",
  "updated_at": "2023-01-17T20:09:07Z",
  "submitted_by": {
    "user_id": "123456789asdfghjk",
    "application_id": "1234567890.ch.gov.uk"
  },
  "resume_journey_uri": "/register-an-overseas-entity/transaction/075044-629416-739860/overseas-entity/63c6fff8151ae73c3f28002b/resume"
};

export const MOCK_GET_TRANSACTION_RESPONSE: ApiResponse<Transaction> = {
  httpStatusCode: 200,
  resource: MOCK_GET_TRANSACTION
};

export const MOCK_GET_ERROR_TRANSACTION_RESPONSE: ApiErrorResponse = {
  httpStatusCode: 500,
  errors: [ { error: ANY_MESSAGE_ERROR }]
};

import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

export const PAYMENT_REF_MOCK: CreatePaymentRequest = {
  resource: 'http://api.chs.local:4001/transactions/014857-082717-925977/payment',
  state: 'b0bc42c7-22a7-49ea-9245-3e9fb5262c87',
  redirectUri: 'http://chs.local/register-an-overseas-entity/transaction/014857-082717-925977/overseas-entity/6ad8dee9e21e15c7911c4fc0/payment',
  reference: 'OverseasEntitiesReference_014857-082717-925977'
};

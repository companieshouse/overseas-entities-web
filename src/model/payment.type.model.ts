export const PaymentKey = "payment";

export interface Payment {
    redirectUri: string;
    reference: string;
    resource: string;
    state: string;
    transactionId: string;
    overseasEntityId: string;
}

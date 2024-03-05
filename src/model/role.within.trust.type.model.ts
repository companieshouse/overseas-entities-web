/**
 * This is a list of roles that an individual, legal entity(corporate) or a historical beneficial owner trustee can have within a trust.
 *
 * These are asked as roles to the your in the webpage but passed down to the api as type (stored as TRUSTEE_TYPE in the chips database).
 */

export enum RoleWithinTrustType {
    BENEFICIARY = "Beneficiary",
    SETTLOR = "Settlor",
    GRANTOR = "Grantor",
    INTERESTED_PERSON = "Interested_Person",
    HISTORICAL_BENEFICIAL_OWNER = "Historical_Beneficial_Owner",
}

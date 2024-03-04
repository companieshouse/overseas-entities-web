/**
 * This is a list of roles that a indiviudual, legal entity(corportate) or former Beneficial trustee can have within a trust.
 *
 * These are asked as roles to the your in the webpage but passed down to the api as type (stored as TRUSTEE_TYPE in the chips database).
 */

export enum RoleWithinTrustType {
    BENEFICIARY = "Beneficiary",
    SETTLOR = "Settlor",
    GRANTOR = "Grantor",
    INTERESTED_PERSON = "Interested_Person",
    FORMER_BENEFICIAL_OWNER = "Former_Beneficial_Owner",
}

import { IHttpClient } from "../../http";
import {
    CompanyProfile, CompanyProfileResource, RegisteredOfficeAddressResource, AccountsResource,
    NextAccountsResource, ConfirmationStatementResource, LinksResource, ForeignCompanyDetailsResource, ServiceAddressResource
} from "./types";
import Resource from "../resource";

import { logger } from "../../../utils/logger";

/**
 * https://developer.companieshouse.gov.uk/api/docs/company/company_number/company_number.html
 */
export default class CompanyProfileService {
    constructor(private readonly client: IHttpClient) { }

    /**
   * Get the profile for a company.
   *
   * @param number the company number to look up
   */
    public async getCompanyProfile(number: string): Promise<Resource<CompanyProfile>> {
        const resp = await this.client.httpGet(`/company/${number}`);

        const resource: Resource<CompanyProfile> = {
            httpStatusCode: resp.status
        };

        if (resp.error) {
            return resource;
        }

        if (true) {
            logger.info("AKDEBUG ********");
            for (let prop in resp.body) {
                logger.info(prop + ":" + resp.body[prop]);
            }
            const foreignCompanyAddress = resp.body['foreign_company_details'];
            if (foreignCompanyAddress !== null && foreignCompanyAddress !== undefined) {
                for (let prop in foreignCompanyAddress) {
                    logger.info("AKDEBUG -------");
                    logger.info(prop + ":" + foreignCompanyAddress[prop]);
                }
            }
            logger.info("AKDEBUG *********");
        }

        // cast the response body to the expected type
        const body = resp.body as CompanyProfileResource;

        const roa = body.registered_office_address as RegisteredOfficeAddressResource;
        const serviceAddress = body.service_address as ServiceAddressResource;

        logger.info("AKDEBUG service adress line 1" + serviceAddress?.address_line_1);
        const acc = body.accounts as AccountsResource;

        const nextAccs = acc?.next_accounts as NextAccountsResource;

        const confirmationStatement = body.confirmation_statement as ConfirmationStatementResource;

        const foreignCompanyDetails = body.foreign_company_details as ForeignCompanyDetailsResource;
        const originatingRegistry = foreignCompanyDetails?.originating_registry;

        logger.info("AKDEBUG fcd governed by" + foreignCompanyDetails?.governed_by);

        const links = body.links as LinksResource;

        resource.resource = {
            companyName: body.company_name,
            companyNumber: body.company_number,
            companyStatus: body.company_status,
            companyStatusDetail: body.company_status_detail,
            dateOfCreation: body.date_of_creation,
            jurisdiction: body.jurisdiction,
            sicCodes: body.sic_codes,
            hasBeenLiquidated: body.has_been_liquidated,
            hasSuperSecurePscs: body?.has_super_secure_pscs,
            type: body.type,
            hasCharges: body.has_charges,
            hasInsolvencyHistory: body.has_insolvency_history,
            registeredOfficeAddress: {
                addressLineOne: roa?.address_line_1,
                addressLineTwo: roa?.address_line_2,
                careOf: roa?.care_of,
                country: roa?.country,
                locality: roa?.locality,
                poBox: roa?.po_box,
                postalCode: roa?.postal_code,
                premises: roa?.premises,
                region: roa?.region
            },
            serviceAddress: {
                addressLineOne: serviceAddress?.address_line_1,
                addressLineTwo: serviceAddress?.address_line_2,
                careOf: serviceAddress?.care_of,
                country: serviceAddress?.country,
                locality: serviceAddress?.locality,
                poBox: serviceAddress?.po_box,
                postalCode: serviceAddress?.postal_code,
                premises: serviceAddress?.premises,
                region: serviceAddress?.region
            },
            accounts: {
                nextAccounts: {
                    periodEndOn: nextAccs?.period_end_on,
                    periodStartOn: nextAccs?.period_start_on
                },
                nextDue: acc?.next_due,
                overdue: acc?.overdue
            },
            confirmationStatement: {
                lastMadeUpTo: confirmationStatement?.last_made_up_to,
                nextDue: confirmationStatement?.next_due,
                nextMadeUpTo: confirmationStatement?.next_made_up_to,
                overdue: confirmationStatement?.overdue
            },
            foreignCompanyDetails: {
                businessActivity: foreignCompanyDetails?.business_activity,
                governedBy: foreignCompanyDetails?.governed_by,
                originatingRegistry: {
                    name: foreignCompanyDetails?.originating_registry?.name,
                    country: foreignCompanyDetails?.originating_registry?.country
                },
                isACreditFinacialInstitution: foreignCompanyDetails?.is_a_credit_finacial_institution,
                legalForm: foreignCompanyDetails?.legal_form
            },
            links: {
                filingHistory: links?.filing_history
            }
        };

        return resource;
    }
}

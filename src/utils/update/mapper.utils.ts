import { Address } from "../../model/data.types.model";
import { OfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const mapAddress = (address: any): Address => {
  if (!address) {
    return {};
  }
  return {
    property_name_number: address.premises,
    line_1: address.addressLineOne,
    line_2: address.addressLineTwo,
    town: address.locality,
    county: address.region,
    country: address.country,
    postcode: address.postalCode
  };
};

export const mapBOMOAddress = (address: any) => {
  if (!address) {
    return {};
  }
  return {
    property_name_number: address.premises,
    line_1: address.addressLine1,
    line_2: address.addressLine2,
    town: address.locality,
    county: address.region,
    country: address.country,
    postcode: address.postalCode
  };
};

type AddressMatches = {
  (address1: Address, address2?: Address): boolean;
  (address1: OfficeAddress, address2?: OfficeAddress): boolean;
};

export const isSameAddress: AddressMatches = (address1: any, address2?: any) => {
  return !address2 || Object.keys(address1).every(key => address1[key] === address2[key]);
};

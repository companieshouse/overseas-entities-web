import { Address, InputDate } from "../../model/data.types.model";
import { OfficeAddress, ServiceAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Address as PSCAddress, DateOfBirth as PSCDateOfBirth } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { Address as OfficerAddress, DateOfBirth as OfficerDateOfBirth } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

type DateOfBirthTypes = {
  (dateOfBirth: PSCDateOfBirth | undefined): InputDate;
  (dateOfBirth: OfficerDateOfBirth | undefined): InputDate;
};

export const mapDateOfBirth : DateOfBirthTypes = (dateOfBirth) => {
  return {
    day: dateOfBirth?.day,
    month: dateOfBirth?.month,
    year: dateOfBirth?.year
  } as InputDate;
};

export const mapAddress = (address: ServiceAddress | undefined): Address => {
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

type BOMOAddressMapTypes = {
  (address: PSCAddress | undefined): Address;
  (address: OfficerAddress | undefined): Address;
};

export const mapBOMOAddress: BOMOAddressMapTypes = (address: any) => {
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

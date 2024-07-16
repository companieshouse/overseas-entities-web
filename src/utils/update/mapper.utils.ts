import { Address, InputDate } from "../../model/data.types.model";
import { OfficeAddress, ServiceAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Address as PSCAddress, DateOfBirth as PSCDateOfBirth, NameElements } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { Address as OfficerAddress, DateOfBirth as OfficerDateOfBirth } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { padWithZero } from "../../controllers/update/update.review.beneficial.owner.individual";
import { PrivateAddress } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";

type DateOfBirthTypes = {
  (dateOfBirth: PSCDateOfBirth | undefined): InputDate;
  (dateOfBirth: OfficerDateOfBirth | undefined): InputDate;
};

export const mapDateOfBirth: DateOfBirthTypes = (dateOfBirth) => {
  return {
    day: dateOfBirth?.day ? padWithZero(dateOfBirth?.day, 2, "0") : "01",
    month: padWithZero(dateOfBirth?.month, 2, "0"),
    year: dateOfBirth?.year
  } as InputDate;
};

export const mapSelfLink = (selfLink: string | undefined): string | undefined => {
  if (selfLink === undefined) {
    return undefined;
  }
  const path = selfLink.split('/');
  return path.length > 0 ? path[path.length - 1] : undefined;
};

export const mapInputDate = (date: string | undefined): InputDate | undefined => {
  if (date === undefined) {
    return undefined;
  }

  const [dateWithoutTimestamp] = date.split(' ');

  const yearMonthDay = dateWithoutTimestamp.split('-');
  if (yearMonthDay.length <= 2) {
    return {
      day: '',
      month: stripZero(yearMonthDay[1]),
      year: yearMonthDay[0]
    };
  }

  return {
    day: (yearMonthDay.length > 2 ? stripZero(yearMonthDay[2]) : ""),
    month: stripZero(yearMonthDay[1]),
    year: yearMonthDay[0]
  };
};

function stripZero(str: string) {
  return str.startsWith('0') ? str.substring(1) : str;
}

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
    country: lowerCaseAllWordsExceptFirstLetters(address.country),
    postcode: address.postalCode
  };
};

type BOMOAddressMapTypes = {
  (address: PSCAddress | undefined): Address | undefined;
  (address: OfficerAddress | undefined): Address | undefined;
  (address: PrivateAddress | undefined): PrivateAddress | undefined;
};

export const mapBOMOAddress: BOMOAddressMapTypes = (address: any) => {
  if (!address) {
    return undefined;
  }

  return {
    property_name_number: address.premises,
    line_1: address.addressLine1,
    line_2: address.addressLine2,
    town: address.locality,
    county: address.region,
    country: lowerCaseAllWordsExceptFirstLetters(address.country),
    postcode: address.postalCode
  };
};

export const splitNationalities = (officerNationalities: string | undefined): string[] => {
  if (!officerNationalities) {
    return [""];
  }
  return officerNationalities.split(/\s*,\s*/).slice(0, 2);
};

export const mapBOIndividualName = (name: NameElements) => {
  if (name?.middleName && name.middleName.trim() !== "") {
    return name.forename + " " + name.middleName;
  }
  return name?.forename;
};

type AddressMatches = {
  (address1: Address | undefined, address2?: Address | undefined): boolean;
  (address1: OfficeAddress | undefined, address2?: OfficeAddress | undefined): boolean;
};

export const isSameAddress: AddressMatches = (address1: any, address2?: any) => {
  if (address2 === undefined) {
    return false;
  } else {
    return Object.keys(address1).every(key => address1[key] === address2[key]);
  }
};

export const lowerCaseAllWordsExceptFirstLetters = (country: string | undefined) => {
  if (!country){
    return "";
  }

  const wordsForAllLowerCase = ["AND", "OF", "THE", "DA", "PART", "CITIZEN"];

  return country.replace(/\w*/g, (word, index) => {
    if (word.toUpperCase() === "MCDONALD") {
      return "McDonald";
    }

    if (word.toUpperCase() === "DRC") {
      return word.toUpperCase();
    }

    if (index !== 0 && wordsForAllLowerCase.includes(word.toUpperCase())){
      return word.toLowerCase();
    }

    return `${word.slice(0, 1)}${word.slice(1).toLowerCase()}`;
  });
};

export const splitOriginatingRegistryName = (registryName: string | undefined) => {
  if (!registryName){
    return { registryName: "", jurisdiction: "" };
  }

  const firstComma = registryName.indexOf(",");

  if (firstComma >= 0) {
    return {
      registryName: registryName.substring(0, firstComma),
      jurisdiction: registryName.substring(firstComma + 1, registryName.length).trim()
    };
  }

  return { registryName: registryName, jurisdiction: "" };
};

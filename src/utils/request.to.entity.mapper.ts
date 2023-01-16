import { Request } from "express";
import {
  prepareData,
  mapFieldsToDataObject,
} from "../utils/application.data";

import { EntityKeys } from "../model/entity.model";
import { ApplicationDataType } from "../model";
import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  IsOnRegisterInCountryFormedInKey,
  PublicRegisterJurisdictionKey,
  PublicRegisterNameKey,
  RegistrationNumberKey
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";

export const mapRequestToEntityData = (req: Request): ApplicationDataType => {

  const data: ApplicationDataType = prepareData(req.body, EntityKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(req.body, PrincipalAddressKeys, AddressKeys);

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ?  mapFieldsToDataObject(req.body, ServiceAddressKeys, AddressKeys)
    :  {};
  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

  // Wipe 'register in country formed in' data if IsOnRegisterInCountryFormedInKey is no or not selected
  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = '';
    data[PublicRegisterJurisdictionKey] = '';
    data[RegistrationNumberKey] = '';
  }
  return data;
};

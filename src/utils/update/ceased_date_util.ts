import {
  CeasedDateKey,
  CeasedDateKeys,
} from "../../model/date.model";
import {
  mapDataObjectToFields,
} from "../../utils/application.data";

import { ApplicationData } from "../../model";
import { EntityNumberKey, InputDateKeys } from '../../model/data.types.model';

export const addCeasedDateToTemplateOptions = (templateOptions: Object, appData: ApplicationData, boData: Object): any => {
  templateOptions["is_still_bo"] = (Object.keys(boData["ceased_date"]).length === 0) ? 1 : 0;
  templateOptions[EntityNumberKey] = appData[EntityNumberKey];
  templateOptions["ceased_date"] = (boData) ? mapDataObjectToFields(boData[CeasedDateKey], CeasedDateKeys, InputDateKeys) : {};

  return templateOptions;
};


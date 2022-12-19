import { body } from "express-validator";
import { EntityNameKey } from "../model/data.types.model";
import { checkEntityName } from "./custom.validation";

export const overseasName = [
  body(EntityNameKey).custom((value) => checkEntityName(value))
];

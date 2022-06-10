import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

const VALID_CHARACTERS = /^[-,.:; 0-9A-Z&@$£¥€'"«»''""?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺǿẀẅỲỳ]*$/;

export const presenter = [
  body("full_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME).isLength({ max: 160 }).withMessage(ErrorMessages.MAX_FULL_NAME_LENGTH).matches(VALID_CHARACTERS).withMessage(ErrorMessages.INVALID_CHARACTERS),
  body("email").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL).isLength({ max: 250 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH)
];

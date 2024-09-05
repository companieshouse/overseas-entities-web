import { ApplicationData } from "./application.model";
import { Request } from "express";

export interface Navigation {
  [x: string]: {
    currentPage: string;
    previousPage: (data?: ApplicationData, req?: Request) => string | Promise<string>;
    nextPage: string[];
  };
}

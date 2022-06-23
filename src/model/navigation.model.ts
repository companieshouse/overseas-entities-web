export interface Navigation {
  [x: string]: {
    currentPage: string;
    previousPage?: string | string[];
    nextPage: string[];
  };
}

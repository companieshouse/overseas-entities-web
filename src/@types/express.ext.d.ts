declare namespace Express {
  export interface Response {
    safeRedirect: (url: string) => void;
  }
}

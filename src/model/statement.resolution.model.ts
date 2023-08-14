export const StatementResolutionKey = 'statement_resolution';

export enum StatementResolutionType {
    CHANGE_INFORMATION = 'statement-resolution-change-information',
    CHANGE_STATEMENT = "statement-resolution-change-statement",
}

export const StatementResolutionTypes = [
  StatementResolutionType.CHANGE_INFORMATION,
  StatementResolutionType.CHANGE_STATEMENT,
];

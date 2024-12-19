import { getUrlWithTransactionIdAndSubmissionId } from "./url";

export const createSummaryListLink = (
  text: string,
  href: string,
  hiddenText: string,
  dataEventId: string,
): Record<string, unknown> => {
  return {
    href,
    text: text,
    attributes: {
      'data-event-id': dataEventId
    },
    visuallyHiddenText: hiddenText,
  };
};

export const createChangeLinkConfig = (href: string, text: string, dataEventId: string) => {
  return createSummaryListLink('Change', href, text, dataEventId);
};

/**
 * Return a change link with the transactionId and submissionId included
 */
export const createChangeLinkWithIds = (link: string, transactionId: string, submissionId: string) => {
  return getUrlWithTransactionIdAndSubmissionId(link, transactionId, submissionId);
};

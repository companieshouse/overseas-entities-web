export const createPageChangeLinkConfig = (basePath: string, id: string, text: string, dataEventId: string) => {
  const href = basePath + id;
  return {
    href,
    text: 'Change',
    attributes: {
      'data-event-id': dataEventId
    },
    visuallyHiddenText: text
  };
};

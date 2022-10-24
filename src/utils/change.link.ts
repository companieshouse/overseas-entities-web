export const createChangeLinkConfig = (href: string, text: string, dataEventId: string) => {
  return {
    href,
    text: 'Change',
    attributes: {
      'data-event-id': dataEventId
    },
    visuallyHiddenText: text
  };
};

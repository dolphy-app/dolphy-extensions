import theme from './theme.json';

export const client = (client: { addTheme(theme: object): unknown }): void => {
  client.addTheme(theme);
};

var theme_default = {
	id: "dolphy.theme-catppuccin-macchiato",
	label: "Catppuccin Macchiato",
	dark: true,
	colors: {
		"background": "#1E2030",
		"surface": "#24273A",
		"surface-bright": "#494D64",
		"surface-light": "#363A4F",
		"surface-variant": "#363A4F",
		"on-background": "#CAD3F5",
		"on-surface": "#CAD3F5",
		"on-surface-variant": "#B8C0E0",
		"primary": "#F5BDE6",
		"on-primary": "#181926",
		"secondary": "#7DC4E4",
		"on-secondary": "#181926",
		"error": "#ED8796",
		"on-error": "#181926",
		"warning": "#EED49F",
		"on-warning": "#181926",
		"success": "#A6DA95",
		"on-success": "#181926",
		"info": "#91D7E3",
		"on-info": "#181926",
		"hero-start": "#F5BDE6",
		"hero-end": "#C6A0F6",
		"hero-contrast": "#181926"
	},
	variables: {
		"border-color": "#8087A2",
		"border-opacity": .24,
		"medium-emphasis-opacity": .78
	}
};
//#endregion
//#region extensions/dolphy.theme-catppuccin-macchiato/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

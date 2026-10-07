var theme_default = {
	id: "dolphy.theme-sunrise",
	label: "Рассвет",
	dark: false,
	colors: {
		"background": "#FBF6F0",
		"surface": "#FFFFFF",
		"surface-variant": "#F3E9DF",
		"on-surface-variant": "#6B5A4B",
		"primary": "#B45309",
		"on-primary": "#FFFFFF",
		"secondary": "#0F766E",
		"on-secondary": "#FFFFFF",
		"error": "#B91C1C",
		"warning": "#B45309",
		"success": "#15803D",
		"info": "#0369A1",
		"hero-start": "#B45309",
		"hero-end": "#9A3412",
		"hero-contrast": "#FFFFFF"
	},
	variables: {
		"border-color": "#3B2A1A",
		"border-opacity": .12,
		"medium-emphasis-opacity": .72
	}
};
//#endregion
//#region extensions/dolphy.theme-sunrise/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

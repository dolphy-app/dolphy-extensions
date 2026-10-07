var theme_default = {
	id: "dolphy.theme-forest",
	label: "Лес",
	dark: false,
	colors: {
		"background": "#EEF3EA",
		"surface": "#FBFDF9",
		"surface-bright": "#FFFFFF",
		"surface-light": "#E8F0E3",
		"surface-variant": "#DFE9D8",
		"on-background": "#1F2A1F",
		"on-surface": "#1F2A1F",
		"on-surface-variant": "#46594A",
		"primary": "#166534",
		"on-primary": "#FFFFFF",
		"secondary": "#92400E",
		"on-secondary": "#FFFFFF",
		"error": "#B91C1C",
		"on-error": "#FFFFFF",
		"warning": "#A16207",
		"on-warning": "#FFFFFF",
		"success": "#15803D",
		"on-success": "#FFFFFF",
		"info": "#0369A1",
		"on-info": "#FFFFFF",
		"hero-start": "#166534",
		"hero-end": "#14532D",
		"hero-contrast": "#FFFFFF"
	},
	variables: {
		"border-color": "#1B3322",
		"border-opacity": .14,
		"medium-emphasis-opacity": .72
	}
};
//#endregion
//#region extensions/dolphy.theme-forest/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

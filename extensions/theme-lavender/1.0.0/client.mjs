var theme_default = {
	id: "theme-lavender",
	label: "Лаванда",
	dark: false,
	colors: {
		"background": "#F5F2FC",
		"surface": "#FFFFFF",
		"surface-bright": "#FFFFFF",
		"surface-light": "#F0EBFA",
		"surface-variant": "#EAE4F8",
		"on-background": "#2A2240",
		"on-surface": "#2A2240",
		"on-surface-variant": "#5B5078",
		"primary": "#6D28D9",
		"on-primary": "#FFFFFF",
		"secondary": "#BE185D",
		"on-secondary": "#FFFFFF",
		"error": "#B91C1C",
		"on-error": "#FFFFFF",
		"warning": "#A16207",
		"on-warning": "#FFFFFF",
		"success": "#15803D",
		"on-success": "#FFFFFF",
		"info": "#0369A1",
		"on-info": "#FFFFFF",
		"hero-start": "#6D28D9",
		"hero-end": "#4C1D95",
		"hero-contrast": "#FFFFFF"
	},
	variables: {
		"border-color": "#2A1A52",
		"border-opacity": .12,
		"medium-emphasis-opacity": .72
	}
};
//#endregion
//#region extensions/theme-lavender/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

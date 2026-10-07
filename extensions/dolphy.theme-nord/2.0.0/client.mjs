var theme_default = {
	id: "dolphy.theme-nord",
	label: "Nord",
	dark: true,
	colors: {
		"background": "#2E3440",
		"surface": "#3B4252",
		"surface-bright": "#4C566A",
		"surface-light": "#434C5E",
		"surface-variant": "#434C5E",
		"on-background": "#ECEFF4",
		"on-surface": "#ECEFF4",
		"on-surface-variant": "#D8DEE9",
		"primary": "#88C0D0",
		"on-primary": "#2E3440",
		"secondary": "#A3BE8C",
		"on-secondary": "#2E3440",
		"error": "#BF616A",
		"on-error": "#ECEFF4",
		"warning": "#EBCB8B",
		"on-warning": "#2E3440",
		"success": "#A3BE8C",
		"on-success": "#2E3440",
		"info": "#8FBCBB",
		"on-info": "#2E3440",
		"hero-start": "#88C0D0",
		"hero-end": "#81A1C1",
		"hero-contrast": "#2E3440"
	},
	variables: {
		"border-color": "#D8DEE9",
		"border-opacity": .2,
		"medium-emphasis-opacity": .78
	}
};
//#endregion
//#region extensions/dolphy.theme-nord/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

var theme_default = {
	id: "theme-graphite",
	label: "Графит",
	dark: true,
	colors: {
		"background": "#15171B",
		"surface": "#1F2227",
		"surface-bright": "#363B43",
		"surface-light": "#2A2E35",
		"surface-variant": "#2A2E35",
		"on-background": "#E8EAED",
		"on-surface": "#E8EAED",
		"on-surface-variant": "#A9B0BA",
		"primary": "#5FB8A8",
		"on-primary": "#07201C",
		"secondary": "#9DB0CC",
		"on-secondary": "#101828",
		"error": "#F28B82",
		"on-error": "#2B0A07",
		"warning": "#E3B341",
		"on-warning": "#2A1E00",
		"success": "#6FCF8E",
		"on-success": "#06240F",
		"info": "#7AB4E8",
		"on-info": "#0A1D33",
		"hero-start": "#2F6F66",
		"hero-end": "#1F3F4A",
		"hero-contrast": "#FFFFFF"
	},
	variables: {
		"border-color": "#C9D1DB",
		"border-opacity": .14,
		"medium-emphasis-opacity": .74
	}
};
//#endregion
//#region extensions/theme-graphite/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

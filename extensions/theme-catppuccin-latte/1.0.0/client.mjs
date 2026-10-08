var theme_default = {
	id: "theme-catppuccin-latte",
	label: "Catppuccin Latte",
	dark: false,
	colors: {
		"background": "#E6E9EF",
		"surface": "#EFF1F5",
		"surface-bright": "#EFF1F5",
		"surface-light": "#CCD0DA",
		"surface-variant": "#DCE0E8",
		"on-background": "#4C4F69",
		"on-surface": "#4C4F69",
		"on-surface-variant": "#5C5F77",
		"primary": "#8839EF",
		"on-primary": "#EFF1F5",
		"secondary": "#1E66F5",
		"on-secondary": "#EFF1F5",
		"error": "#D20F39",
		"on-error": "#EFF1F5",
		"warning": "#DF8E1D",
		"on-warning": "#4C4F69",
		"success": "#40A02B",
		"on-success": "#EFF1F5",
		"info": "#1E66F5",
		"on-info": "#EFF1F5",
		"hero-start": "#8839EF",
		"hero-end": "#1E66F5",
		"hero-contrast": "#EFF1F5"
	},
	variables: {
		"border-color": "#8C8FA1",
		"border-opacity": .3,
		"medium-emphasis-opacity": .8
	}
};
//#endregion
//#region extensions/theme-catppuccin-latte/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

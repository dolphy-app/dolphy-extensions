var theme_default = {
	id: "theme-catppuccin-frappe",
	label: "Catppuccin Frappé",
	dark: true,
	colors: {
		"background": "#292C3C",
		"surface": "#303446",
		"surface-bright": "#51576D",
		"surface-light": "#414559",
		"surface-variant": "#414559",
		"on-background": "#C6D0F5",
		"on-surface": "#C6D0F5",
		"on-surface-variant": "#B5BFE2",
		"primary": "#8CAAEE",
		"on-primary": "#232634",
		"secondary": "#81C8BE",
		"on-secondary": "#232634",
		"error": "#E78284",
		"on-error": "#232634",
		"warning": "#E5C890",
		"on-warning": "#232634",
		"success": "#A6D189",
		"on-success": "#232634",
		"info": "#99D1DB",
		"on-info": "#232634",
		"hero-start": "#8CAAEE",
		"hero-end": "#CA9EE6",
		"hero-contrast": "#232634"
	},
	variables: {
		"border-color": "#838BA7",
		"border-opacity": .24,
		"medium-emphasis-opacity": .78
	}
};
//#endregion
//#region extensions/theme-catppuccin-frappe/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

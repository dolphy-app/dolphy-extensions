var theme_default = {
	id: "theme-gruvbox-light",
	label: "Gruvbox Light",
	dark: false,
	colors: {
		"background": "#F9F5D7",
		"surface": "#FBF1C7",
		"surface-bright": "#FBF1C7",
		"surface-light": "#F2E5BC",
		"surface-variant": "#EBDBB2",
		"on-background": "#3C3836",
		"on-surface": "#3C3836",
		"on-surface-variant": "#665C54",
		"primary": "#076678",
		"on-primary": "#FBF1C7",
		"secondary": "#AF3A03",
		"on-secondary": "#FBF1C7",
		"error": "#9D0006",
		"on-error": "#FBF1C7",
		"warning": "#B57614",
		"on-warning": "#282828",
		"success": "#79740E",
		"on-success": "#FBF1C7",
		"info": "#076678",
		"on-info": "#FBF1C7",
		"hero-start": "#076678",
		"hero-end": "#8F3F71",
		"hero-contrast": "#FBF1C7"
	},
	variables: {
		"border-color": "#504945",
		"border-opacity": .2,
		"medium-emphasis-opacity": .78
	}
};
//#endregion
//#region extensions/theme-gruvbox-light/src/index.ts
var client = (client) => {
	client.addTheme(theme_default);
};
//#endregion
export { client };

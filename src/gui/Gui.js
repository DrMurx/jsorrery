
import $ from 'jquery';
import TweenMax from 'gsap';
import InputDate from './InputDate';
import InputGeoCoord from './InputGeoCoord';
import InputSelect from './InputSelect';
import InputSlider from './InputSlider';
import InputButton from './InputButton';

export const PLANET_SCALE_ID = 'planetScale';
export const SCENARIO_ID = 'scenario';
export const START_ID = 'start';
export const SHARE_ID = 'share';
export const DATE_ID = 'date';
export const DATE_DISPLAY_ID = 'dateDisplay';
export const LOOKAT_ID = 'lookAt';
export const LOOKFROM_ID = 'lookFrom';
export const DELTA_T_ID = 'deltaT';
export const GEOLOC_ID = 'geoloc';

let defaultSettings;
let defaultCallbacks;
let gui;

function getContainer(id) {
	return $(`#${id}Cont`);
}

function getLabel(id) {
	return $(`#${id}Label`);
}

function hideGuiElement(id) {
	return getLabel(id).removeClass('shown');
}

function emptyContainer(id) {
	getContainer(id).empty();
}

function addWidget(id, widget, classes) {
	const c = getContainer(id);
	getLabel(id).addClass('shown');
	if (classes) c.addClass('dropdown');
	c.append(widget);
}

function setOnChange(id, defaultOnChange) {
	const label = getLabel(id).find('.valDisplay');
	return (val) => {
		if (label.length) label.text(val);
		if (defaultOnChange) defaultOnChange(val);
	};
}

function hideContent(content) {
	TweenMax.killTweensOf(content);
	TweenMax.to(content, 0.3, {
		opacity: 0, 
		onComplete() {
			content.hide();
		}
	});
	return false;
}

function showContent(content) {
	TweenMax.killTweensOf(content);
	content.show();
	TweenMax.to(content, 0.3, {
		opacity: 1, 
	});
	return true;
}

function fadeGui(hasHelpShown) {
	const navToggleAction = hasHelpShown ? 'addClass' : 'removeClass';
	gui[navToggleAction]('faded');
}

function setupHelp() {
	const allHelpContents = $('.helpContent');

	$('.help').each((i, el) => {
		let content;
		let shown = false;
		$(el).on('click.jsorrery', () => {
			if (!content) {
				content = allHelpContents.filter(`#${el.dataset.for}`);
				const close = content.find('.close');

				close.on('click.jsorrery', () => {
					shown = hideContent(content);
					fadeGui(shown);
				});
			}
			// console.log(content);
			hideContent(allHelpContents.not(content));
			shown = shown ? hideContent(content) : showContent(content);
			fadeGui(shown);
		});
	});
	//default open help on load page, if any
	const defaultHelpOpen = window.jsOrrery && window.jsOrrery.defaults && window.jsOrrery.defaults.showHelp;
	if (defaultHelpOpen) {
		$(`.help[data-for="${defaultHelpOpen}"]`).trigger('click');
	}
}


export default {
	init() {
		gui = $('nav#gui');
		setupHelp();

		const collapser = $('#navCollapse');
		const collapsedClass = 'collapsed';
		const collapserUpClass = 'fa-angle-double-up';
		const collapserDownClass = 'fa-angle-double-down';

		collapser.on('click.jsorrery', () => {
			gui.toggleClass(collapsedClass);
			if (gui.hasClass(collapsedClass)) {
				collapser.addClass(collapserDownClass).removeClass(collapserUpClass);
			} else {
				collapser.addClass(collapserUpClass).removeClass(collapserDownClass);
			}
		});
	},

	addBtn(labelTx, id, onClick, key) {
		emptyContainer(id);
		const btn = new InputButton(labelTx, id, onClick, key);
		const widget = btn.getWidget();
		addWidget(id, widget);
	},

	addDropdown(id, callback) {
		emptyContainer(id);
		const sel = new InputSelect(id, defaultSettings[id], callback);
		const widget = sel.getWidget();
		addWidget(id, widget, 'dropdown');
		
		return sel;
	},

	addSlider(id, options, onChange) {
		emptyContainer(id);
		const defaultVal = Number(defaultSettings[id]) || (options && options.initial) || 1;
		const slider = new InputSlider(id, defaultVal, setOnChange(id, onChange), options);
		const widget = slider.getWidget();
		addWidget(id, widget);
	},

	addDate(onChange) {
		emptyContainer(DATE_ID);
		InputDate.init(setOnChange(DATE_ID, onChange), defaultSettings[DATE_ID]);
		addWidget(DATE_ID, InputDate.getWidget());
		return InputDate;
	},
	
	addGeoloc(originalValues, onChange) {
		emptyContainer(GEOLOC_ID);
		// console.log(defaultSettings[GEOLOC_ID]);
		// console.log(originalValues);
		InputGeoCoord.init(defaultSettings[GEOLOC_ID] || originalValues, setOnChange(GEOLOC_ID, onChange));
		addWidget(GEOLOC_ID, InputGeoCoord.getWidget());
		
		return InputGeoCoord;
	},

	removeGeoloc() {
		InputGeoCoord.sleep();
		hideGuiElement(GEOLOC_ID);
	},

	pushDefaultsCallbacks(callback) {
		defaultCallbacks = defaultCallbacks || [];
		defaultCallbacks.push(callback);
	},

	putDefaults() {
		if (!defaultCallbacks) return;
		defaultCallbacks.forEach(callback => callback());
		defaultCallbacks.length = 0;
	},

	//default settings for GUI when loading a scenario / a page
	setDefaults(v) {
		// console.log(defaultSettings);
		defaultSettings = v;
	},
};

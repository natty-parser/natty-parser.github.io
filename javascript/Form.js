Form = Class.create({
	initialize: function () {
		this._input = $('text_input');
		this._loadingIndicator = $('loading');
		this._submitButton = $('submit');

		this._date = $('date');
		this._summary = $('summary');
		this._error = $('error');
		this._empty = $('empty');
		this._structureDetails = $('structure_details');
		this._astDetails = $('ast_details');
		this._clear = $('clear');
		this._settings = $('settings');
		this._now = $('now_input');
		this._zone = $('zone_input');
		this._zone.placeholder = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// or when the submit button is pressed
		this._submitButton.observe('click', this._submit.bind(this));

		// focus on the input by default
		this._input.focus();
		this._input.select();
		this._input.addEventListener('input', this._updateClearButtonVisibility.bind(this));

		// This sadly only seem to work in chrome
		this._input.addEventListener('change', this._submit.bind(this));

		this._clear.addEventListener('click', function (e) {
			e.preventDefault();
			this._input.value = "";
			this._input.focus();
			this._updateClearButtonVisibility();
			this._date.hide();
			this._error.hide();
			this._empty.hide();
			this._summary.hide();

			const url = new URL(window.location);
			url.searchParams.delete('q');
			window.history.pushState({}, '', url);
		}.bind(this));

		// re-parse when one of the settings changes
		const resubmit = function (e) {
			if (this._input.value.strip().length > 0) {
				this._submit(e);
			}
		}.bind(this);
		this._now.addEventListener('change', resubmit);
		this._zone.addEventListener('change', resubmit);

		// Read from query string on load
		const searchParams = new URLSearchParams(window.location.search);
		this._now.value = searchParams.get('now') || '';
		this._zone.value = searchParams.get('tz') || '';
		if (this._now.value || this._zone.value) {
			this._settings.open = true;
		}
		const queryValue = searchParams.get('q');
		if (queryValue) {
			this._input.value = queryValue;
			this._submit();
		} else if (! this._input.value) {
			const datalist = $('input-examples');
		  const options = datalist.querySelectorAll('option');
			const randomIndex = Math.floor(Math.random() * options.length);
			this._input.value = options[randomIndex].value;
		}
	},

	_updateClearButtonVisibility: async function () {
		this._clear.style.display = this._input.value.trim() ? 'inline-block' : 'none';
	},

	/**
	 *
	 */
	_submit: async function (e) {
		if (e) e.preventDefault();
		this._submitButton.disabled = true;
		this._loadingIndicator.show();

		await window.setup();
		this._summary.hide();
		this._date.hide();
		this._error.hide();
		this._empty.hide();
		if (this._input.value.strip().length === 0) {
			this._empty.show();
			this._loadingIndicator.hide();
			this._submitButton.disabled = false;
			return;
		}

		try {
			const value = this._input.value.strip();
			const now = this._now.value.strip();
			const zone = this._zone.value.strip();
			const url = new URL(window.location);
			url.searchParams.set('q', value);
			if (now) url.searchParams.set('now', now); else url.searchParams.delete('now');
			if (zone) url.searchParams.set('tz', zone); else url.searchParams.delete('tz');
			window.history.pushState({}, '', url);
			const parser = await window.getParser(now, zone);
			console.log("Parsing value:", value, parser);
			const result = await parser.parse(value);
			if (await result.isEmpty()) {
				console.log("No result found");
				this._empty.show();
			} else {
				const firstGroup = await result.get(0);
				const syntaxTree = await firstGroup.getSyntaxTree();
				const syntaxTreeString = await syntaxTree.toStringTree();
				let dates;
				try {
					dates = await firstGroup.getTemporals();
				} catch (e) {
					dates = await firstGroup.getDates();
				}
				let string = "";
				for (let i = 0; i < await dates.size(); i++) {
					const date = await dates.get(i);
					if (string.length > 0) {
						string += " -  "
					}
					string += await date.toString();
				}
				this._date.update(string);
				const parseTree = new window.ParseTree();
				const json = await parseTree.groupToJson(firstGroup);
				console.log(json);
				this._structureDetails.update(parseTree.build(value, json));
				const astTree = new window.AbstractSyntaxTree()
				this._astDetails.update(astTree.build(syntaxTreeString));
				this._summary.show();
			}
		} catch (e) {
			this._date.update("No date found");
			this._error.update(await e.toString());
			this._error.show();
		}
		this._date.show();
		this._loadingIndicator.hide();
		this._submitButton.disabled = false;
	}
}
);

Event.observe(window, 'load', function() {
  new Form();
});

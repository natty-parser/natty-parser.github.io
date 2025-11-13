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

		// submit on enter in text field
		this._input.observe('keypress', function (e) {
			if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) this._submit();
		}.bind(this));

		// or when the submit button is pressed
		this._submitButton.observe('click', this._submit.bind(this));

		// focus on the input by default
		this._input.focus();
		this._input.select();
		const datalist = $('input-examples');
		const options = datalist.querySelectorAll('option');

		// Read from query string on load
		const urlParams = new URLSearchParams(window.location.search);

		const queryValue = urlParams.get('q');
		if (queryValue) {
			this._input.value = queryValue;
		} else if (options.length > 0) {
			const randomIndex = Math.floor(Math.random() * options.length);
			if (this._input.value === "") {
				this._input.value = options[randomIndex].value;
			}
		}
		this._clear = $('clear');
		const updateClearButtonVisibility = function() {
			this._clear.style.display = this._input.value.trim() ? 'inline-block' : 'none';
		}.bind(this);
		this._input.addEventListener('input', updateClearButtonVisibility);
		this._clear.addEventListener('click', function (e) {
			e.preventDefault();
			this._input.value = "";
			this._input.focus();
			updateClearButtonVisibility();
			const url = new URL(window.location);
			url.searchParams.delete('q');
			window.history.pushState({}, '', url);
		}.bind(this));
			this._input.addEventListener('change', function(e) {
			this._submit(e);
		}.bind(this));


	},

	/**
	 *
	 */
	_submit: async function (e) {
		if (e) e.preventDefault();
		this._loadingIndicator.show();
		this._submitButton.disabled = true;
		const parser = await window.setup();
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
			console.log("Parsing value:", value, parser);
			if (value.length > 0) {
				const url = new URL(window.location);
				url.searchParams.set('q', value);
				window.history.pushState({}, '', url);
			}
			const result = await parser.parse(value);
			if (await result.isEmpty()) {
				console.log("No result found");
				this._empty.show();
			} else {
				const firstGroup = await result.get(0);
				const syntaxTree = await firstGroup.getSyntaxTree();
				const syntaxTreeString = await syntaxTree.toStringTree();
				const dates = await firstGroup.getDates();
				const firstDate = await dates.get(0);
				const string = await firstDate.toString();
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

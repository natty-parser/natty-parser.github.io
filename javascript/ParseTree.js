window.ParseTree = Class.create({
	initialize : function() {},

	locationToJson: async function(parseLocation) {
		const result = {};
		result.start = await parseLocation.getStart();
		result.end = await parseLocation.getEnd();
		return result;
	},
	groupToJson: async function(parseGroup) {
		const result = {};
		const parseLocations = await parseGroup.getParseLocations();
		const entries = await (await parseLocations.entrySet()).iterator();
		while(await entries.hasNext()) {
			const entry = await entries.next();
			const element = []
			result[await entry.getKey()] = element;
			const list = await (await entry.getValue()).iterator();
			while (await list.hasNext()) {
				const parseLocation = await list.next();
				const item = {};
				element.push(item)
				item.start = await parseLocation.getStart();
				item.end = await parseLocation.getEnd();
			}
		}
		return result;
	},


	build : function(inputString, json) {
		const root = new Element('div');
		const indices = [];
		let maxEndIndex = 0;
		for(key in json) {
			const items = json[key];
			items.each(function(item) {
				indices.push({start : item.start - 1, end : item.end, name : key});
				if(item.end > maxEndIndex) maxEndIndex = item.end;
      });
		}

		indices.sort(function(a,b) {
			return a.start === b.start ?
        a.end < b.end ? 1 : -1 :
				a.start < b.start ? -1 : 1;
		});

		const parents = [root];
		let seekIndex = 0;
		let count = 0;
		for(let i=0; i<=maxEndIndex; i++) {
			for(let j=0; j<indices.length; j++) {
				const index = indices[j];
				if(index.start === i) {
					if(seekIndex < i) {
						const subText = inputString.substring(seekIndex, i);
						const imaginaryIndex = document.createElement('div');
						imaginaryIndex.className = 'index imaginary';
            imaginaryIndex.appendChild(document.createTextNode(subText));
						const p = parents[parents.length -1];
						p.appendChild(imaginaryIndex);
					}
					seekIndex = i;
					const div = document.createElement("div");
					div.className = "index";
					div.id = "index_" + count;
					count++;
					parents[parents.length -1].appendChild(div);
					parents.push(div);
				}

				if(index.end === i) {
					p = parents.pop();
					const subText = inputString.substring(seekIndex, index.end);
					p.appendChild(subText.length > 0 ?
						document.createTextNode(subText) :
						document.createElement("br"));
					seekIndex = i;
				}
			}
		}

    // add the structure to the document and traverse again to add name nodes
		indices.each(function(index, i) {
			const div = root.down('#index_' + i);
			const nameDiv = document.createElement("div");
			nameDiv.className = "name";
			nameDiv.appendChild(document.createTextNode(index.name));
			div.appendChild(nameDiv);
		});
		return root;
	}
});

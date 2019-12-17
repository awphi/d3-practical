const fs = require('fs');

String.prototype.splitCSV = function() {
        var matches = this.match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g);
        for (var n = 0; n < matches.length; ++n) {
            matches[n] = matches[n].trim();
            if (matches[n] == ',') matches[n] = '';
        }
        if (this[0] == ',') matches.unshift("");
        return matches;
}

fs.readFile('./land.csv', 'utf-8', (err, data) => {
	if (err) throw err;
	const lines = data.split("\n");
	const countries = {};
	console.log(lines.length)

	for (var i = 1; i < lines.length; i ++) {
		const split = lines[i].splitCSV();

		const year = split[2];
		const country = split[1];

		if(!countries.hasOwnProperty(year)) {
			countries[year] = {};
		}

		const ds = countries[year];

		if(!ds.hasOwnProperty(country)) {
			countries[year][country] = [];
		}

		const datapoint = {
			name: split[3],
			value: Number(split[4])
		}

		countries[year][country].push(datapoint);
	}

	fs.writeFile('land.json', JSON.stringify(countries), (err) => {
		if (err) throw err;
		console.log('First parse complete!');
		buildTreemapData("Forest cover (thousand hectares)", "forest")
		buildTreemapData("Land area (thousand hectares)", "all_area")
	});
});

function buildTreemapData(child, name) {
	fs.readFile('./land.json', 'utf-8', (err, data) => {
		if (err) throw err;
		const json = JSON.parse(data);
		for(const key in json) {
			const base = {
				name: "Land_" + name + "_" + key,
				children: []
			}

			const yeardata = json[key];
			for(var country in yeardata) {
				var obj = {
					name: country,
					children: []
				}

				var flag = false;

				for (var i = yeardata[country].length - 1; i >= 0; i--) {
					if(yeardata[country][i].name == "Land area (thousand hectares)") {
						flag = true;
					}

					if(yeardata[country][i].name != child) {
						continue;
					}

					yeardata[country][i].name = country + " - " + yeardata[country][i].name

					obj.children.push(yeardata[country][i]);
				}

				if(flag) {
					base.children.push(obj);
				}
			}

			fs.writeFile('land_' + name + "_" + key + '.json', JSON.stringify(base), (err) => {
				if (err) throw err;
				console.log(key + ' data saved!');
			});
		}		
	});
}
// Load an empty treemap into the wrapper
const treemapDynamic = new Treemap(954, 1060, null);
// Used to cache the data to prevent lots of ajax calls
const treemapDynamicData = {};

const treemapResizable = new Treemap(1000, 1000, null);

treemapResizable.appendInto("#treemap-resizable");
treemapDynamic.appendInto('#treemap-dynamic');

$.ajax({ url: './data/land_all_area_2016.json' }).then((result) => {
  treemapResizable.data = result;
});

// Create the static treemap
$.ajax({ url: './data/land_all_area_2005.json' }).then((result) => {
  const treemapStatic = new Treemap(954, 1060, result);
  treemapStatic.appendInto('#treemap-static');
});

// Cache the data
$.ajax({ url: './data/land_forest_2005.json' }).then((result) => {
  treemapDynamic.data = result;
  treemapDynamicData["2005"] = result;
});

$.ajax({ url: './data/land_forest_2016.json' }).then((result) => {
  treemapDynamicData["2016"] = result;
});

// Handler for switching between the cached data
$("#dynamic-choose :input").change(function() {
    treemapDynamic.data = treemapDynamicData[this.id.split("_")[0]]
});

// Handler for switching between color schemes
$("#color-choose :input").change(function() {
    treemapResizable.color = d3.scaleOrdinal(d3[this.id]);
});

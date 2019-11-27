const width = 954;
const height = 720;
const padding = 10;
const color = '#dddddd';
const align = 'Centered';
const inputOrder = false;

d3.csv('./data.csv')
  .then(function(data) {
      console.log(data);
  })
  .catch(function(error){
     console.log(error);
  })

function data(source) {
  const links = d3.csvParseRows(source, ([source, target, value, linkColor = color]) => 
    (source && target ? {source, target, value: !value || isNaN(value = +value) ? 1 : value, color: linkColor} : null));

  console.log(links);

  const nodeByName = new Map();
  for (const link of links) {
    if (!nodeByName.has(link.source)) nodeByName.set(link.source, {name: link.source});
    if (!nodeByName.has(link.target)) nodeByName.set(link.target, {name: link.target});
  }

  return {nodes: Array.from(nodeByName.values()), links};
}

var sankey = d3.sankey()
    .nodeId(d => d.name)
    .nodeAlign(d3[`sankey` + align])
    .nodeSort(inputOrder ? null : undefined)
    .nodeWidth(15)
    .nodePadding(padding)
    .extent([[0, 5], [width, height - 5]]);
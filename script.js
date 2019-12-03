const width = 954;
const height = 1060;
const format = d3.format(",d");
const color = d3.scaleOrdinal(d3.schemeCategory10);

function treemap(data) {
 return d3.treemap()
    .size([width, height])
    .padding(1)
    .round(true)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value));
}

function uid() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function chart(dat) {
  const root = treemap(dat);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif");

  const leaf = svg.selectAll("g")
    .data(root.leaves())
    .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

  leaf.append("title")
    .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${format(d.value)}`);

  leaf.append("rect")
    .attr("id", function(d) {
      d.leafUid = ("leaf" + uid());
      d.leafHref = window.location.href + "#" + d.leafUid;
      return d.leafUid;
    })
    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr("fill-opacity", 0.6)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);

  leaf.append("clipPath")
      .attr("id", function(d) {
        d.clipUid = "clip" + uid();
        d.clipHref = window.location.href + "#" + d.clipUid;
        return d.clipUid;
      })
    .append("use")
      .attr("xlink:href", d => d.leafHref);

  leaf.append("text")
    .attr("clip-path", d => "url(" + d.clipHref + ")")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
    .join("tspan")
      .attr("x", 3)
      .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
      .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
      .text(d => d);

  return svg.node();
}


d3.json('https://raw.githubusercontent.com/awphi/d3-prog-summative/master/flare-2.json').then(function(data) {
  var svg = chart(data);
  $("body")[0].append(svg);
});
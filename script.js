class Treemap {
  constructor (width, height, data) {
    this.width = width;
    this.height = height;
    this.format = d3.format(',d');
    this.color = d3.scaleOrdinal(d3.schemeCategory10);
    this.data = data;

    this.root = Treemap.treemap(this.width, this.height, this.data);

    this.svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, height])
      .style('font', '10px sans-serif');

    const leaf = this.svg.selectAll('g')
      .data(this.root.leaves())
      .join('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    leaf.append('title')
      .text(d => `${d.ancestors().reverse().map(d => d.data.name).join('/')}\n${this.format(d.value)}`);

    leaf.append('rect')
      .attr('id', d => Treemap.linkedUid(d, 'leaf'))
      .attr('fill', d => { while (d.depth > 1) d = d.parent; return this.color(d.data.name); })
      .attr('fill-opacity', 0.6)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0);

    leaf.append('clipPath')
        .attr('id', d => Treemap.linkedUid(d, 'clip'))
      .append('use')
        .attr('xlink:href', d => d.leafHref);

    leaf.append('text')
      .attr('clip-path', d => 'url(' + d.clipHref + ')')
      .selectAll('tspan')
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(this.format(d.value)))
      .join('tspan')
        .attr('x', 3)
        .attr('y', (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .attr('fill-opacity', (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);
  }

  static linkedUid (d, prefix) {
    d[prefix + 'Uid'] = 'clip' + Treemap.uid();
    d[prefix + 'Href'] = window.location.href + '#' + d[prefix + 'Uid'];
    return d[prefix + 'Uid'];
  }

  static treemap (width, height, data) {
    return d3.treemap()
      .size([width, height])
      .padding(1)
      .round(true)(d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value));
  }

  static uid () {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

$.ajax({ url: './flare-2.json' }).then((result) => {
  const treemap1 = new Treemap(954, 1060, result);
  $('#treemap1').append(treemap1.svg.node());
});

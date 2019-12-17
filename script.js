class Treemap {
  constructor (width, height, data, format = d3.format(',d'), color = d3.scaleOrdinal(d3.schemeCategory10)) {
    this._format = format;
    this._color = color;

    this._width = width;
    this._height = height;
    this._data = data;
    this._parents = [];
    this.update()
  }

  update() {
    for (var i = this._parents.length - 1; i >= 0; i--) {
      this.node.parentNode.removeChild(this.node);
    }

    this._svg = d3.create('svg')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('font', '10px sans-serif');

    if(this._data == null) {
      return;
    }

    this.root = Treemap.treemap(this.width, this.height, this.data);

    const leaf = this._svg.selectAll('g')
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

    for (var i = this._parents.length - 1; i >= 0; i--) {
      $(this._parents[i]).append(this.node);
    }
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color = color;
    this.update();
  }

  get format() {
    return this._format;
  }

  set format(format) {
    this._format = format;
    this.update();
  }

  get data() {
    return this._data;
  }
  
  set data(data) {
    this._data = data;
    this.update();
  }

  get width() {
    return this._width;
  }

  set width(width) {
    this._width = width;
    this.update();
  }

  get height() {
    return this._height;
  }

  set height(aheight) {
    this.height = aheight;
    this.update();
  }

  get node() {
    return this._svg.node();
  }

  appendInto(into) {
    const $into = $(into);
    $into.append(this.node);
    this._parents.push($into);
  }

  static baseUrl () {
    return window.location.origin + window.location.pathname;
  }

  static linkedUid (d, prefix) {
    d[prefix + 'Uid'] = 'clip' + Treemap.uid();
    d[prefix + 'Href'] = Treemap.baseUrl() + '#' + d[prefix + 'Uid'];
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

$.ajax({ url: './data/land_all_area_2005.json' }).then((result) => {
  const treemapStatic = new Treemap(954, 1060, result);
  treemapStatic.appendInto('#treemap-static');
});

// Load an empty treemap into the wrapper
const treemapDynamic = new Treemap(954, 1060, null);
treemapDynamic.appendInto('#treemap-dynamic');

// Used to cache the data to prevent lots of ajax calls
const treemapDynamicData = {};

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

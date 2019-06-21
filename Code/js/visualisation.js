let dataset =[];
// ------------- LECTURE DU CSV ---------------------------
d3.csv("data/df_fr.csv")
    // .row( (d, i) => {
    //     return {
    //         sex: d.sex,
    //         age: d.age,
    //         geo: d.geo,
    //         icd10: d.icd10,
    //         y2015: +d["2015"]
    //         // population: +d.population,
    //         // density: +d.density
    //     };
    // })
    // .get( (error, rows) => {
    //     console.log("Loaded " + rows.length + " rows");
    //     console.log("First row : ", rows[0])
    //     console.log("Last row : ", rows[rows.length-1])
    //     dataset = rows;
    //     //draw();
    //     }
    // );

/// ---------------------------------------------------------------------------------------

var vWidth = 600;
var vHeight = 400;

// Prepare our physical space
//var g = d3.select('svg').attr('width', vWidth).attr('height', vHeight).select('g');
// set the dimensions and margins of the graph
var width = 500
var height = 500

// append the svg object to the body of the page
var g = d3.select("#bubble")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")

// create dummy data -> just one element per circle
d3.csv("hierchie.csv", function(data){
    drawViz(data);
    drawViz2(data)
  });

  function drawViz(data) {
      var vData = d3.stratify()
          .id(function(d) { return d.id; })
          .parentId(function(d) { return d.parentId; })(data);
      // Declare d3 layout
      var vLayout = d3.pack().size([vWidth, vHeight]);
      // Layout + Data
      var vRoot = d3.hierarchy(vData).sum(function (d) { return d.data["2015"]; });
      var vNodes = vRoot.descendants();
      vLayout(vRoot);
      console.log(vNodes)
      var vSlices = g.selectAll('circle').data(vNodes).enter().append('circle');

      // Draw on screen
      vSlices.attr('cx', function (d) { return d.x; })
          .attr('cy', function (d) { return d.y; })
          .attr('r', function (d) { return d.r; })
          .style("fill-opacity", "0.1")
          .attr("pointer-events", d => !d.children ? "none" : null)
          .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
          .on("mouseout", function() { d3.select(this).attr("stroke", null); })
          .on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()));

      var label =
        g.selectAll('text')
        .data(vNodes)
        .enter()
        .append('svg:text')
        .attr('x', function (d) {
            return d.x;
        })
        .attr('y', function (d) {
            return d.y;
        })
        // sets the horizontal alignment to the middle
        .attr('text-anchor', "middle")
        // sets the vertical alignment to the middle of the line
        .attr('dy', '0.35em')
        //.join("text")
          .style("fill-opacity", d => d.parent === vRoot ? 1 : 0)
          .style("display", d => d.parent === vRoot ? "inline" : "none")
          .text(d => d.data.id)
  }



var nodeData = {
    "name": "TOPICS", "children": [{
        "name": "Topic A",
        "children": [{"name": "Sub A1", "size": 4}, {"name": "Sub A2", "size": 4}]
    }, {
        "name": "Topic B",
        "children": [{"name": "Sub B1", "size": 3}, {"name": "Sub B2", "size": 3}, {
            "name": "Sub B3", "size": 3}]
    }, {
        "name": "Topic C",
        "children": [{"name": "Sub A1", "size": 4}, {"name": "Sub A2", "size": 4}]
    }]
};

var width = auto;
var height = auto;
var radius = Math.min(width, height) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20b);


var g1 = d3.select("#sunburst")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


function drawViz2(data) {
    var vData = d3.stratify()
        .id(function(d) { return d.id; })
        .parentId(function(d) { return d.parentId; })(data);
    var partition = d3.partition()
        .size([2 * Math.PI, radius]);

    var root = d3.hierarchy(vData)
        .sum(function (d) { return d.data['2015']});

    partition(root);

    var arc = d3.arc()
        .startAngle(function (d) { return d.x0 })
        .endAngle(function (d) { return d.x1 })
        .innerRadius(function (d) { return d.y0 })
        .outerRadius(function (d) { return d.y1 });

    g1.selectAll('g')
        .data(root.descendants())
        .enter().append('g').attr("class", "node").append('path')
        .attr("display", function (d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .style('stroke', '#fff')
        .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });

    g1.selectAll(".node")
        .append("text")
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"; })
        .attr("dx", "-20") // radius margin
        .attr("dy", ".5em") // rotation align
        .text(function(d) { return d.parent ? d.data.id : "" });
}


function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;

    // Avoid upside-down labels
    return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
    //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
}

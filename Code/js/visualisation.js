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
var width = 800
var height = 800  

// append the svg object to the body of the page
var g = d3.select("body")
  .append("svg")
    .attr("width", 800)
    .attr("height", 800)

// create dummy data -> just one element per circle
d3.csv("hierchie.csv", function(data){
    console.log(data);
    //data = data.sort(function(a,b){ return b.size - a.size; });

    var table = data;
let view;
var vData = d3.stratify()
    .id(function(d) { return d.id; })
    .parentId(function(d) { return d.parentId; })
    (data);
    drawViz(vData);
  });

  function drawViz(vData) {
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
  
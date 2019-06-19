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
var vWidth = 300;
var vHeight = 200;

// Prepare our physical space
//var g = d3.select('svg').attr('width', vWidth).attr('height', vHeight).select('g');
// set the dimensions and margins of the graph
var width = 450
var height = 450

// append the svg object to the body of the page
var g = d3.select("body")
  .append("svg")
    .attr("width", 450)
    .attr("height", 450)

// create dummy data -> just one element per circle
d3.csv("hierarchie.csv", function(data){
    console.log(data);
    data = data.sort(function(a,b){ return b.size - a.size; });

    var table = data;

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
      var vRoot = d3.hierarchy(vData).sum(function (d) { return d.data.size; });
      var vNodes = vRoot.descendants();
      vLayout(vRoot);
      console.log(vNodes)
      var vSlices = g.selectAll('circle').data(vNodes).enter().append('circle');

      // Draw on screen
      vSlices.attr('cx', function (d) { return d.x; })
          .attr('cy', function (d) { return d.y; })
          .attr('r', function (d) { return d.r; })
          .style("fill-opacity", "0.1");
  }
// // Initialize the circle: all located at the center of the svg area
  // var node = svg.append("g")
  //   .selectAll("circle")
  //   .data(data)
  //   .enter()
  //   .append("circle")
  //     .attr("r", 25)
  //     .attr("cx", width / 2)
  //     .attr("cy", height / 2)
  //     .style("fill", "#69b3a2")
  //     .style("fill-opacity", 0.3)
  //     .attr("stroke", "#69a2b2")
  //     .style("stroke-width", 4)

  // // Features of the forces applied to the nodes:
  // var simulation = d3.forceSimulation()
  //     .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
  //     .force("charge", d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
  //     .force("collide", d3.forceCollide().strength(.01).radius(30).iterations(1)) // Force that avoids circle overlapping

  // // Apply these forces to the nodes and update their positions.
  // // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  // simulation
  //     .nodes(data)
  //     .on("tick", function(d){
  //       node
  //           .attr("cx", function(d){ return d.x; })
  //           .attr("cy", function(d){ return d.y; })
  //     });


var parentDiv = document.getElementById("barchart")
var containerWidth = parentDiv.clientWidth;
var containerHeight = parentDiv.clientHeight;
var vWidth = containerWidth;
var vHeight = containerHeight;
console.log(containerHeight)
var data;
// append the svg object to the body of the page

// Parse the Data


d3.csv("data/data_fr.csv")
.row( (d, i) => {
    return {
        geo1: d.geo_niv_1,
        //geo2: d.geo_niv_2,
        icd10_1: d.icd10_niv_1,
        icd10_2: d.icd10_niv_2,
        y2015: +d["2015"]
    };
})
.get( (error, rows) => {
    console.log("Loaded " + rows.length + " rows");
    if (rows.length > 0) {
        console.log("First row : ", rows[0])
        console.log("Last row : ", rows[rows.length-1])
        data = rows;
        // console.log(data)
        //draw();
    }
});

var output;

setTimeout(function(){
  output =
  d3.rollups(
    data,
    xs => d3.sum(xs, x => x.y2015),
    d =>  d.icd10_2
  )
  .map(([k, v]) => ({ Maladie: k, Value: v }))

  drawBarChart(output)
  },2000);


function drawBarChart(data){
  
  var max = d3.max(data, function(d){ return d.Value  ; });  

  var BandScale = d3.scaleBand()
          .range([0, 2 * containerHeight - 80 ])
          .padding(0.1)
          .domain(data.map(function(d) { return d.Maladie; }));

  var y = d3.scaleLinear()
          .range([0.80 * containerHeight, 0])
          .domain([0, d3.max(data, function(d) { return d.Value; })]);
   
  // definition de  X axis
  var xAxis = d3.scaleLinear()
    .domain([0, max])
    .range([ 280, 0]);
  
  // definition de Y axis
  var yAxis = d3.scaleBand()
    .domain(data.map(function(d) { return d.Maladie; }))
    .range([ 0, 2 * containerHeight - 60])
    .padding(.5);



  var svg = d3.select("#barchart")
          .append("svg")
            .attr("width", containerWidth )
            .attr("height", 2 * containerHeight)
          .append("g")
            .attr("height", 2 * containerHeight )
            .attr("transform", "translate(-2,40)");
                
  
  // mise en place de l'echelle des abscisses - X
  svg.append("g")
    .call(d3.axisBottom(xAxis))
    .selectAll("text")
    .attr("transform", "translate(0,-35)rotate(-65)")
    .style("text-anchor", "end");


    // Affichage des Bars
    
    svg.selectAll("myRect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x",  function(d) { return y(d.Value); })
      .attr("y",function(d) { return BandScale(d.Maladie); } )
      .attr("width",(function(d) { return ((d.Value * containerHeight / max )); }) )
      .attr("height", BandScale.bandwidth() )
      .style("fill", "#666");

  // Mise en plase de l'echelle des ordonnees - Y
      svg.append("g")
        .call(d3.axisLeft(yAxis))
       // .attr("height", containerHeight/2 )
        .attr("transform", "translate(288,-10)")

    }
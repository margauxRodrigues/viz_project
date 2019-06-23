var parentDiv = document.getElementById("barchart")
var containerWidth = parentDiv.clientWidth;
var containerHeight = parentDiv.clientHeight;
var vWidth = containerWidth;
var vHeight = containerHeight;
console.log(containerHeight)

// append the svg object to the body of the page
var svg = d3.select("#barchart")
  .append("svg")
    .attr("width", containerWidth )
    .attr("height", containerHeight)
  .append("g")
    .attr("height",  "718" )
    .attr("transform", "translate(20,5)");

// Parse the Data
d3.csv("data/data_fr.csv"), function(data) {
  data.forEach(function(d) {
    /* d.sex=  d.sex,
    d.age= d.age,
    d.geo0= d.geo_niv_0,
    d.geo1= d.geo_niv_1,
    d.icd10_0= d.icd10_niv_0,
    d.icd10_1= d.icd10_niv_1,
    d.icd10_2= d.icd10_niv_2,
    d.maladies=d.maladies,
    d.region=d.region, */
    d.y2015= +d["2015"]
});


 
  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, containerWidth - 20 ])
    .range([ 0, 100]);
  svg.append("g")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  console.log(d3.max(data, function(d){ return d.y2015; }))
  var y = d3.scaleBand()
    .domain(data.map(function(d) { return d.icd10_niv_2; }))
    .range([ 0, 2*containerHeight - 30 ])
    .padding(.5);
  svg.append("g")
    .call(d3.axisLeft(y))
  console.log(y.bandwidth())
  //Bars
  svg.selectAll("myRect")
    .data(data)
    .enter()
    .selectAll("text")
      .attr("transform", "translate(20,0)")
      .style("text-anchor", "end")
    .append("rect")
    .attr("transform", "translate(0," + 35 + ")")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.icd10_niv_2); })
    .attr("width", function(d) { return x(d.y2015); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#666")


    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#69b3a2")

})

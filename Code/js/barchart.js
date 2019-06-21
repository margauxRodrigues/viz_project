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
    .attr("height",  containerHeight )
    .attr("transform", "translate(20,5)");

// Parse the Data
d3.csv("data/data_fr_new.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, d3.max(data, function(d){ return d['2014'] + 20 ; })])
    .range([ 0, 280]);
  svg.append("g")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  console.log(d3.max(data, function(d){ return d['2014']; }))
  var y = d3.scaleBand()
    .domain(data.map(function(d) { return d.age; }))
    .range([ 0, containerHeight ])
    .padding(.5);
  svg.append("g")
    .call(d3.axisLeft(y))
  console.log(y.bandwidth())
  //Bars
  svg.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("transform", "translate(0," + 35 + ")")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.age); })
    .attr("width", function(d) { return x(d['2014']); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#666")


    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#69b3a2")

})

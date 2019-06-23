var parentDiv = document.getElementById("barchart")
var containerWidth = parentDiv.clientWidth;
var containerHeight = parentDiv.clientHeight;
var vWidth = containerWidth;
var vHeight = containerHeight;
console.log(containerHeight)
var data;
// append the svg object to the body of the page
var svg = d3.select("#barchart")
  .append("svg")
    .attr("width", containerWidth )
    .attr("height", containerHeight)
  .append("g")
    .attr("height",  containerHeight )
    .attr("transform", "translate(20,5)");

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

 
setTimeout(function(){
  drawBarChart(data)
  },1000);


function drawBarChart(data){
    // Add X axis
    var max = d3.max(data, function(d){ return d.y2015  ; });
    var x = d3.scaleLinear()
      .domain([0, max + 20])
      .range([ 0, 280]);
    svg.append("g")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    console.log(d3.min(data, function(d){ return d.y2015; }))
    var y = d3.scaleBand()
      .domain(data.map(function(d) { return d.icd10_2; }))
      .range([ 0, 2 * containerHeight - 20])
      .padding(.5);
    svg.append("g")
      .call(d3.axisLeft(y))
    //Bars
    console.log('Barchart Call')
    console.log(data)

  /* var sum_par_maladie =
  d3.rollups(
      data,
      xs => d3.sum(xs, x => x.y2015),
      d => d.icd10_niv_2
    )
    .map(([k, v]) => ({ icd10_niv_2: k, y2015: v }))

  console.log(sum_par_maladie)
  */
 var output =
    d3.rollups(
        data,
        xs => d3.sum(xs, x => x.y2015),
        d => d.icd10_2
      )
      .map(([k, v]) => ({ Maladie: k, Value: v }))

    svg.selectAll("myRect")
      .data(data)
      .enter()
      .selectAll("text")
        .attr("transform", "translate(10,0)")
        .style("text-anchor", "end")
      .append("rect")
      .attr("transform", "translate(0," + 35 + ")")
      .attr("x", function(d) { return x(0); } )
      .attr("y", function(d) { return y(d.icd10_2); })
      .attr("width", function(d) { return output.Value; })
      .attr("height", y.bandwidth() )
      .style("fill", "#666")
  }

    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#69b3a2")



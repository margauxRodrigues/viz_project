var parentDiv = document.getElementById("france");
var containerWidth = parentDiv.clientWidth;
var containerHeight = parentDiv.clientHeight;

var svg = d3.select("#france")
    .append("svg")
        .attr("width", containerWidth - 10 )
        .attr("height", containerHeight - 10)
    .append("g")
        .attr("height",  containerHeight - 10 );


d3.json('./Code//json/france.json', (error, world) => {
    if (error) throw error;

    const colorScale = d3.scaleOrdinal([...d3.schemeCategory20, ...d3.schemeCategory20b, ...d3.schemeCategory20c]);

    Cartogram()
        .topoJson(world)
        .topoObjectName('countries')
        .iterations(120);
});

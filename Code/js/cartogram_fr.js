var parentDiv = document.getElementById("france");
var containerWidth = parentDiv.clientWidth;
var containerHeight = parentDiv.clientHeight;

var svg = d3.select("#france")
    .append("svg")
        .attr("width", containerWidth - 10 )
        .attr("height", containerHeight - 10)
    .append("g")
        .attr("height",  containerHeight - 10 );



d3.json('./Code/json/france.json', (error, france) => {
    if (error) throw error;

    const colorScale = d3.scaleOrdinal([...d3.schemeCategory20, ...d3.schemeCategory20b, ...d3.schemeCategory20c]);
    console.log(france);

    Cartogram()
        .topoJson(france)
        .topoObjectName('countries')
        .iterations(120)
        .valFormatter(d3.format(".3s"))
        .color('LightPink')
        (document.getElementById('france'));
});
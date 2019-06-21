let dataset =[];

var data;
// ------------- LECTURE DU CSV ---------------------------
d3.csv("data/data_fr_new.csv")
.row( (d, i) => {
    return {
        sex: d.sex,
        age: d.age,
        geo: d.geo,
        icd10: d.icd10,
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

// COnstruction hiérarchie
const levels = ["geo", "sex"]
var hierarchy;

setTimeout(function(){
    hierarchy = flatToHierarchy(data, levels, 'icd10', 'y2015')
    console.log(hierarchy);
    drawViz(hierarchy)
    drawViz2(hierarchy)
    },5000);

// ALL RIGHT DATA IS GLOBAL 

/// ---------------------------------------------------------------------------------------

// Prepare our physical space
//var g = d3.select('svg').attr('width', vWidth).attr('height', vHeight).select('g');
// set the dimensions and margins of the graph
// var width = 500
// var height = 500


// ------------- ADAPTER LA TAILLE A CELLE DE LA DIV ---------------------------------------
var parentDiv = document.getElementById("bubble")
var containerWidth = parentDiv.clientWidth;
var containerHeight = parentDiv.clientHeight;
var vWidth = containerWidth;
var vHeight = containerHeight;
// append the svg object to the body of the page
var g = d3.select("#bubble")
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .append("g")


// create dummy data -> just one element per circle
d3.csv("hierchie.csv", function(data){
    //drawViz(data);
    //drawViz2(data)
  });

  function drawViz(data) {
    //   var vData = d3.stratify()
    //       .id(function(d) { return d.id; })
    //       .parentId(function(d) { return d.parentId; })(data);
    //   // Declare d3 layout
      var vRoot = data;
      var vLayout = d3.pack().size([vWidth, vHeight]);
    //   // Layout + Data
    //   var vRoot = d3.hierarchy(vData).sum(function (d) { return d.data["2015"]; });
      var vNodes = vRoot.descendants();
      vLayout(vRoot);
      //console.log(vNodes)
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
          .text(d => d.data.name)
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

var parentDiv = document.getElementById("sunburst")
var width = parentDiv.clientWidth;
var height = parentDiv.clientHeight;
var radius = Math.min(width, height) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20b);


var g1 = d3.select("#sunburst")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


function drawViz2(data) {
    // var vData = d3.stratify()
    //     .id(function(d) { return d.id; })
    //     .parentId(function(d) { return d.parentId; })(data);
    var partition = d3.partition()
        .size([2 * Math.PI, radius]);   

    // var root = d3.hierarchy(vData)
    //     .sum(function (d) { return d.data['2015']});
    var root = data
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
        .text(function(d) { return d.parent ? d.data.name : "" });
}


function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;

    // Avoid upside-down labels
    return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
    //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
}


function flatToHierarchy(flatData, levels, nameField, countField) {
    // Adapted from https://stackoverflow.com/a/19317823
    var nestedData = { name :"root", children : [] }
    
    // For each data row, loop through the expected levels traversing the output tree
    flatData.forEach(function(d){
        // Keep this as a reference to the current level
        var depthCursor = nestedData.children;
        // Go down one level at a time
        levels.forEach(function( property, depth ){
  
            // See if a branch has already been created
            var index;
            depthCursor.forEach(function(child,i){
                if ( d[property] == child.name ) index = i;
            });
            // Add a branch if it isn't there
            if ( isNaN(index) ) {
                depthCursor.push({ name : d[property], children : []});
                index = depthCursor.length - 1;
            }
            // Reference the new child array as we go deeper into the tree
            depthCursor = depthCursor[index].children;
            // This is a leaf, so add last element to specified branch
            if ( depth === levels.length - 1 ) {
              depthCursor.push({
                'name':d[nameField],
                'count':+d[countField]
              });
            } 
        })
    })
    return d3.hierarchy(nestedData).sum(function(d){ return d.count; })
}
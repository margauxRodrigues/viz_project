let dataset =[];
var focus;
var data;
var view;
var label;
var vSlices;
var subset;

// ------------- LECTURE DU CSV ---------------------------
d3.csv("data/data_fr.csv")
.row( (d, i) => {
    return {
        sex: d.sex,
        age: d.age,
        geo0: d.geo_niv_0,
        geo1: d.geo_niv_1,
        //geo2: d.geo_niv_2,
        icd10_0: d.icd10_niv_0,
        icd10_1: d.icd10_niv_1,
        icd10_2: d.icd10_niv_2,
        maladies:d.maladies,
        region:d.region,
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
const levels_bubble = ["region", "sex"]
const filtres_bubble = ["Basse-Normandie (NUTS 2013)", "Auvergne (NUTS 2013)", "Nord - Pas-de-Calais (NUTS 2013)"]
const levels_sunburst = ["icd10_1", "icd10_2"]
var hierarchy_bubble;
var hierarchy_sunburst;

setTimeout(function(){
    var filt_data_bubble = data.filter(function(row){
        return (row["sex"] !== "T") && (row["region"]!=="FR") && (filtres_bubble.indexOf(row["region"]) !== -1);
      }); 
    
    hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
    hierarchy_sunburst = flatToHierarchy(filt_data_bubble, levels_sunburst, 'maladies', 'y2015', 'maladies')

    focus = hierarchy_bubble;
    //console.log(d3.pack(hierarchy))
    g.on("click", function(){
        zoom(hierarchy_bubble);
    });
            console.log(hierarchy_sunburst)
    drawViz(hierarchy_bubble)
    drawViz2(hierarchy_sunburst)
    },1000);

// ALL RIGHT DATA IS GLOBAL 

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
    .attr("viewBox", `-${vWidth / 2} -${vHeight / 2} ${vWidth} ${vHeight}`)
    .attr('transform', 'translate(' + vWidth / 2 + ',' + vHeight / 2 + ')')

function drawViz(data) {
//   // Declare d3 layout
    var vRoot = data;
    var vLayout = d3.pack();
    //.size([vWidth, vHeight]);
//   // Layout + Data
    var vNodes = vRoot.descendants().slice(1);
    vLayout(vRoot);
    vSlices = g.selectAll('circle')
        .remove()
        .exit()
        .data(vNodes)
        .enter()
        .append('circle');
    vSlices.merge(g).transition().duration(2000)
    vSlices.exit().remove()
    // Draw on screen
    vSlices.attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', function (d) { return d.r; })
        .style("fill-opacity", "0.1")
        //.attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function() { 
            d3.select(this).attr("stroke", "#000"); 
            //label.style("display", d => d.parent === focus ? "inline" : "none");

            //d3.select(this.label).style("display", d => d.parent === vRoot ? "inline" : "none")
        })
        .on("mouseout", function() { 
            d3.select(this).attr("stroke", null); 
            //label.style("display", "none");
        })
        .on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()))
        .append("svg:title")
            .text(showtext)
        .transition();

    label = g.selectAll('text')
        .data(vNodes)
        .attr('id','label   ')
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
        //.style("fill-opacity", d => d.parent === vRoot ? 0 : 1)
        //.style("display", d => d.parent === vRoot ? "inline" : "none")
        .style("display", "none")
        .text(d => d.data.name)
    zoomTo([vRoot.x, vRoot.y, vRoot.r * 2]);
    
}

function showtext(d){
    return ("Sélection : "+ d.data.name
            +"\nTotal : " + d.data.count )
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
        .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })

    var slices = g1.selectAll("node")
        .append("text")
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"; })
        .attr("dx", "-20") // radius margin
        .attr("dy", ".5em") // rotation align
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(function(d) { return d.parent ? d.data.print : "" })
        
        var slice = g1.selectAll('g.node').data(root.descendants(), function(d) { return d.data.name; }); // .enter().append('g').attr("class", "node");
        newSlice = slice.enter().append('g').attr("class", "node").merge(slice);
        newSlice.on("mouseover", function() { 
            d3.select(this).attr("stroke", "#000")});
        slice.exit().remove();

        slice.selectAll('text').remove();

        newSlice.on("click", highlightSelectedSlice);

}

function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;

    // Avoid upside-down labels
    return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
    //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
}

function flatToHierarchy(flatData, levels, nameField, countField, dispField) {
    // Adapted from https://stackoverflow.com/a/19317823
    var nestedData = { name :"root", print: "", children : [] }
    
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
                depthCursor.push({ name : d[property], print: d[dispField], children : []});
                index = depthCursor.length - 1;
            }
            // Reference the new child array as we go deeper into the tree
            depthCursor = depthCursor[index].children;
            // This is a leaf, so add last element to specified branch
            if ( depth === levels.length - 1 ) {
              depthCursor.push({
                'name':d[nameField],
                'print':+d[dispField],
                'count':+d[countField]
              });
            } 
        })
    })
    return d3.hierarchy(nestedData).sum(function(d){ return d.count; })
}

function flatToHierarchyBubble(flatData, levels, nameField, countField) {
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

function zoomTo(v) {
    console.log(v)
    const k = vWidth / v[2];
    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    vSlices.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    vSlices.attr("r", d => d.r * k);
    }

function zoom(d) {
    console.log(d)
    g.attr("viewBox", `-${vWidth / 2} -${vHeight / 2} ${vWidth} ${vHeight}`)

    const focus0 = focus;
    focus = d;
    const transition = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", d => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r*2]);
            return t => zoomTo(i(t));
        });

    label
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .transition(transition)
        .style('display',"none")
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }


function highlightSelectedSlice(c,i) {

        clicked = c;
        console.log(clicked);
        subset = clicked.data.name
        console.log("Function called");
        var filtres_bubble_maladie = subset;

        if (clicked.height == 1 ){
        var filt_data_bubble = data.filter(function(row){
            return (row["sex"] !== "T") && (row["region"]!=="FR") && (filtres_bubble.indexOf(row["region"]) !== -1) && (filtres_bubble_maladie.indexOf(row['icd10_2']) !== -1);
            }); 
            hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
            drawViz(hierarchy_bubble)
            //drawViz(hierarchy_bubble)
        }
    };
let dataset =[];
var focus;
var data;
var view;
var label;
var vSlices;
var subset;
var previouscliked;
var sliceSelected = false;
var output;
var test;

// ------------- LECTURE DU CSV ---------------------------
d3.csv("data/data_fr.csv")
.row( (d, i) => {
    return {
        sex: d.sex,
        age: d.age,
        geo0: d.geo_niv_0,
        geo1: d.geo_niv_1,
        test: d.nom_geo_niv_1,
        //geo2: d.geo_niv_2,
        icd10_0: d.icd10_nom_niv_1,
        icd10_1: d["icd10_nom_niv_1.1"],
        icd10_2: d.icd10_nom_niv_2,
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

// ------------- ADAPTER LA TAILLE A CELLE DE LA DIV ---------------------------------------
var parentDiv_bubble = document.getElementById("bubble")
var containerWidth_bubble = parentDiv_bubble.clientWidth;
var containerHeight_bubble = parentDiv_bubble.clientHeight;
var vWidth_bubble = containerWidth_bubble;
var vHeight_bubble = containerHeight_bubble;

// Adapt sunburst object
var parentDiv_sunburst = document.getElementById("sunburst")
var width_sunburst = parentDiv_sunburst.clientWidth;
var height_sunburst = parentDiv_sunburst.clientHeight;
var radius = Math.min(width_sunburst, height_sunburst) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20b);

// adapt barchart
var parentDiv_barchart = document.getElementById("barchart")
var containerWidth_barchart = parentDiv_barchart.clientWidth;
var containerHeight_barchart = parentDiv_barchart.clientHeight;

// Construction hiérarchie
const levels_bubble = ["region", "sex"]
const filtres_bubble = ["Basse-Normandie ", "Auvergne ", "Nord - Pas-de-Calais "]
const levels_sunburst = ["icd10_1", "icd10_2"]
var hierarchy_bubble;
var hierarchy_sunburst;

setTimeout(function(){
    var filt_data_bubble = data.filter(function(row){
        return (row["region"]!=="FR") && (filtres_bubble.indexOf(row["region"]) !== -1);
      }); 
    
    /* var filt_data_barchart = data.filter(function(row){
        return (row)
    })
    */
    hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
    hierarchy_sunburst = flatToHierarchy(filt_data_bubble, levels_sunburst, 'maladies', 'y2015', 'maladies')
    console.log(hierarchy_bubble)
    focus = hierarchy_bubble;
    //console.log(d3.pack(hierarchy))
    g.on("click", function(){
        zoom(hierarchy_bubble);
    });
        console.log(hierarchy_sunburst)
        output = d3.rollups(
        data,
        xs => d3.sum(xs, x => x.y2015),
        d =>  d.icd10_2
    )
    .map(([k, v]) => ({ Maladie: k, Value: v }))
    console.log(output)
    

    drawViz(hierarchy_bubble)
    drawViz2(hierarchy_sunburst)
    drawBarChart(output)
    /* drawViz3(filt_data_barchart) */
    },1000);

// ALL RIGHT DATA IS GLOBAL 


// Append bubble object
var g = d3.select("#bubble")
    .append("svg")
    .attr("width", containerWidth_bubble)
    .attr("height", containerHeight_bubble)
    .append("g")
    .attr("viewBox", `-${vWidth_bubble / 2} -${vHeight_bubble / 2} ${vWidth_bubble} ${vHeight_bubble}`)
    .attr('transform', 'translate(' + vWidth_bubble / 2 + ',' + vHeight_bubble / 2 + ')')

// Append sunburst object
var g1 = d3.select("#sunburst")
    .append("svg")
    .attr("width", width_sunburst)
    .attr("height", height_sunburst)
    .append('g')
    .attr('transform', 'translate(' + width_sunburst / 2 + ',' + height_sunburst / 2 + ')');

var g3 = d3.select("#barchart")
    .append("svg")
    .attr("width", containerWidth_barchart )
    .attr("height", containerHeight_barchart)
    .append("g")
    .attr("height",  containerHeight_barchart )
    .attr("transform", "translate(-2,40)");

function drawViz(data) {
//   // Declare d3 layout
    var vRoot = data;
    var vLayout = d3.pack();
    //.size([vWidth, vHeight]);
//   // Layout + Data
    var vNodes = vRoot.descendants().slice(1);
    test = vNodes;
    console.log(vNodes);
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
        slice.exit().remove();

        slice.selectAll('text').remove();
        newSlice.append("svg:title")
            .text(showtextSunburst)
        newSlice.on("click", highlightSelectedSlice);

}

function drawBarChart(data){
    var max = d3.max(data, function(d){ return d.Value  ; });  
  
    var BandScale = d3.scaleBand()
            .range([0,containerHeight_barchart - 80 ])
            .padding(0.1)
            .domain(data.map(function(d) { return d.Maladie; }));
  
    var y = d3.scaleLinear()
            .range([0.80 * containerHeight_barchart, 0])
            .domain([0, d3.max(data, function(d) { return d.Value; })]);
     
    // definition de  X axis
    var xAxis = d3.scaleLinear()
    .domain([0, max])
    .range([ containerWidth_barchart, 0]);
    
    // definition de Y axis
    var yAxis = d3.scaleBand()
    .domain(data.map(function(d) { return d.Maladie; }))
    .range([containerHeight_barchart - 60, 0])
    .padding(.5);

    // mise en place de l'echelle des abscisses - X
    g3.append("g")
    .call(d3.axisBottom(xAxis))
    .selectAll("text")
    .attr("transform", "translate(0,-35)rotate(-65)")
    .style("text-anchor", "end");
  
      // Affichage des Bars
    g3.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x",  function(d) { return y(d.Value); })
    .attr("y",function(d) { return BandScale(d.Maladie); } )
    .attr("width",(function(d) { return (xAxis(0) - xAxis(d.Value)); }) )
    .attr("height", BandScale.bandwidth() )
    .style("fill", "#666");
  
    // Mise en plase de l'echelle des ordonnees - Y
        g3.append("g")
          .call(d3.axisLeft(yAxis))
         // .attr("height", containerHeight/2 )
          .attr("transform", "translate(288,-10)")
  
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
    const k = vWidth_bubble / v[2];
    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    vSlices.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    vSlices.attr("r", d => d.r * k);
    }

function zoom(d) {
    console.log(d)
    g.attr("viewBox", `-${vWidth_bubble / 2} -${vHeight_bubble / 2} ${vWidth_bubble} ${vHeight_bubble}`)

    const focus0 = focus;
    focus = d;
    const transition = g.transition()
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
        newSlice.style("opacity", 1);

        if (previouscliked !== c){
            newSlice.filter(function(d) {
                if (d == clicked) {
                    return true;}
                })
                .style("opacity", 0.4);
            subset = clicked.data.name  
            var filtres_bubble_maladie = subset;
            if (clicked.height == 1 ){
            var filt_data_bubble = data.filter(function(row){
                return (row["sex"] !== "T") && (row["region"]!=="FR") && (filtres_bubble.indexOf(row["region"]) !== -1) && (filtres_bubble_maladie.indexOf(row['icd10_2']) !== -1);
                }); 
                hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015');
                drawViz(hierarchy_bubble);
            }
            else if (clicked.height == 2 ){
                var filt_data_bubble = data.filter(function(row){
                    return (row["sex"] !== "T") && (row["region"]!=="FR") && (filtres_bubble.indexOf(row["region"]) !== -1) && (filtres_bubble_maladie.indexOf(row['icd10_1']) !== -1);
                    }); 
                    hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
                    drawViz(hierarchy_bubble)
                }
            else if (clicked.height == 0 ){
                var filt_data_bubble = data.filter(function(row){
                    return (row["sex"] !== "T") && (row["region"]!=="FR") && (filtres_bubble.indexOf(row["region"]) !== -1) && (filtres_bubble_maladie.indexOf(row['maladies']) !== -1);
                    }); 
                    hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
                    drawViz(hierarchy_bubble)
                }
            previouscliked = c;
            }
        else{
            var filt_data_bubble = data.filter(function(row){
                return (row["sex"] !== "T") && (row["region"]!=="FR") && (filtres_bubble.indexOf(row["region"]) !== -1);
                }); 
                hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015');
                drawViz(hierarchy_bubble);
        }
    };


function showtext(d){
    return ("Sélection : "+ d.data.name
            +"\nTotal : " + d.value )
}

function showtextSunburst(d){
    return ("Sélection : "+ d.data.name
            +"\nTotal : " + d.value )
}





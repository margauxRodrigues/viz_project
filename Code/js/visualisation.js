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
        icd10_0: d.icd10_nom_niv_0,
        icd10_1: d.icd10_nom_niv_1,
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
        return (row["region"]!=="FR") && 
/*                 (filtres_bubble.indexOf(row["region"]) !== -1) && */
                (row["sex"] !== "T") && 
                (row["maladies"] !== row["icd10_1"]) &&
                (row["maladies"] !== "Toutes causes de mortalite") &&
                (row["icd10_1"] !== "Toutes causes de mortalite") &&
                (row["icd10_2"] !== "Toutes causes de mortalite") &&

                (row["maladies"] !== row["icd10_0"]);
      }); 
    
    var filt_data_sunburst = data.filter(function(row){
        return (row["region"] == "France") &&
        (row["maladies"] !== row["icd10_1"]) &&
        (row["icd10_1"] !== row["icd10_2"]) &&
        (row["icd10_1"] !== row["icd10_0"]) &&
        (row["sex"] == "T");
    });
    /* var filt_data_barchart = data.filter(function(row){
        return (row)
    })
    */
    hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
    hierarchy_sunburst = flatToHierarchy(filt_data_sunburst, levels_sunburst, 'maladies', 'y2015', 'maladies')
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
    drawCart(data)
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
        .style("fill", function(d) { return color(d.x) })
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
        slice.on("mouseover", function() { 
            d3.select(this).style("opacity", 0.4)});
        slice.on("mouseout", function() { 
            d3.select(this).style("opacity", 1)});
        newSlice.append("svg:title")
            .text(showtextSunburst)
        newSlice.on("click", highlightSelectedSlice);

}

function drawBarChart(data){
    var max = d3.max(data, function(d){ return d.Value  ; });  
  
    var BandScale = d3.scaleBand()
            .range([0,containerHeight_barchart-80])
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
    .range([0, containerHeight_barchart - 60])
    .padding(.5);

    // mise en place de l'echelle des abscisses - X
    g3.append("g")
    .call(d3.axisBottom(xAxis))
    .selectAll("text")
    .attr("transform", "translate(0,-35)rotate(-65)")
    .style("text-anchor", "end")
    .style("fill", "#FFDE06");
  
    // Define the div for the tooltip
    var divT = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
    
      // Affichage des Bars
    g3.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x",  function(d) { return xAxis(d.Value); })
    .attr("y",function(d) { return BandScale(d.Maladie); } )
    .attr("width",(function(d) { return (xAxis(0) - xAxis(d.Value)); }) )
    .attr("height", BandScale.bandwidth() )
    .style("fill", "#666")
    .on("mouseover", function(d) {		
        divT.transition()		
            .duration(200)		
            .style("opacity", .9)		
        divT.html((d.Maladie) + "<br>" + (d.Value))	
            .style("left", (d3.event.pageX-280) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })					
    .on("mouseout", function(d) {		
        divT.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });
    
    // Mise en plase de l'echelle des ordonnees - Y
        g3.append("g")
          .call(d3.axisLeft(yAxis))
          .attr("class", "axisYellow")
          .attr("transform", "translate(288,-10)")
          .selectAll("text")
            .attr("transform", "translate(-40,0)")
  
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
                return (row["sex"] !== "T") && (row["maladies"] !== "Toutes causes de mortalite") && (row["region"]!=="FR")&& (row["icd10_1"] !== "Toutes causes de mortalite") &&
                (row["icd10_2"] !== "Toutes causes de mortalite") &&  (filtres_bubble_maladie.indexOf(row['icd10_2']) !== -1);
                }); 
                hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015');
                drawViz(hierarchy_bubble);
            }
            else if (clicked.height == 2 ){
                var filt_data_bubble = data.filter(function(row){
                    return (row["sex"] !== "T") && (row["maladies"] !== "Toutes causes de mortalite") && (row["region"]!=="FR") && (row["icd10_1"] !== "Toutes causes de mortalite") &&
                    (row["icd10_2"] !== "Toutes causes de mortalite")  && (filtres_bubble_maladie.indexOf(row['icd10_1']) !== -1);
                    }); 
                    hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
                    drawViz(hierarchy_bubble)
                }
            else if (clicked.height == 0 ){
                var filt_data_bubble = data.filter(function(row){
                    return (row["sex"] !== "T") && (row["maladies"] !== "Toutes causes de mortalite") && (row["region"]!=="FR") && (row["icd10_1"] !== "Toutes causes de mortalite") &&
                    (row["icd10_2"] !== "Toutes causes de mortalite")  && (filtres_bubble_maladie.indexOf(row['maladies']) !== -1);
                    }); 
                    hierarchy_bubble = flatToHierarchyBubble(filt_data_bubble, levels_bubble, 'maladies', 'y2015')
                    drawViz(hierarchy_bubble)
                }
            previouscliked = c;
            }
        else{
            var filt_data_bubble = data.filter(function(row){
                return (row["sex"] !== "T") && (row["icd10_1"] !== "Toutes causes de mortalite") &&
                (row["icd10_2"] !== "Toutes causes de mortalite") &&(row["maladies"] !== "Toutes causes de mortalite") &&(row["region"]!=="FR") ;
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


function drawCart(data) {
    const fr2id ={"FR42":0, "FR61":1, "FR72":2, "FR25":3, "FR26":4, "FR52":5, "FR24":6, "FR21":7, "FR83":8, "FR43":9,
    "FR23":10, "FR10":11, "FR81":12, "FR63":13, "FR41":14, "FR62":15, "FR30":16, "FR51":17, "FR22":18, "FR53":19, "FR82":20, "FR71":21 };

        d3.json('./Code/json/france2.json', (error, france) => {
            if (error) throw error;


            // Scale region value
            france["objects"]["poly"]["geometries"][fr2id["FR10"]]["properties"]["scale"] = 0.5; // Île-de-France
            france["objects"]["poly"]["geometries"][fr2id["FR21"]]["properties"]["scale"] = 1; // Champagne Ardennes
            france["objects"]["poly"]["geometries"][fr2id["FR22"]]["properties"]["scale"] = 1; // Picardie
            france["objects"]["poly"]["geometries"][fr2id["FR23"]]["properties"]["scale"] = 1; // Haute Normandie
            france["objects"]["poly"]["geometries"][fr2id["FR24"]]["properties"]["scale"] = 1.5; // Centre
            france["objects"]["poly"]["geometries"][fr2id["FR25"]]["properties"]["scale"] = 1; // Basse Normandie
            france["objects"]["poly"]["geometries"][fr2id["FR26"]]["properties"]["scale"] = 1; // Bourgogne
            france["objects"]["poly"]["geometries"][fr2id["FR30"]]["properties"]["scale"] = 1; // Nord Pas de Calais
            france["objects"]["poly"]["geometries"][fr2id["FR41"]]["properties"]["scale"] = 1.2; // Lorraine
            france["objects"]["poly"]["geometries"][fr2id["FR42"]]["properties"]["scale"] = 0.6; // Alsace
            france["objects"]["poly"]["geometries"][fr2id["FR43"]]["properties"]["scale"] = 0.8; // Franche Comté
            france["objects"]["poly"]["geometries"][fr2id["FR51"]]["properties"]["scale"] = 1; // Pays de la Loire
            france["objects"]["poly"]["geometries"][fr2id["FR52"]]["properties"]["scale"] = 1.5; // Bretagne
            france["objects"]["poly"]["geometries"][fr2id["FR53"]]["properties"]["scale"] = 1; // Poitou Charente
            france["objects"]["poly"]["geometries"][fr2id["FR61"]]["properties"]["scale"] = 2; // Aquitaine
            france["objects"]["poly"]["geometries"][fr2id["FR62"]]["properties"]["scale"] = 2; // Midi Pyrénées
            france["objects"]["poly"]["geometries"][fr2id["FR63"]]["properties"]["scale"] = 0.8; // Limousin
            france["objects"]["poly"]["geometries"][fr2id["FR71"]]["properties"]["scale"] = 1.5; // Rhône-Alpes
            france["objects"]["poly"]["geometries"][fr2id["FR72"]]["properties"]["scale"] = 1; // Auvergne
            france["objects"]["poly"]["geometries"][fr2id["FR81"]]["properties"]["scale"] = 1.2; // Languedoc Rousillon
            france["objects"]["poly"]["geometries"][fr2id["FR82"]]["properties"]["scale"] = 1; // Provence-Alpes-Côte d’Azur
            france["objects"]["poly"]["geometries"][fr2id["FR83"]]["properties"]["scale"] = 0.5; // Corse


            // Deaths value
            france["objects"]["poly"]["geometries"][fr2id["FR10"]]["properties"]["deaths"] = 0.5; // Île-de-France

            france["objects"]["poly"]["geometries"][fr2id["FR24"]]["properties"]["deaths"] = 1.7; // Centre
            france["objects"]["poly"]["geometries"][fr2id["FR26"]]["properties"]["deaths"] = 1.5; // Bourgogne
            france["objects"]["poly"]["geometries"][fr2id["FR25"]]["properties"]["deaths"] = 1.5; // Basse Normandie
            france["objects"]["poly"]["geometries"][fr2id["FR23"]]["properties"]["deaths"] = 1.5; // Haute Normandie
            france["objects"]["poly"]["geometries"][fr2id["FR22"]]["properties"]["deaths"] = 1.5; // Picardie
            france["objects"]["poly"]["geometries"][fr2id["FR21"]]["properties"]["deaths"] = 2.2; // Champagne Ardennes

            france["objects"]["poly"]["geometries"][fr2id["FR30"]]["properties"]["deaths"] = 0.3; // Nord Pas de Calais

            france["objects"]["poly"]["geometries"][fr2id["FR41"]]["properties"]["deaths"] = 0.3; // Lorraine
            france["objects"]["poly"]["geometries"][fr2id["FR42"]]["properties"]["deaths"] = 0.3; // Alsace
            france["objects"]["poly"]["geometries"][fr2id["FR43"]]["properties"]["deaths"] = 0.3; // Franche Comté

            france["objects"]["poly"]["geometries"][fr2id["FR51"]]["properties"]["deaths"] = 1.5; // Pays de la Loire
            france["objects"]["poly"]["geometries"][fr2id["FR52"]]["properties"]["deaths"] = 1.2; // Bretagne
            france["objects"]["poly"]["geometries"][fr2id["FR53"]]["properties"]["deaths"] = 1.2; // Poitou Charente

            france["objects"]["poly"]["geometries"][fr2id["FR61"]]["properties"]["deaths"] = 2.7; // Aquitaine
            france["objects"]["poly"]["geometries"][fr2id["FR62"]]["properties"]["deaths"] = 2.5; // Midi Pyrénées
            france["objects"]["poly"]["geometries"][fr2id["FR63"]]["properties"]["deaths"] = 2.5; // Limousin

            france["objects"]["poly"]["geometries"][fr2id["FR71"]]["properties"]["deaths"] = 2.2; // Rhône-Alpes
            france["objects"]["poly"]["geometries"][fr2id["FR72"]]["properties"]["deaths"] = 2.2;  // Auvergne

            france["objects"]["poly"]["geometries"][fr2id["FR81"]]["properties"]["deaths"] = 1.5; // Languedoc Rousillon
            france["objects"]["poly"]["geometries"][fr2id["FR82"]]["properties"]["deaths"] = 1.5; // Provence-Alpes-Côte d’Azur
            france["objects"]["poly"]["geometries"][fr2id["FR83"]]["properties"]["deaths"] = 0.3; // Corse

            console.log(france);

            const colorScale  = d3.scaleLinear()
                                    .domain([0,1,100,1000,15999,16000])
                                    .range([...d3.schemeRdBu[11]]);

            console.log(colorScale(100));

            Cartogram()
                .topoJson(france)
                .topoObjectName('countries')
                .iterations(120)
                .value(({ properties }) => properties.scale)
                .color(({ properties: { deaths } }) => colorScale(deaths))
                .projection(d3.geoMercator().scale(2500).translate([220, 2700]))
                .label(({ properties: p }) => `Nombre de mort ${p.deaths}`)
                .valFormatter(d3.format(".3s"))
                (document.getElementById('france'));

        });



}
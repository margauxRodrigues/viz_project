d3.json('./Code/json/france.json', (error, france) => {
    if (error) throw error;

    var i;
    for ( i = 0; i < 13; i++) {
        /*france["objects"]["centroid"]["geometries"][i]["properties"]["scale"] = i+1 ;*/
        /*france["objects"]["line"]["geometries"][i]["properties"]["scale"] = i+1 ;*/
        france["objects"]["poly"]["geometries"][i]["properties"]["scale"] = i+1 ;
    }

    console.log(france);

    console.log();

    Cartogram()
        .topoJson(france)
        .topoObjectName('countries')
        .iterations(10)
        .value(getScale)
        .projection(d3.geoMercator().scale(2500).translate([220, 2700]))
        .valFormatter(d3.format(".3s"))
        (document.getElementById('france'));

        function getScale({ properties: p }) {
            return p.scale;
        }
});


/*var data2;


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
        data2 = rows;
        // console.log(data)
        //draw();
    }
});

setTimeout(function(){
    var coco = data2.filter(function (row) {
        return (row["maladie"] == "Tumeurs");
    });
    console.log(coco);
});*/


const fr2id ={"FR10": 11, "FR24": 4, "FR26": 2, "FR25": 8, "FR22": 7,"FR21": 0
,"FR51":  9, "FR52": 3, "FR61": 1, "FR62": 6, "FR71": 12, "FR82": 10, "FR83":5};

d3.json('./Code/json/france.json', (error, france) => {
    if (error) throw error;


    // Scale region value
    france["objects"]["poly"]["geometries"][fr2id["FR10"]]["properties"]["scale"] = 0.5; // Île-de-France
    france["objects"]["poly"]["geometries"][fr2id["FR24"]]["properties"]["scale"] = 1.7; // Centre-Val de Loire
    france["objects"]["poly"]["geometries"][fr2id["FR26"]]["properties"]["scale"] = 1.5; // Bourgogne-Franche-Comté
    france["objects"]["poly"]["geometries"][fr2id["FR25"]]["properties"]["scale"] = 1.5; // Normandie
    france["objects"]["poly"]["geometries"][fr2id["FR22"]]["properties"]["scale"] = 1.5; // Hauts-de-France
    france["objects"]["poly"]["geometries"][fr2id["FR21"]]["properties"]["scale"] = 2.2; // Grand Est
    france["objects"]["poly"]["geometries"][fr2id["FR51"]]["properties"]["scale"] = 1.5; // Pays de la Loire
    france["objects"]["poly"]["geometries"][fr2id["FR52"]]["properties"]["scale"] = 1.2; // Bretagne
    france["objects"]["poly"]["geometries"][fr2id["FR61"]]["properties"]["scale"] = 2.7; // Nouvelle-Aquitaine
    france["objects"]["poly"]["geometries"][fr2id["FR62"]]["properties"]["scale"] = 2.5; // Occitanie
    france["objects"]["poly"]["geometries"][fr2id["FR71"]]["properties"]["scale"] = 2.2; // Auvergne-Rhône-Alpes
    france["objects"]["poly"]["geometries"][fr2id["FR82"]]["properties"]["scale"] = 1.5; // Provence-Alpes-Côte d’Azur
    france["objects"]["poly"]["geometries"][fr2id["FR83"]]["properties"]["scale"] = 0.3; // Corse

    // Deaths value
    france["objects"]["poly"]["geometries"][fr2id["FR10"]]["properties"]["deaths"] = 1; // Île-de-France
    france["objects"]["poly"]["geometries"][fr2id["FR24"]]["properties"]["deaths"] = 2; // Centre-Val de Loire
    france["objects"]["poly"]["geometries"][fr2id["FR26"]]["properties"]["deaths"] = 3; // Bourgogne-Franche-Comté
    france["objects"]["poly"]["geometries"][fr2id["FR25"]]["properties"]["deaths"] = 4; // Normandie
    france["objects"]["poly"]["geometries"][fr2id["FR22"]]["properties"]["deaths"] = 5; // Hauts-de-France
    france["objects"]["poly"]["geometries"][fr2id["FR21"]]["properties"]["deaths"] = 6; // Grand Est
    france["objects"]["poly"]["geometries"][fr2id["FR51"]]["properties"]["deaths"] = 7; // Pays de la Loire
    france["objects"]["poly"]["geometries"][fr2id["FR52"]]["properties"]["deaths"] = 8; // Bretagne
    france["objects"]["poly"]["geometries"][fr2id["FR61"]]["properties"]["deaths"] = 9; // Nouvelle-Aquitaine
    france["objects"]["poly"]["geometries"][fr2id["FR62"]]["properties"]["deaths"] = 10; // Occitanie
    france["objects"]["poly"]["geometries"][fr2id["FR71"]]["properties"]["deaths"] = 11; // Auvergne-Rhône-Alpes
    france["objects"]["poly"]["geometries"][fr2id["FR82"]]["properties"]["deaths"] = 12; // Provence-Alpes-Côte d’Azur
    france["objects"]["poly"]["geometries"][fr2id["FR83"]]["properties"]["deaths"] = 13; // Corse

    console.log(france);

    const colorScale = d3.scaleOrdinal([...d3.schemeCategory20c]);

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


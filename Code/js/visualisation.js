let dataset =[];

d3.csv("../data/df_fr.csv")
    .row( (d, i) => {
        return {
            sex: d.sex, 
            //inseeCode: +d.inseecode,
            //place: d.place,
            // longitude: +d.x, 
            // latitude: +d.y, 
            // population: +d.population, 
            // density: +d.density
        };
    })

    .get( (error, rows) => {
        console.log("Loaded " + rows.length + " rows");
        console.log("First row : ", rows[0])
        console.log("Last row : ", rows[rows.length-1])
        dataset = rows;
        //draw();
        }
    );
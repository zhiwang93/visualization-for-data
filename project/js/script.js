
d3.csv("dataset/us-airports.csv", function (error, airports) {
    let usmap = new Usmap(airports);
    console.log(airports);
    usmap.makeMap1();
    usmap.update1();
});



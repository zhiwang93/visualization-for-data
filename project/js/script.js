d3.csv("dataset/us-airports.csv", function (error, airports) {
    let usmap = new Usmap(airports);
    console.log(airports);
    usmap.makeMap1();
    usmap.update1();
});

d3.select("body")
    .transition()
    .duration(1)
    .style("background-color", "white");

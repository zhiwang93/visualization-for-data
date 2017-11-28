let stats = new Stats();
let usmap = new Usmap(stats);
let force = new Force(usmap);
d3.csv("dataset/us_airports.csv", function (error, airports) {
    usmap.makeMap();
    usmap.importData(airports);
    usmap.makeSpots();
    force.draw();
});

//the function that called by checkbox
function checkbox() {

    stats.removeContainer();
    stats.setHasContainer(false);

    if (document.getElementById("checkbox").checked) {
        d3.csv("dataset/us_airports.csv", function (error, airports) {
            usmap.importData(airports);
            usmap.makeSpots();
        });
    } else {
        d3.csv("dataset/us_airports_fltd.csv", function (error, airports) {
            usmap.importData(airports);
            usmap.makeSpots();
        });
    }
}

//the function that called by button "Clear Map"
function clearMap() {
    usmap.clearRoutes();
}

//the funciton that called by search bar
function searchAirport() {
    let keyword = document.getElementById("keyword").value;
    let spots = d3.select("#spots").selectAll("circle")
        .each(function (d) {
            if (d.iata_code == keyword.toUpperCase() || d.icao_code == keyword.toUpperCase() || d.municipality.toUpperCase() == keyword.toUpperCase()) {
                usmap.simulateClick(d, d3.select(this))
                return;
            }
        })
}

//the function that called by enter hit
function enterHit(event) {
    if (event.which == 13 || event.KeyCode == 13)
        searchAirport();
}
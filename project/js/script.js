let stats = new Stats();
let usmap = new Usmap(stats);
d3.csv("dataset/us_airports.csv", function (error, airports) {
    usmap.makeMap();
    usmap.importData(airports);
    usmap.makeSpots();
    usmap.updateMap();
});

function checkbox() {

    stats.removeContainer();
    stats.setHasContainer(false);

    if (document.getElementById("checkbox").checked) {
        d3.csv("dataset/us_airports.csv", function (error, airports) {
            usmap.importData(airports);
            usmap.makeSpots();
            usmap.updateMap();
        });
    } else {
        d3.csv("dataset/us_airports_fltd.csv", function (error, airports) {
            usmap.importData(airports);
            usmap.makeSpots();
            usmap.updateMap();
        });
    }
}

function clearMap() {
    usmap.clearRoutes();
}

// var months = d3.scale.ordinal()
//     .domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
//     .rangePoints([0,220]);
// var bar1x = d3.svg.axis().scale(months).orient("left");
// d3.select("#monthsvg").append("g").attr("transform", "translate(110,210) rotate(270)")
//     .attr("class", "xaxis").call(bar1x);
//
// var bar2x = d3.svg.axis().scale(months).orient("left");
// d3.select("#monthsvg").append("g").attr("transform", "translate(510,210) rotate(270)")
//     .attr("class", "xaxis").call(bar2x);
//
// var bar3x = d3.svg.axis().scale(months).orient("left");
// d3.select("#monthsvg").append("g").attr("transform", "translate(910,210) rotate(270)")
//     .attr("class", "xaxis").call(bar3x);
//
// var days = d3.scale.ordinal()
//     .domain(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
//     .rangePoints([0,206]);
// var bar4x = d3.svg.axis().scale(days).orient("left");
// d3.select("#weeksvg").append("g").attr("transform", "translate(117,210) rotate(270)")
//     .attr("class", "xaxis").call(bar4x);
//
// var bar5x = d3.svg.axis().scale(days).orient("left");
// d3.select("#weeksvg").append("g").attr("transform", "translate(517,210) rotate(270)")
//     .attr("class", "xaxis").call(bar5x);
//
// var bar6x = d3.svg.axis().scale(days).orient("left");
// d3.select("#weeksvg").append("g").attr("transform", "translate(917,210) rotate(270)")
//     .attr("class", "xaxis").call(bar6x);
//
// var hours = d3.scale.ordinal()
//     .domain(["00:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
//         "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
//         "19:00", "20:00", "21:00", "22:00", "23:00"])
//     .rangePoints([0,235]);
//
// var bar7x = d3.svg.axis().scale(hours).orient("left");
// d3.select("#hoursvg").append("g").attr("transform", "translate(106.5,210) rotate(270)")
//     .attr("class", "xaxis").call(bar7x);
//
// var bar8x = d3.svg.axis().scale(hours).orient("left");
// d3.select("#hoursvg").append("g").attr("transform", "translate(506.5,210) rotate(270)")
//     .attr("class", "xaxis").call(bar8x);
//
// var bar9x = d3.svg.axis().scale(hours).orient("left");
// d3.select("#hoursvg").append("g").attr("transform", "translate(906.5,210) rotate(270)")
//     .attr("class", "xaxis").call(bar9x);

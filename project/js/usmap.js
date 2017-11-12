class Usmap{

    constructor(airports){
        this.airports = airports;
        this.airportsmap = {};
        for(let i = 0; i < airports.length; i++)
            this.airportsmap[airports[i].iata_code] = airports[i];
        console.log(this.airportsmap);
        this.mapWidth = 960;
        this.mapHeight = 600;

        this.projection = d3.geo.albersUsa()
            .translate([this.mapWidth/2, this.mapHeight/2])
            .scale([1000]);
    }

    makeMap1(){

        d3.select("#usmap").selectAll("g").remove();

        let path = d3.geo.path()
            .projection(this.projection);

        let g1 = d3.select("#usmap").append("g")
            .attr("id", "path");

        d3.json("dataset/us-states.json", function(json) {
            g1.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "mappath");
        });
    }

    update1() {
        let airports = this.airports;
        let airportsmap = {};

        let projection = this.projection;
        d3.select("#usmap").select("#spots").remove();
        d3.select("#usmap").selectAll("line").remove();
        d3.select("#summary").selectAll(".summaryvalue").remove();

        for (let i = 0; i < airports.length; i++) {
            if (projection([airports[i].lon, airports[i].lat]) == null) {
                airports.splice(i, 1);
                i--;
            }
            else {
                airportsmap[airports[i].iata_code] = projection([airports[i].lon, airports[i].lat]);
            }
        }
        console.log(airportsmap);
        let g2 = d3.select("#usmap").append("g")
            .attr("id", "spots");

        let spots = g2.selectAll("circle").data(airports);
        spots.enter().append("circle")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", function (d) {
                if (d.type == "small_airport") return 1;
                else if (d.type == "medium_airport") return 4;
                else if (d.type == "large_airport") return 8;
                else return 0;
            })
            .attr("class", "spot");

        spots.on("click", function (d) {

            g2.selectAll("text").remove();
            g2.selectAll("line").remove();
            d3.selectAll(".summaryvalue").remove();
            d3.selectAll(".arc").remove();
            let names = g2.append("text")
                .text(function () {
                    return d.name;
                })
                .attr("x", 20)
                .attr("y", 50)
                .attr("class", "airportname");

            d3.select("#summary").append("text").attr("x", 80).attr("y", 98)
                .text(function(){return d.name})
                .attr("class", "summaryvalue");
            d3.select("#summary").append("text").attr("x", 140).attr("y", 128)
                .text(function(){return d.iata_code})
                .attr("class", "summaryvalue");
            d3.select("#summary").append("text").attr("x", 75).attr("y", 158)
                .text(function(){return d.type})
                .attr("class", "summaryvalue");

            d3.csv("dataset/Summary.csv", function(summary){
               console.log(summary);
                let data = null;
                for (let i = 0; i < summary.length; i++) {
                    if (d.iata_code == summary[i].Origin) {
                        data = summary[i];
                        break;
                    }
                }
                d3.select("#summary").append("text").attr("x", 135).attr("y", 188)
                    .text(function(){return data == null ? 0 : data.TotalFlightCount;})
                    .attr("class", "summaryvalue");
                d3.select("#summary").append("text").attr("x", 175).attr("y", 218)
                    .text(function(){return (data == null ? 0 : data.AvgDly) + " minutes";})
                    .attr("class", "summaryvalue");

                var dataset;
                if(data != null) {
                    var dataset = [
                        {legend: "Carrier Delay", value: data["TotalCarrierDly"], color: "red"},
                        {legend: "Weather Delay", value: data["TotalWeatherDly"], color: "yellow"},
                        {legend: "NASA Delay", value: data["TotalNASDly"], color: "green"},
                        {legend: "Security Delay", value: data["TotalSecurityDly"], color: "pink"},
                        {legend: "Late Aircraft Delay", value: data["TotalLateAircraftDly"], color: "blue"}
                    ];
                }
                else{
                    var dataset = [
                        {legend: "Carrier Delay", value: 0, color: "red"},
                        {legend: "Weather Delay", value: 0, color: "yellow"},
                        {legend: "NASA Delay", value: 0, color: "green"},
                        {legend: "Security Delay", value: 0, color: "pink"},
                        {legend: "Late Aircraft Delay", value: 0, color: "blue"}
                    ];
                }

                var radius = 150;

                var svg = d3.select("#summary")
                    .append("g")
                    .attr("transform", "translate(270,400)");

                var arc = d3.svg.arc()
                    .outerRadius(radius)
                    .innerRadius(30);

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(x){ return x.value; });

                var g = svg.selectAll(".arc")
                    .data(pie(dataset))
                    .enter()
                    .append("g")
                    .attr("class", "arc");

                g.append("path")
                    .attr("d", arc)
                    .attr("fill", function(x){
                        console.log(x);
                        return x.data.color; })

                g.append("text")
                    .attr("transform", function(x) {
                        console.log(x);
                        return "translate(" + arc.centroid(x)[0]*2.2 + "," + arc.centroid(x)[1]*2.2 + ")"; })
                    .style("class", "arc")
                    .text(function(x) { return x.data.legend; });
            });


            d3.csv("dataset/airportconnection.csv", function (connections) {
                let airportconnection = connections.filter(function (c) {
                    return c.ORIGIN == d.iata_code;
                });

                let routes = g2.selectAll("line").data(airportconnection);
                routes.enter().append("line")
                    .attr("x1", function () {
                        return projection([d.lon, d.lat])[0];
                    })
                    .attr("y1", function () {
                        return projection([d.lon, d.lat])[1];
                    })
                    .attr("x2", function (a) {
                        var dest = airportsmap[a.DEST];
                        return dest == null ? projection([d.lon, d.lat])[0] : dest[0];
                    })
                    .attr("y2", function (a) {
                        var dest = airportsmap[a.DEST];
                        return dest == null ? projection([d.lon, d.lat])[1] : dest[1];
                    })
                    .attr("class", "route");
            });

            d3.csv("dataset/ByMonth.csv", function (ByMonth) {
                let data = null;
                for (let i = 0; i < ByMonth.length; i++) {
                    if (d.iata_code == ByMonth[i].Origin) {
                        data = ByMonth[i];
                        break;
                    }
                }
                if (data != null) {
                    let flightdata = [parseFloat(data["January.FlightCount"]),
                        parseFloat(data["February.FlightCount"]),
                        parseFloat(data["March.FlightCount"]),
                        parseFloat(data["April.FlightCount"]),
                        parseFloat(data["May.FlightCount"]),
                        parseFloat(data["June.FlightCount"]),
                        parseFloat(data["July.FlightCount"]),
                        parseFloat(data["August.FlightCount"]),
                        parseFloat(data["September.FlightCount"]),
                        parseFloat(data["October.FlightCount"]),
                        parseFloat(data["November.FlightCount"]),
                        parseFloat(data["December.FlightCount"])];

                    let flightDataScale = d3.scale.linear()
                        .domain([0, d3.max(flightdata) * 1.2])
                        .range([0, 200]);

                    let fg = d3.select("#bar1").attr("transform", "translate(50, 200) scale(1,-1)");
                    fg.selectAll("rect").remove();
                    let flight = fg.selectAll("rect").data(flightdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 20;
                        })
                        .attr("y", 0)
                        .attr("width", 20)
                        .attr("height", 0);
                    flight.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return flightDataScale(a);
                        })
                        .attr("class", "bar1");

                    let depdata = [data["January.DepDly"] / data["January.FlightCount"],
                        data["February.DepDly"] / data["February.FlightCount"],
                        data["March.DepDly"] / data["March.FlightCount"],
                        data["April.DepDly"] / data["April.FlightCount"],
                        data["May.DepDly"] / data["May.FlightCount"],
                        data["June.DepDly"] / data["June.FlightCount"],
                        data["July.DepDly"] / data["July.FlightCount"],
                        data["August.DepDly"] / data["August.FlightCount"],
                        data["September.DepDly"] / data["September.FlightCount"],
                        data["October.DepDly"] / data["October.FlightCount"],
                        data["November.DepDly"] / data["November.FlightCount"],
                        data["December.DepDly"] / data["December.FlightCount"]];

                    let depScale = d3.scale.linear()
                        .domain([0, d3.max(depdata) * 1.2])
                        .range([0, 200]);

                    let dg = d3.select("#bar2").attr("transform", "translate(350, 200) scale(1,-1)");
                    dg.selectAll("rect").remove();
                    let dep = dg.selectAll("rect").data(depdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 20;
                        })
                        .attr("y", 0)
                        .attr("width", 20)
                        .attr("height", 0);
                    dep.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return depScale(a);
                        })
                        .attr("class", "bar1");

                    let arrdata = [data["January.ArrDly"] / data["January.FlightCount"],
                        data["February.ArrDly"] / data["February.FlightCount"],
                        data["March.ArrDly"] / data["March.FlightCount"],
                        data["April.ArrDly"] / data["April.FlightCount"],
                        data["May.ArrDly"] / data["May.FlightCount"],
                        data["June.ArrDly"] / data["June.FlightCount"],
                        data["July.ArrDly"] / data["July.FlightCount"],
                        data["August.ArrDly"] / data["August.FlightCount"],
                        data["September.ArrDly"] / data["September.FlightCount"],
                        data["October.ArrDly"] / data["October.FlightCount"],
                        data["November.ArrDly"] / data["November.FlightCount"],
                        data["December.ArrDly"] / data["December.FlightCount"]];

                    let arrScale = d3.scale.linear()
                        .domain([0, d3.max(arrdata) * 1.2])
                        .range([0, 200]);

                    let ag = d3.select("#bar3").attr("transform", "translate(650, 200) scale(1,-1)");
                    ag.selectAll("rect").remove();
                    let arr = ag.selectAll("rect").data(arrdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 20;
                        })
                        .attr("y", 0)
                        .attr("width", 20)
                        .attr("height", 0);
                    arr.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return arrScale(a);
                        })
                        .attr("class", "bar1");
                }
            });

            d3.csv("dataset/ByWeek.csv", function (ByWeek) {
                let data = null;
                for (let i = 0; i < ByWeek.length; i++) {
                    if (d.iata_code == ByWeek[i].Origin) {
                        data = ByWeek[i];
                        break;
                    }
                }
                if (data != null) {
                    let flightdata = [parseFloat(data["Monday.FlightCount"]),
                        parseFloat(data["Tuesday.FlightCount"]),
                        parseFloat(data["Wednesday.FlightCount"]),
                        parseFloat(data["Thursday.FlightCount"]),
                        parseFloat(data["Friday.FlightCount"]),
                        parseFloat(data["Saturday.FlightCount"]),
                        parseFloat(data["Sunday.FlightCount"])];

                    let flightDataScale = d3.scale.linear()
                        .domain([0, d3.max(flightdata) * 1.2])
                        .range([0, 200]);

                    let fg = d3.select("#bar4").attr("transform", "translate(50, 200) scale(1,-1)");
                    fg.selectAll("rect").remove();
                    let flight = fg.selectAll("rect").data(flightdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 34;
                        })
                        .attr("y", 0)
                        .attr("width", 34)
                        .attr("height", 0);
                    flight.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return flightDataScale(a);
                        })
                        .attr("class", "bar2");

                    let depdata = [data["Monday.DepDly"] / data["Monday.FlightCount"],
                        data["Tuesday.DepDly"] / data["Tuesday.FlightCount"],
                        data["Wednesday.DepDly"] / data["Wednesday.FlightCount"],
                        data["Thursday.DepDly"] / data["Thursday.FlightCount"],
                        data["Friday.DepDly"] / data["Friday.FlightCount"],
                        data["Saturday.DepDly"] / data["Saturday.FlightCount"],
                        data["Sunday.DepDly"] / data["Sunday.FlightCount"]];

                    let depScale = d3.scale.linear()
                        .domain([0, d3.max(depdata) * 1.2])
                        .range([0, 200]);

                    let dg = d3.select("#bar5").attr("transform", "translate(350, 200) scale(1,-1)");
                    dg.selectAll("rect").remove();
                    let dep = dg.selectAll("rect").data(depdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 34;
                        })
                        .attr("y", 0)
                        .attr("width", 34)
                        .attr("height", 0);
                    dep.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return depScale(a);
                        })
                        .attr("class", "bar2");

                    let arrdata = [data["Monday.ArrDly"] / data["Monday.FlightCount"],
                        data["Tuesday.ArrDly"] / data["Tuesday.FlightCount"],
                        data["Wednesday.ArrDly"] / data["Wednesday.FlightCount"],
                        data["Thursday.ArrDly"] / data["Thursday.FlightCount"],
                        data["Friday.ArrDly"] / data["Friday.FlightCount"],
                        data["Saturday.ArrDly"] / data["Saturday.FlightCount"],
                        data["Sunday.ArrDly"] / data["Sunday.FlightCount"]];

                    let arrScale = d3.scale.linear()
                        .domain([0, d3.max(arrdata) * 1.2])
                        .range([0, 200]);

                    let ag = d3.select("#bar6").attr("transform", "translate(650, 200) scale(1,-1)");
                    ag.selectAll("rect").remove();
                    let arr = ag.selectAll("rect").data(arrdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 34;
                        })
                        .attr("y", 0)
                        .attr("width", 34)
                        .attr("height", 0);
                    arr.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return arrScale(a);
                        })
                        .attr("class", "bar2");
                }
            });
        });
    }
}
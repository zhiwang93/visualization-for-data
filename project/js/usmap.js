class Usmap{

    constructor(airports){
        this.airports = airports;
        this.airportsmap = {};
        for(let i = 0; i < airports.length; i++)
            this.airportsmap[airports[i].iata_code] = airports[i];
        console.log(this.airportsmap);

        this.offsetX = 0;
        this.offsetY = 10;
        this.mapWidth = 1600;
        this.mapHeight = 1000;

        this.projection = d3.geo.albersUsa()
            .translate([this.mapWidth / 2, this.mapHeight / 2])
            .scale([this.mapWidth * 1.36]);
    }

    makeMap1(){

        //Set map to be responsive
        d3.select("#usmap")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", this.offsetX+" "+this.offsetY+" "+this.mapWidth+" "+this.mapHeight)

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
        let updateCard = this.updateCard;
        let updatePie = this.updatePie;

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

            updateCard(d);
            updatePie(d);

            // d3.csv("dataset/Summary.csv", function (summary) {
            //     console.log(summary);
            //     let data = null;
            //     for (let i = 0; i < summary.length; i++) {
            //         if (d.iata_code == summary[i].Origin) {
            //             data = summary[i];
            //             break;
            //         }
            //     }
            //
            //     var dataset;
            //     if (data != null) {
            //         var dataset = [
            //             {legend: "Carrier Delay", value: data["TotalCarrierDly"], color: "red"},
            //             {legend: "Weather Delay", value: data["TotalWeatherDly"], color: "yellow"},
            //             {legend: "NASA Delay", value: data["TotalNASDly"], color: "green"},
            //             {legend: "Security Delay", value: data["TotalSecurityDly"], color: "pink"},
            //             {legend: "Late Aircraft Delay", value: data["TotalLateAircraftDly"], color: "blue"}
            //         ];
            //     }
            //     else {
            //         var dataset = [
            //             {legend: "", value: 0, color: "red"},
            //             {legend: "", value: 0, color: "yellow"},
            //             {legend: "", value: 0, color: "green"},
            //             {legend: "", value: 0, color: "pink"},
            //             {legend: "", value: 0, color: "blue"}
            //         ];
            //     }
            //
            //     var radius = 150;
            //
            //     var svg = d3.select("#summary")
            //         .append("g")
            //         .attr("transform", "translate(270,400)");
            //
            //     var arc = d3.svg.arc()
            //         .outerRadius(radius)
            //         .innerRadius(30);
            //
            //     var pie = d3.layout.pie()
            //         .sort(null)
            //         .value(function (x) {
            //             return x.value;
            //         });
            //
            //     var g = svg.selectAll(".arc")
            //         .data(pie(dataset))
            //         .enter()
            //         .append("g")
            //         .attr("class", "arc");
            //
            //     g.append("path")
            //         .attr("d", arc)
            //         .attr("fill", function (x) {
            //             return x.data.color;
            //         })
            //
            //     g.append("text")
            //         .attr("transform", function (x) {
            //             return "translate(" + arc.centroid(x)[0] * 2.2 + "," + arc.centroid(x)[1] * 2.2 + ")";
            //         })
            //         .style("class", "arc")
            //         .text(function (x) {
            //             return x.data.legend;
            //         });
            // });


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

                    let yScale1 = d3.scale.linear()
                        .domain([d3.max(flightdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar1y = d3.svg.axis().scale(yScale1).orient("left");
                    d3.select("#y1").attr("transform", "translate(100,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar1y);

                    let fg = d3.select("#bar1").attr("transform", "translate(100, 210) scale(1,-1)");
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
                    let yScale2 = d3.scale.linear()
                        .domain([d3.max(depdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar2y = d3.svg.axis().scale(yScale2).orient("left");
                    d3.select("#y2").attr("transform", "translate(500,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar2y);

                    let dg = d3.select("#bar2").attr("transform", "translate(500, 210) scale(1,-1)");
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
                    let yScale3 = d3.scale.linear()
                        .domain([d3.max(arrdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar3y = d3.svg.axis().scale(yScale3).orient("left");
                    d3.select("#y3").attr("transform", "translate(900,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar3y);

                    let ag = d3.select("#bar3").attr("transform", "translate(900, 210) scale(1,-1)");
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

                    let yScale4 = d3.scale.linear()
                        .domain([d3.max(flightdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar4y = d3.svg.axis().scale(yScale4).orient("left");
                    d3.select("#y4").attr("transform", "translate(100,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar4y);

                    let fg = d3.select("#bar4").attr("transform", "translate(100, 210) scale(1,-1)");
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
                    let yScale5 = d3.scale.linear()
                        .domain([d3.max(depdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar5y = d3.svg.axis().scale(yScale5).orient("left");
                    d3.select("#y5").attr("transform", "translate(500,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar5y);

                    let dg = d3.select("#bar5").attr("transform", "translate(500, 210) scale(1,-1)");
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
                    let yScale6 = d3.scale.linear()
                        .domain([d3.max(arrdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar6y = d3.svg.axis().scale(yScale6).orient("left");
                    d3.select("#y6").attr("transform", "translate(900,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar6y);

                    let ag = d3.select("#bar6").attr("transform", "translate(900, 210) scale(1,-1)");
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

            d3.csv("dataset/ByHour.csv", function (ByHour) {
                let data = null;
                for (let i = 0; i < ByHour.length; i++) {
                    if (d.iata_code == ByHour[i].Origin) {
                        data = ByHour[i];
                        break;
                    }
                }
                console.log(data);
                if (data != null) {
                    let flightdata = [parseFloat(data["00.FlightCount"]),
                        parseFloat(data["06.FlightCount"]),
                        parseFloat(data["07.FlightCount"]),
                        parseFloat(data["08.FlightCount"]),
                        parseFloat(data["09.FlightCount"]),
                        parseFloat(data["10.FlightCount"]),
                        parseFloat(data["11.FlightCount"]),
                        parseFloat(data["12.FlightCount"]),
                        parseFloat(data["13.FlightCount"]),
                        parseFloat(data["14.FlightCount"]),
                        parseFloat(data["15.FlightCount"]),
                        parseFloat(data["16.FlightCount"]),
                        parseFloat(data["17.FlightCount"]),
                        parseFloat(data["18.FlightCount"]),
                        parseFloat(data["19.FlightCount"]),
                        parseFloat(data["20.FlightCount"]),
                        parseFloat(data["21.FlightCount"]),
                        parseFloat(data["22.FlightCount"]),
                        parseFloat(data["23.FlightCount"])];

                    let flightDataScale = d3.scale.linear()
                        .domain([0, d3.max(flightdata) * 1.2])
                        .range([0, 200]);
                    let yScale7 = d3.scale.linear()
                        .domain([d3.max(flightdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar7y = d3.svg.axis().scale(yScale7).orient("left");
                    d3.select("#y7").attr("transform", "translate(100,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar7y);

                    let fg = d3.select("#bar7").attr("transform", "translate(100, 210) scale(1,-1)");
                    fg.selectAll("rect").remove();
                    let flight = fg.selectAll("rect").data(flightdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 13;
                        })
                        .attr("y", 0)
                        .attr("width", 13)
                        .attr("height", 0);
                    flight.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return flightDataScale(a);
                        })
                        .attr("class", "bar3");

                    let depdata = [data["00.DepDly"]/data["00.FlightCount"],
                        parseFloat(data["06.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["07.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["08.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["09.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["10.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["11.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["12.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["13.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["14.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["15.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["16.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["17.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["18.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["19.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["20.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["21.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["22.DepDly"]/data["00.FlightCount"]),
                        parseFloat(data["23.DepDly"]/data["00.FlightCount"])];

                    let depScale = d3.scale.linear()
                        .domain([0, d3.max(depdata) * 1.2])
                        .range([0, 200]);
                    let yScale8 = d3.scale.linear()
                        .domain([d3.max(depdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar8y = d3.svg.axis().scale(yScale8).orient("left");
                    d3.select("#y8").attr("transform", "translate(500,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar8y);

                    let dg = d3.select("#bar8").attr("transform", "translate(500, 210) scale(1,-1)");
                    dg.selectAll("rect").remove();
                    let dep = dg.selectAll("rect").data(depdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 13;
                        })
                        .attr("y", 0)
                        .attr("width", 13)
                        .attr("height", 0);
                    dep.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return depScale(a);
                        })
                        .attr("class", "bar3");

                    let arrdata = [data["00.ArrDly"]/data["00.FlightCount"],
                        parseFloat(data["06.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["07.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["08.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["09.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["10.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["11.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["12.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["13.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["14.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["15.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["16.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["17.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["18.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["19.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["20.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["21.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["22.ArrDly"]/data["00.FlightCount"]),
                        parseFloat(data["23.ArrDly"]/data["00.FlightCount"])];

                    let arrScale = d3.scale.linear()
                        .domain([0, d3.max(arrdata) * 1.2])
                        .range([0, 200]);
                    let yScale9 = d3.scale.linear()
                        .domain([d3.max(arrdata) * 1.2, 0])
                        .range([0, 200]);

                    var bar9y = d3.svg.axis().scale(yScale9).orient("left");
                    d3.select("#y9").attr("transform", "translate(900,10)")
                        .transition().duration(3000)
                        .attr("class", "yaxis").call(bar9y);


                    let ag = d3.select("#bar9").attr("transform", "translate(900, 210) scale(1,-1)");
                    ag.selectAll("rect").remove();
                    let arr = ag.selectAll("rect").data(arrdata).enter().append("rect")
                        .attr("x", function (a, i) {
                            return i * 13;
                        })
                        .attr("y", 0)
                        .attr("width", 13)
                        .attr("height", 0);
                    arr.transition().duration(3000).delay(function (a, i) {
                        return i * 50;
                    })
                        .attr("height", function (a) {
                            return arrScale(a);
                        })
                        .attr("class", "bar3");
                }
            });
        });
    }

    updateCard(d) {
        let card = d3.select("#carddiv")
            .attr("style", "opacity: 1")
        let title = d3.select("#card_title")
            .text(d.name)
        let iata = d3.select("#card_iata")
            .text("IATA Code: "+d.iata_code)
        let type = d3.select("#card_type")
            .text("Airport Type: "+d.type)
        let latitude = d3.select("#card_latitude")
            .text("Latitude: "+d.lat)
        let longitude = d3.select("#card_longitude")
            .text("Longitude: "+d.lon)

        d3.csv("dataset/Summary.csv", function (summary) {
            let data = null;
            for (let i = 0; i < summary.length; i++) {
                if (d.iata_code == summary[i].Origin) {
                    data = summary[i];
                    break;
                }
            }
            let count = d3.select("#card_count")
                .text(function () {
                    let result = "Annual Flights: ";
                    result += data == null ? "" : data.TotalFlightCount;
                    return result;
                });
            let delay = d3.select("#card_delay")
                .text(function () {
                    let result = "Average Delay: ";
                    result += data == null ? "" : data.AvgDly + " minutes";
                    return result;
                });
        });
    }

    updatePie(d) {
        d3.csv("dataset/Summary.csv", function (summary) {
            let data = null;
            for (let i = 0; i < summary.length; i++) {
                if (d.iata_code == summary[i].Origin) {
                    data = summary[i];
                    break;
                }
            }

            let dataset;
            if (data != null) {
                dataset = [
                    {legend: "Carrier Delay", value: data["TotalCarrierDly"], color: "red"},
                    {legend: "Weather Delay", value: data["TotalWeatherDly"], color: "yellow"},
                    {legend: "NASA Delay", value: data["TotalNASDly"], color: "green"},
                    {legend: "Security Delay", value: data["TotalSecurityDly"], color: "pink"},
                    {legend: "Late Aircraft Delay", value: data["TotalLateAircraftDly"], color: "blue"}
                ];
            }
            else {
                dataset = [
                    {legend: "", value: 0, color: "red"},
                    {legend: "", value: 0, color: "yellow"},
                    {legend: "", value: 0, color: "green"},
                    {legend: "", value: 0, color: "pink"},
                    {legend: "", value: 0, color: "blue"}
                ];
            }

            let radius = 150;

            let svg = d3.select("#summary")
                .append("g")
                .attr("transform", "translate(270,400)");

            let arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(30);

            let pie = d3.layout.pie()
                .sort(null)
                .value(function (x) {
                    return x.value;
                });

            let g = svg.selectAll(".arc")
                .data(pie(dataset))
                .enter()
                .append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .attr("fill", function (x) {
                    return x.data.color;
                })

            g.append("text")
                .attr("transform", function (x) {
                    return "translate(" + arc.centroid(x)[0] * 2.2 + "," + arc.centroid(x)[1] * 2.2 + ")";
                })
                .style("class", "arc")
                .text(function (x) {
                    return x.data.legend;
                });
        });
    }

    // updateTop10(){
    //     let airports = this.airports.slice(0, 10);
    //     d3.select("#top10").select("svg").remove();
    //
    //     let svg = d3.select("#top10").append("svg")
    //         .attr("width", 500);
    //     .attr("height", 260);
    //
    //     let g = svg.append("g");
    //     let bars = g.selectAll("rect").data(airports);
    //     bars.enter().append("rect")
    //         .attr("x", 0)
    //         .attr("y", function(d, i){return i*20;})
    //         .attr("height", 20)
    //         .attr("width", function(d){return })
    //
    // }
}
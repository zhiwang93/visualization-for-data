class Usmap{

    constructor(airports){
        this.airports = airports;
        this.airportsmap = {};

        this.offsetX = 0;
        this.offsetY = 0;
        this.mapWidth = 1600;
        this.mapHeight = 1050;

        this.projection = d3.geoAlbersUsa()
            .translate([this.mapWidth / 2, this.mapHeight / 2])
            .scale([this.mapWidth * 1.36]);

        for (let i = 0; i < this.airports.length; i++) {
            if (this.projection([this.airports[i].lon, this.airports[i].lat]) == null) {
                this.airports.splice(i, 1);
                i--;
            }
            else {
                this.airportsmap[this.airports[i].iata_code] = this.projection([this.airports[i].lon, this.airports[i].lat]);
            }
        }
    }

    makeMap1(){

        let airports = this.airports;
        let projection = this.projection;

        //remove all the elements first
        d3.select("#usmap").selectAll("g").remove();

        //Set map to be responsive
        let usmap = d3.select("#usmap")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", this.offsetX+" "+this.offsetY+" "+this.mapWidth+" "+this.mapHeight)

        //draw map
        let path = d3.geoPath()
            .projection(projection);

        let pathgroup = usmap.append("g")
            .attr("id", "path");

        d3.json("dataset/us-states.json", function(json) {
            pathgroup.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "mappath");
        });

        //draw spots
        let spotsGroup = usmap.append("g")
            .attr("id", "spots");
        let spots = spotsGroup.selectAll("circle")
            .data(airports);
        spots.enter().append("circle")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", function (d) {
                if (d.type == "small_airport") return 2;
                else if (d.type == "medium_airport") return 5;
                else if (d.type == "large_airport") return 15;
                else return 0;
            })
            .attr("class", "spot")

        //draw legend
        let linearSize = d3.scaleOrdinal()
            .domain(["Small Airport", "Midium Airport", "Large Airport"])
            .range([2, 5, 15]);

        let legendgroup = usmap.append("g")
            .attr("id", "maplegend")
            .attr("transform", "translate("+ this.mapWidth * 0.87+","+ this.mapHeight * 0.7 +")");

        let legendSize = d3.legendSize()
            .scale(linearSize)
            .shape('circle')
            .shapePadding(20)
            .labelOffset(10)
            .orient('vertical');

        legendgroup.call(legendSize);
    }

    update1() {

        let airports = this.airports;
        let airportsmap = this.airportsmap;
        let projection = this.projection;

        let updateSpots = this.updateSpots;
        let updateLine = this.updateLine;
        let updateCard = this.updateCard;
        let updatePie = this.updatePie;

        //set actions after click
        d3.select("#spots").selectAll("circle")
            .on("click", function (d) {

                updateSpots(d3.select(this));
                updateLine(d, projection, airportsmap);
                updateCard(d);
                updatePie(d);

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

                        let flightDataScale = d3.scaleLinear()
                            .domain([0, d3.max(flightdata) * 1.2])
                            .range([0, 200]);

                        let yScale1 = d3.scaleLinear()
                            .domain([d3.max(flightdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar1y = d3.axisLeft().scale(yScale1);
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

                        let depScale = d3.scaleLinear()
                            .domain([0, d3.max(depdata) * 1.2])
                            .range([0, 200]);
                        let yScale2 = d3.scaleLinear()
                            .domain([d3.max(depdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar2y = d3.axisLeft().scale(yScale2);
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

                        let arrScale = d3.scaleLinear()
                            .domain([0, d3.max(arrdata) * 1.2])
                            .range([0, 200]);
                        let yScale3 = d3.scaleLinear()
                            .domain([d3.max(arrdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar3y = d3.axisLeft().scale(yScale3);
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

                        let flightDataScale = d3.scaleLinear()
                            .domain([0, d3.max(flightdata) * 1.2])
                            .range([0, 200]);

                        let yScale4 = d3.scaleLinear()
                            .domain([d3.max(flightdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar4y = d3.axisLeft().scale(yScale4);
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

                        let depScale = d3.scaleLinear()
                            .domain([0, d3.max(depdata) * 1.2])
                            .range([0, 200]);
                        let yScale5 = d3.scaleLinear()
                            .domain([d3.max(depdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar5y = d3.axisLeft().scale(yScale5);
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

                        let arrScale = d3.scaleLinear()
                            .domain([0, d3.max(arrdata) * 1.2])
                            .range([0, 200]);
                        let yScale6 = d3.scaleLinear()
                            .domain([d3.max(arrdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar6y = d3.axisLeft().scale(yScale6);
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

                        let flightDataScale = d3.scaleLinear()
                            .domain([0, d3.max(flightdata) * 1.2])
                            .range([0, 200]);
                        let yScale7 = d3.scaleLinear()
                            .domain([d3.max(flightdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar7y = d3.axisLeft().scale(yScale7);
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

                        let depScale = d3.scaleLinear()
                            .domain([0, d3.max(depdata) * 1.2])
                            .range([0, 200]);
                        let yScale8 = d3.scaleLinear()
                            .domain([d3.max(depdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar8y = d3.axisLeft().scale(yScale8);
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

                        let arrScale = d3.scaleLinear()
                            .domain([0, d3.max(arrdata) * 1.2])
                            .range([0, 200]);
                        let yScale9 = d3.scaleLinear()
                            .domain([d3.max(arrdata) * 1.2, 0])
                            .range([0, 200]);

                        var bar9y = d3.axisLeft().scale(yScale9);
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

    updateSpots(x) {
        //remove class for all the spots
        d3.select("#spots").selectAll("circle")
            .attr("class", "spot");

        //set class for the selected spots
        x.attr("class", "clicked");
    }
    updateLine(d, projection, airportsmap) {

        d3.select("#routes").remove();

        let routesGroup = d3.select("#usmap").append("g")
            .attr("id", "routes");

        d3.csv("dataset/airportconnection.csv", function (connections) {
            let airportconnection = connections.filter(function (c) {
                return c.ORIGIN == d.iata_code;
            });

            let routes = routesGroup.selectAll("line")
                .data(airportconnection);
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
    }

    updateCard(d) {
        let card = d3.select("#paneldiv")
            .attr("class", "col-xl-3 card panelafter")
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

        //remove all the elements first
        d3.select("#piechart").selectAll("g").remove();

        //fetch the corresponding data from Summary.csv regarding the iata_code
        d3.csv("dataset/Summary.csv", function (summary) {

            let data = null;
            for (let i = 0; i < summary.length; i++) {
                if (d.iata_code == summary[i].Origin) {
                    data = summary[i];
                    break;
                }
            }

            if (data == null) {
                return;
            }
            let dataset = [
                {legend: "Carrier Delay", value: data["PercentCarrierDly"]},
                {legend: "Weather Delay", value: data["PercentWeatherDly"]},
                {legend: "NASA Delay", value: data["PercentNASDly"]},
                {legend: "Security Delay", value: data["PercentSecurityDly"]},
                {legend: "Late Aircraft Delay", value: data["PercentLateAircraftDly"]}
            ];

            //define width, height and color scale
            // let width = document.getElementById("piediv").offsetWidth + 30;
            // let height = document.getElementById("paneldiv").offsetHeight - document.getElementById("carddiv").offsetHeight;

            let width = 400;
            let height = 240;

            let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(Array.from(dataset, function (d) {
                    return d.legend
                }));

            //Set piechart to be responsive
            let piechart = d3.select("#piechart")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox","0 0 "+width+" "+height);

            //draw pie chart
            let chartgroup = piechart.append("g")
                .attr("transform", "translate(100, 120)");

            let arc = d3.arc()
                .outerRadius(80)
                .innerRadius(60);

            let pie = d3.pie()
                .sort(null)
                .value(function (d) {
                    return d.value;
                });

            let groups = chartgroup.selectAll("g")
                .data(pie(dataset))
                .enter()
                .append("g");

            groups.append("path")
                .attr("d", arc)
                .attr("stroke", "#FFFFFF")
                .attr("fill", function (d) {
                    return colorScale(d.data.legend);
                });

            //draw legend
            let legendgroup = piechart.append("g")
                .attr("transform", "translate(220, 70)");

            let legendOrdinal = d3.legendColor()
                .shape("path", d3.symbol().type(d3.symbolSquare).size(100)())
                .shapePadding(7)
                .scale(colorScale);

            legendgroup.call(legendOrdinal);

            // // add label to pie chart
            // let arc2 = d3.arc()
            //     .outerRadius(90)
            //     .innerRadius(90)
            //
            // function midAngle(d) {
            //     return d.startAngle + (d.endAngle - d.startAngle) / 2;
            // }
            //
            // groups.append("text")
            //     .text(function(d) {
            //         return d.data.legend;
            //         // return parseFloat(d.data.value * 100).toFixed(2) + "%";
            //     })
            //     .attr("transform", function(d) {
            //         let pos = arc2.centroid(d);
            //         return "translate(" + pos + ")";
            //     })
            //     .style("text-anchor", function(d) {
            //         return (midAngle(d)) < Math.PI ? "start" : "end";
            //     })
            //     .attr("class", "pietext")
        });
    }

    updateTop10(){
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
    }
}
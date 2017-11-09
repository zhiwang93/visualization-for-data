class Usmap{

    constructor(airports){
        this.airports = airports;
        this.airportsmap = {};
        for(let i = 0; i < airports.length; i++)
            this.airportsmap[airports[i].iata_code] = airports[i];
        console.log(this.airportsmap);
        this.mapWidth = 1366;
        this.mapHeight = 768;

        this.projection = d3.geo.albersUsa()
            .translate([this.mapWidth/2, this.mapHeight/2])
            .scale([1500]);
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

    update1(){
        let airports = this.airports;
        let airportsmap = this.airportsmap;
        let projection = this.projection;
        d3.select("#usmap").select("#spots").remove();
        d3.select("#usmap").selectAll("line").remove();

        for(let i = 0; i < airports.length; i++){
            if(projection([airports[i].lon, airports[i].lat]) == null){
                airports.splice(i, 1);
                i--;
            }
        }

        let g2 = d3.select("#usmap").append("g")
            .attr("id", "spots");

        let spots = g2.selectAll("circle").data(airports);
        spots.enter().append("circle")
            .attr("cx", function (d) {return projection([d.lon, d.lat])[0];})
            .attr("cy", function (d) {return projection([d.lon, d.lat])[1];})
            .attr("r", function(d){
                if(d.type == "small_airport") return 1;
                else if(d.type == "medium_airport") return 4;
                else if(d.type == "large_airport") return 8;
                else return 0;
            })
            .attr("class", "spot");

        // let barChart1 = d3.select("#map").append("svg")
        //     .attr("width", 300)
        //     .attr("height", 220)
        //     .attr("id", "top10");
        // barChart1.append("text").text("TOP 10 busiest airports")
        //     .attr("x", 20)
        //     .attr("y", 20);
        //
        // let g5 = barChart1.append("g");
        // g5.selectAll("rect").data(airports.slice(0,10))
        //     .enter().append("rect")
        //     .attr("x", 20)
        //     .attr("y", function(d, i){return i*20 + 40;})
        //     .attr("width", function(d){return d.flightcount/150;})
        //     .attr("height", 20)
        //     .attr("opacity", function(d){return d.flightcount/25000})
        //     .attr("class", "bar1");
        // g5.selectAll("text").data(airports.slice(0, 10))
        //     .enter().append("text")
        //     .attr("x", 20)
        //     .attr("y", function(d, i){return i*20 + 56;})
        //     .text(function(d){return d.IATA});
        // let g6 = barChart1.append("g");
        // g6.selectAll("text").data(airports.slice(0, 10))
        //     .enter().append("text")
        //     .attr("x", function(d){return d.flightcount/150 + 20;})
        //     .attr("y", function(d, i){return i*20 + 56;})
        //     .text(function(d){return d.flightcount;});
        //
        // let weekChart = d3.select("#map").append("svg")
        //     .attr("width", 160)
        //     .attr("height", 600)
        //     .attr("id", "week")
        //     .attr("transform", "translate(0, 0) scale(1,-1)");
        // let MonthChart = d3.select("#map").append("svg")
        //     .attr("width", 260)
        //     .attr("height", 600)
        //     .attr("id", "month");
        // let HourChart = d3.select("#map").append("svg")
        //     .attr("width", 400)
        //     .attr("height", 500)
        //     .attr("id", "hour");

        spots.on("click", function(d){
            g2.selectAll("text").remove();
            g2.selectAll("line").remove();
            let names = g2.append("text")
                .text(function(){return d.name;})
                .attr("x", 20)
                .attr("y", 30)
                .attr("class","airportname");

            d3.csv("dataset/airportconnection.csv", function(connections){
                let airportconnection = connections.filter(function(c){
                     return c.ORIGIN == d.iata_code;
                });
                console.log(airportconnection);

                let routes = g2.selectAll("line").data(airportconnection);
                routes.enter().append("line")
                    .attr("x1", function () {return projection([d.lon, d.lat])[0];})
                    .attr("y1", function () {return projection([d.lon, d.lat])[1];})
                    .attr("x2", function(a) {
                        var dest = airportsmap[a.DEST];
                        return projection([dest.lon, dest.lat])[0];})
                    .attr("y2", function(a) {
                        var dest = airportsmap[a.DEST];
                        return projection([dest.lon, dest.lat])[1];})
                    .attr("class", "route");
           });
            //
            // let week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            // let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            // let hour = ["00", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
            // weekChart.selectAll("rect").remove();
            // MonthChart.selectAll("rect").remove();
            // HourChart.selectAll("rect").remove();
            //
            // for(let i = 0; i < week.length; i++){
            //     d3.csv("dataset/" + week[i] + ".csv", function(data){
            //         for(let j = 0; j < data.length; j++){
            //             if(d.IATA == data[j].Origin){
            //                 weekChart.append("rect")
            //                     .attr("x", i*20 + 10)
            //                     .attr("y",20)
            //                     .attr("width", 20)
            //                     .attr("height", data[j].FlightCount/100)
            //                     .attr("class", "bar1");
            //             }
            //         }
            //     });
            // }
            //
            // for(let i = 0; i < month.length; i++){
            //     d3.csv("dataset/" + month[i] + ".csv", function(data){
            //         for(let j = 0; j < data.length; j++){
            //             if(d.IATA == data[j].Origin){
            //                 MonthChart.append("rect")
            //                     .attr("x", i*20 + 10)
            //                     .attr("y",20)
            //                     .attr("width", 20)
            //                     .attr("height", data[j].FlightCount/100)
            //                     .attr("class", "bar1");
            //             }
            //         }
            //     });
            // }
            //
            // for(let i = 0; i < hour.length; i++){
            //     d3.csv("dataset/" + hour[i] + ".csv", function(data){
            //         for(let j = 0; j < data.length; j++){
            //             if(d.IATA == data[j].Origin){
            //                 HourChart.append("rect")
            //                     .attr("x", i*20 + 10)
            //                     .attr("y",20)
            //                     .attr("width", 20)
            //                     .attr("height", data[j].FlightCount/100)
            //                     .attr("class", "bar1");
            //             }
            //         }
            //     });
            // }


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
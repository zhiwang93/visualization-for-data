class Usmap{

    constructor(airports){
        this.airports = airports;
    }

    update1(){
        let airports = this.airports;


        d3.select("#map").selectAll("svg").remove();

        let width = 960;
        let height = 600;

        let projection = d3.geo.albersUsa()
            .translate([width/2, height/2])
            .scale([1000]);

        let path = d3.geo.path()
            .projection(projection);

        let svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        let g1 = svg.append("g");

        d3.json("dataset/us-states.json", function(json) {

            g1.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", "steelBlue")
                .style("opacity", 0.2);

            });
        let g2 = svg.append("g");

        airports.sort(function(a, b){
            return b.flightcount - a.flightcount;
        });

        let locations = g2.selectAll("circle").data(airports);
        locations.enter().append("circle")
            .attr("cx", function (d) {return projection([d.lon, d.lat])[0];})
            .attr("cy", function (d) {return projection([d.lon, d.lat])[1];})
            .attr("r", 4)
            .attr("class", "spot");

        locations.on("click", function(d){
            g2.selectAll("text").remove();
            g2.selectAll("line").remove();
            g2.append("text")
                .text(function(){return d.name;})
                .attr("x", 20)
                .attr("y", 30)
                .attr("class","airportname");

            d3.csv("dataset/airportconnection.csv", function(connections){
                let airportconnection = connections.filter(function(c){
                    return c.ORIGIN == d.IATA;
                });
                let routes = [];
                for(let i = 0; i < airportconnection.length; i++){
                    let dest = airports.filter(function(a){
                        return a.IATA == airportconnection[i].DEST;
                    })
                    if(dest.length > 0) routes.push(projection([dest[0].lon, dest[0].lat]));
                }
                g2.selectAll("line").data(routes).enter().append("line")
                    .attr("x1", function () {return projection([d.lon, d.lat])[0];})
                    .attr("y1", function () {return projection([d.lon, d.lat])[1];})
                    .attr("x2", function(a) {return a[0];})
                    .attr("y2", function(a) {return a[1];})
                    .style("stroke", "green")
                    .style("stroke-width", 2)
                    .attr("opacity", 0.3);
            });
        });
        //
        // let g4 = svg.append("g").attr("class", "hovered");
        // locations.on("mouseover", function(d){
        //     g4.append("text")
        //         .text(function(){return d.name;})
        //         .attr("x", function () {return projection([d.lon, d.lat])[0];})
        //         .attr("y", function () {return projection([d.lon, d.lat])[1] + 20;});
        //
        //     d3.csv("dataset/airportconnection.csv", function(connections){
        //         let airportconnection = connections.filter(function(c){
        //             return c.ORIGIN == d.IATA;
        //         });
        //         let routes = [];
        //         for(let i = 0; i < airportconnection.length; i++){
        //             let dest = airports.filter(function(a){
        //                 return a.IATA == airportconnection[i].DEST;
        //             })
        //             if(dest.length > 0) routes.push(projection([dest[0].lon, dest[0].lat]));
        //         }
        //         g4.selectAll("line").data(routes).enter().append("line")
        //             .attr("x1", function () {return projection([d.lon, d.lat])[0];})
        //             .attr("y1", function () {return projection([d.lon, d.lat])[1];})
        //             .attr("x2", function(a) {return a[0];})
        //             .attr("y2", function(a) {return a[1];})
        //             .style("stroke", "darkBlue")
        //             .style("stroke-width", 2)
        //             .attr("opacity", 0.3);
        //     });
        // });
        // locations.on("mouseout", function(){
        //     g4.selectAll("text").remove();
        //     g4.selectAll("line").remove();
        // });
        //
        let barChart1 = d3.select("#map").append("svg")
            .attr("width", 300)
            .attr("height", 550)
            .attr("id", "top10");
        barChart1.append("text").text("TOP 10 busiest airports")
            .attr("x", 20)
            .attr("y", 20);

        let g5 = barChart1.append("g");
        g5.selectAll("rect").data(airports.slice(0,10))
            .enter().append("rect")
            .attr("x", 20)
            .attr("y", function(d, i){return i*20 + 40;})
            .attr("width", function(d){return d.flightcount/150;})
            .attr("height", 20)
            .attr("opacity", function(d){return d.flightcount/25000})
            .attr("class", "bar1");
        g5.selectAll("text").data(airports.slice(0, 10))
            .enter().append("text")
            .attr("x", 20)
            .attr("y", function(d, i){return i*20 + 56;})
            .text(function(d){return d.IATA});
        let g6 = barChart1.append("g");
        g6.selectAll("text").data(airports.slice(0, 10))
            .enter().append("text")
            .attr("x", function(d){return d.flightcount/150 + 20;})
            .attr("y", function(d, i){return i*20 + 56;})
            .text(function(d){return d.flightcount;});

    }
}
class Stats {

    constructor() {
        this.hasContainer = {value: false};
    }

    updateStats(d) {

        let width = 400;
        let height = 200;

        let hasContainer = this.hasContainer;

        let updateDepBarChart = this.updateDepBarChart;
        let updateArrBarChart = this.updateArrBarChart;
        let updateLineChart = this.updateLineChart;
        let updateAreaChart = this.updateAreaChart;

        let removeContainer = this.removeContainer;
        let appendContainer = this.appendContainer;

        d3.csv("dataset/stats/"+d.iata_code+".csv", function (error, data) {

            if (error) {
                removeContainer();
                hasContainer.value = false;
                return;
            }

            if (!hasContainer.value) {
                appendContainer();
                hasContainer.value = true;
            }

            let monthData = [];
            let dayData = [];
            let hourData = [];
            for (let datum of data) {
                if (datum.Type == 'm')
                    monthData.push(datum)
                else if (datum.Type == 'd')
                    dayData.push(datum)
                else if (datum.Type == 'h')
                    hourData.push(datum)
            }

            let countScale = d3.scaleLinear()
                .domain([d3.max(monthData.map(function (obj) {
                    return obj.Count;
                })) * 1.5, 0])
                .range([0, height*0.8])

            let depDelayScale = d3.scaleLinear()
                .domain([d3.max(monthData.map(function (obj) {
                    return obj.DepDelay;
                })), d3.min(monthData.map(function (obj) {
                    return obj.DepDelay;
                }))])
                .range([0, height*0.8])

            let arrDelayScale = d3.scaleLinear()
                .domain([d3.max(monthData.map(function (obj) {
                    return obj.ArrDelay;
                })), d3.min(monthData.map(function (obj) {
                    return obj.ArrDelay;
                }))])
                .range([0, height*0.8])

            updateDepBarChart("month1", monthData);
            updateDepBarChart("day1", dayData);
            updateDepBarChart("hour1", hourData);

            updateArrBarChart("month2", monthData);
            updateArrBarChart("day2", dayData);
            updateArrBarChart("hour2", hourData);

            updateLineChart("month3", monthData);
            updateLineChart("day3", dayData);
            updateLineChart("hour3", hourData);

            updateAreaChart("month4", monthData);
            updateAreaChart("day4", dayData);
            updateAreaChart("hour4", hourData);
        });
    }

    appendContainer() {
        for (let row of ["month", "day", "hour"]) {
            let rowdiv = d3.select("#"+row);
            for (let i = 1; i <= 4; i++) {
                let div = rowdiv.append("div")
                    .attr("class", "col-xl-3");
                let svg = div.append("svg")
                    .attr("id", row+i)
                svg.append("g").attr("id", row+i+"x")
                svg.append("g").attr("id", row+i+"y")
                let temp = svg.append("g").attr("id", row+i+"z")
                if (i == 1 || i == 2) {
                    temp.append("g").attr("id", row+i+"z1")
                    temp.append("g").attr("id", row+i+"z2")
                }
            }
        }
    }

    removeContainer() {
        for (let row of ["month", "day", "hour"]) {
            d3.select("#"+row).selectAll("div").remove();
        }
    }

    setHasContainer(has) {
        this.hasContainer.value = has;
    }

    updateDepBarChart(name, data) {

        let width = 400;
        let height = 200;

        let xScale = d3.scaleBand()
            .domain(data.map(function (obj) {
                return obj.Time;
            }))
            .range([0, width*0.8])
        let xAxis = d3.axisBottom()
            .scale(xScale)

        let limit = d3.max(data.map(function (obj) {
            return parseInt(obj.Count);
        })) * 1.2;
        let yScale = d3.scaleLinear()
            .domain([limit, 0])
            .range([0, height*0.8])
        let yAxis = d3.axisLeft()
            .scale(yScale)

        //Set chart to be responsive
        d3.select("#"+name)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox","0 0 "+width+" "+height);

        //draw xAxis
        let x = d3.select("#"+name+"x")
            .attr("transform", "translate("+width*0.1+", "+height*0.9+")")
            .transition()
            .duration(1000)
            .call(xAxis);

        //draw yAxis
        d3.select("#"+name+"y")
            .attr("transform", "translate("+width*0.1+", "+height*0.1+")")
            .transition()
            .duration(1000)
            .call(yAxis);

        //draw bar chart1
        let barsgroup = d3.select("#"+name+"z1")
            .attr("transform", "translate("+(width*0.1+width*0.05/data.length)+", "+height*0.9+") scale(1,-1)");

        let bars = barsgroup.selectAll("rect")
            .data(data)
        bars.exit().remove();
        bars = bars.enter().append("rect").merge(bars)
            .attr("x", d => xScale(d.Time))
            .transition()
            .duration(1000)
            .attr("y", 0)
            .attr("width", width * 0.7 / data.length)
            .attr("height", d => (height*0.8 - yScale(parseInt(d.Count))))
            .attr("class", "bar1")

        //draw bar chart2
        let barsgroup2 = d3.select("#"+name+"z2")
            .attr("transform", "translate("+(width*0.1+width*0.05/data.length)+", "+height*0.9+") scale(1,-1)");

        let bars2 = barsgroup2.selectAll("rect")
            .data(data)
        bars2.exit().remove();
        bars2 = bars2.enter().append("rect").merge(bars2)
            .attr("x", d => xScale(d.Time))
            .transition()
            .duration(1000)
            .attr("y", 0)
            .attr("width", width * 0.7 / data.length)
            .attr("height", d => height*0.8 - yScale(parseInt(d.Count) * parseFloat(d["15minDepDelay"])))
            .attr("class", "bar2")
    }

    updateArrBarChart(name, data) {

        let width = 400;
        let height = 200;

        let xScale = d3.scaleBand()
            .domain(data.map(function (obj) {
                return obj.Time;
            }))
            .range([0, width*0.8])
        let xAxis = d3.axisBottom()
            .scale(xScale)

        let limit = d3.max(data.map(function (obj) {
            return parseInt(obj.Count2);
        })) * 1.2;
        let yScale = d3.scaleLinear()
            .domain([limit, 0])
            .range([0, height*0.8])
        let yAxis = d3.axisLeft()
            .scale(yScale)

        //Set chart to be responsive
        d3.select("#"+name)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox","0 0 "+width+" "+height);

        //draw xAxis
        let x = d3.select("#"+name+"x")
            .attr("transform", "translate("+width*0.1+", "+height*0.9+")")
            .transition()
            .duration(1000)
            .call(xAxis);

        //draw yAxis
        d3.select("#"+name+"y")
            .attr("transform", "translate("+width*0.1+", "+height*0.1+")")
            .transition()
            .duration(1000)
            .call(yAxis);

        //draw bar chart1
        let barsgroup = d3.select("#"+name+"z1")
            .attr("transform", "translate("+(width*0.1+width*0.05/data.length)+", "+height*0.9+") scale(1,-1)");

        let bars = barsgroup.selectAll("rect")
            .data(data)
        bars.exit().remove();
        bars = bars.enter().append("rect").merge(bars)
            .attr("x", d => xScale(d.Time))
            .transition()
            .duration(1000)
            .attr("y", 0)
            .attr("width", width * 0.7 / data.length)
            .attr("height", d => (height*0.8 - yScale(parseInt(d.Count2))))
            .attr("class", "bar1")

        //draw bar chart2
        let barsgroup2 = d3.select("#"+name+"z2")
            .attr("transform", "translate("+(width*0.1+width*0.05/data.length)+", "+height*0.9+") scale(1,-1)");

        let bars2 = barsgroup2.selectAll("rect")
            .data(data)
        bars2.exit().remove();
        bars2 = bars2.enter().append("rect").merge(bars2)
            .attr("x", d => xScale(d.Time))
            .transition()
            .duration(1000)
            .attr("y", 0)
            .attr("width", width * 0.7 / data.length)
            .attr("height", d => height*0.8 - yScale(parseInt(d.Count2) * parseFloat(d["15minArrDelay"])))
            .attr("class", "bar2")
    }

    updateLineChart(name, data) {

        let width = 400;
        let height = 200;

        let xScale = d3.scaleBand()
            .domain(data.map(function (obj) {
                return obj.Time;
            }))
            .range([0, width*0.8])
        let xAxis = d3.axisBottom()
            .scale(xScale)

        let limit = 20;

        let yScale = d3.scaleLinear()
            .domain([limit, -limit])
            .range([0, height*0.8])
        let yAxis = d3.axisLeft()
            .scale(yScale)

        //Set chart to be responsive
        d3.select("#"+name)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox","0 0 "+width+" "+height);

        //draw xAxis
        d3.select("#"+name+"x")
            .attr("transform", "translate("+width*0.1+", "+height*0.5+")")
            .transition()
            .duration(1000)
            .call(xAxis);

        //draw yAxis
        d3.select("#"+name+"y")
            .attr("transform", "translate("+width*0.1+", "+height*0.1+")")
            .transition()
            .duration(1000)
            .call(yAxis);

        //setup line chart
        let linesgroup = d3.select("#"+name+"z")
            .attr("transform", "translate("+(width*0.1+width*0.4/data.length)+", "+height*0.9+") scale(1,-1)");

        let depGenerator = d3.line()
            .x(d => xScale(d.Time))
            .y(d => yScale(d.DepDelay));
        depGenerator = depGenerator(data);

        let arrGenerator = d3.line()
            .x(d => xScale(d.Time))
            .y(d => yScale(d.ArrDelay));
        arrGenerator = arrGenerator(data);

        let generator = [{name: "DepDelayTime", value: depGenerator},
                         {name: "ArrDelayTime", value: arrGenerator}];

        //draw line
        let depPath = linesgroup.selectAll("path")
            .data(generator);
        depPath.exit().remove();
        depPath = depPath.enter().append("path").merge(depPath)
            .attr("fill", "none")
            .attr("class", d => d.name)
            .transition()
            .duration(1000)
            .attr("d", d => d.value);
    }
    updateAreaChart(name, data){
        console.log(name);
        console.log(data);

        let width = 400;
        let height = 200;

        let xScale = d3.scaleBand()
            .domain(data.map(function (obj) {
                return obj.Time;
            }))
            .range([0, width*0.8]);

        let xAxis = d3.axisBottom()
            .scale(xScale);

        let limit = d3.max(data.map(function (obj) {
            return parseFloat(obj.CarrierDelay) +
                parseFloat(obj.WeatherDelay) +
                parseFloat(obj.NASDelay) +
                parseFloat(obj.SecurityDelay) +
                parseFloat(obj.LateAircraftDelay);
        }));

        let yScale = d3.scaleLinear()
            .domain([0.0, limit])
            .range([height*0.8, 0.0])
        let yAxis = d3.axisLeft()
            .scale(yScale);

        //Set chart to be responsive
        d3.select("#"+name)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox","0 0 "+width+" "+height);

        //draw xAxis
        d3.select("#"+name+"x")
            .attr("transform", "translate("+width*0.1+", "+height*0.9+")")
            .transition()
            .duration(1000)
            .call(xAxis);

        //draw yAxis
        d3.select("#"+name+"y")
            .attr("transform", "translate("+width*0.1+", "+height*0.1+")")
            .transition()
            .duration(1000)
            .call(yAxis);

        var area = d3.area()
            .x(function(d) { return xScale(d.data.Time); })
            .y0(function(d) { return yScale(d[0]); })
            .y1(function(d) { return yScale(d[1]); });

        let areasgroup = d3.select("#"+name+"z")
            .attr("transform", "translate("+(width*0.1+width*0.4/data.length)+", "+height*0.1+") scale(1,1)");

        var keys = ["CarrierDelay",
            "WeatherDelay",
            "NASDelay",
            "SecurityDelay",
            "LateAircraftDelay"];
        var stack = d3.stack();
        var z = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);
        stack.keys(keys);

        let areaPath = areasgroup.selectAll("path")
            .data(stack(data));
        areaPath.exit().remove();
        areaPath = areaPath.enter().append("path").merge(areaPath)
            .style("fill", function(d) { return z(d.key); })
            .transition()
            .duration(1000)
            .attr("d", area);
    }
}
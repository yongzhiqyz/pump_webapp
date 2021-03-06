function plotPressureHist() {
    d3.select("#dynamic-table-summary").selectAll("*").remove()
    d3.select("#summary-canvas").selectAll("*").remove()
    var pressure = nodes.map(function(d) { return d.pressure; });
    histogram("#summary-canvas", pressure, "Pressure", pressureScale);
}

function plotFlowHist() {
    d3.select("#dynamic-table-summary").selectAll("*").remove()
    d3.select("#summary-canvas").selectAll("*").remove()
    var flow = edges.map(function(d) { return d.flow; });
    histogram("#summary-canvas", flow, "Flow");
}

function plotGapHist() {
    d3.select("#dynamic-table-summary").selectAll("*").remove()
    d3.select("#summary-canvas").selectAll("*").remove()
    plot_iter("#summary-canvas", gapHistory, "Gap");
}

function plotEnergyLossHist() {
    d3.select("#dynamic-table-summary").selectAll("*").remove()
    d3.select("#summary-canvas").selectAll("*").remove()
    plot_iter("#summary-canvas", energyHistory, "Energy Loss");
}

function plotEnergyPumpHist() {
    d3.select("#dynamic-table-summary").selectAll("*").remove()
    d3.select("#summary-canvas").selectAll("*").remove()
    plot_iter("#summary-canvas", pumpEnergyHistory, "Pump Energy");
}

var linspace = function(start, stop, nsteps) {
    delta = (stop - start) / (nsteps - 1)
    return d3.range(nsteps).map(function(i) { return start + i * delta; });
}

// ========== Plot type ========== //
function histogram(canvas, values, title, color = null) {
    var margin = {
        top: 20,
        right: 30,
        bottom: 20,
        left: 10
    };

    var width = 350 - margin.left - margin.right
    height = 250 - margin.top - margin.bottom;

    var xMax = d3.max(values);
    var xMin = d3.min(values);

    if (xMin == 0 && xMax == 0) {
        xMin = 0;
        xMax = 10;
    }

    var x = d3.scale.linear()
        .domain([xMin, xMax])
        .range([0, width]);

    var formatCount = d3.format(",0f");

    var data = d3.layout.histogram()
        .bins(x.ticks(20))
        (values);

    var yMax = d3.max(data, function(d) { return d.length });

    var yMin = d3.min(data, function(d) { return d.length });

    var colorScale = d3.scale.linear()
        .domain([yMin, yMax])
        .interpolate(d3.interpolateHcl)
        .range(["#42a1f4", "#2d73af"]);

    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var svg = d3.select(canvas)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    if (color != null) {
        bar.append("rect")
            .attr("x", 1)
            .attr("width", (x(data[0].dx) - x(0)) - 1)
            .attr("height", function(d) { return height - y(d.y); })
            .attr("fill", function(d) { return color(d.x) });
    } else {
        bar.append("rect")
            .attr("x", 1)
            .attr("width", (x(data[0].dx) - x(0)) - 1)
            .attr("height", function(d) { return height - y(d.y); })
            .attr("fill", function(d) { return colorScale(d.y) });
    }

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -12)
        .attr("x", (x(data[0].dx) - x(0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.y); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
}

function plot_iter(canvas, y, title) {
    var margin = {
        top: 20,
        right: 30,
        bottom: 20,
        left: 50
    };

    var width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom,
        padding = 100;

    var svg = d3.select(canvas)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yScale = d3.scale.linear().range([height, 0]);

    var xScale = d3.scale.linear().range([0, width]);

    var xMax = Math.ceil(y.length / 10) * 10;
    var yMax = d3.max(y)

    if (y.length == 0) {
        xMax = 10;
        yMax = 100;
    }

    var data = d3.zip(d3.range(1, y.length + 1), y);

    // define the y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(10);

    // define the y axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    yScale.domain([0, yMax]);
    xScale.domain([1, xMax]);

    var area = d3.svg.area()
        .x(function(d) { return xScale(d[0]); })
        .y0(yScale(0))
        .y1(function(d) { return yScale(d[1]); });

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return xScale(d[0]); })
        .y(function(d) { return yScale(d[1]); });

    svg.append("path")
        .attr("d", valueline(data))
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("dy", "-0.71em")
        .attr("x", width)
        .style("text-anchor", "end")
        .text("Iteration");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(title);

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) { return xScale(d[0]); })
        .attr("cy", function(d) { return yScale(d[1]); })
        .attr("fill", "steelblue");

    $(canvas + ' circle').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
            var d = this.__data__;
            return d[1].toFixed(2);
        }
    });
}

function plot_area(canvas, x, y, sub_x = null, sub_y = null, title) {
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };

    var width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom,
        padding = 100;

    var svg = d3.select(canvas)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yScale = d3.scale.linear().range([height, 0]);

    var xScale = d3.scale.linear().range([0, width]);

    var max_iter = Math.ceil(y.length / 10) * 10;

    var data = d3.zip(x, y);

    // define the y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(10);

    // define the y axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    yScale.domain([0, d3.max(y)]);
    xScale.domain([0, d3.max(x)]);

    var area = d3.svg.area()
        .x(function(d) { return xScale(d[0]); })
        .y0(yScale(0))
        .y1(function(d) { return yScale(d[1]); });

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return xScale(d[0]); })
        .y(function(d) { return yScale(d[1]); });

    svg.append("path")
        .datum(d3.zip(sub_x, sub_y))
        .attr("fill", "#ffc9d8")
        .attr("stroke-width", 0)
        .attr("d", area);

    svg.append("path")
        .attr("d", valueline(data))
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("dy", "-0.71em")
        .attr("x", width)
        .style("text-anchor", "end")
        .text("Flow");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(title);

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) { return xScale(d[0]); })
        .attr("cy", function(d) { return yScale(d[1]); })
        .attr("fill", "steelblue");

    $(canvas + ' circle').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
            var d = this.__data__;
            return d[1].toFixed(2);
        }
    });
}
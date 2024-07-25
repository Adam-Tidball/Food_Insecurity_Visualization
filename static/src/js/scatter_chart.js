
// Set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 40, left: 150},
    width = document.getElementById("line_chart").clientWidth - margin.left - margin.right,
    height = document.getElementById("line_chart").clientHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#line_chart")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Load data from a CSV file
d3.csv("/data/Health_Characteristics.csv").then(function(data) {       

    // Add X axis
    var x = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return +d.Year; }) - 0.25, d3.max(data, function(d) { return +d.Year; })]) // get the min and max of the year column
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")") // move the x axis to the bottom
        .call(d3.axisBottom(x).ticks(d3.max(data, function(d) { return +d.Year; }) - d3.min(data, function(d) { return +d.Year; })).tickFormat(d3.format("d")));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height + margin.top + 30)
        .text("Year");

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("y", margin.left+20)
        .attr("x", -margin.right - 10)
        .text("People (%)")


    // Color scale: based on health characteristics
    var color = d3.scaleOrdinal()
        .domain(Object.keys(data[0]).filter(function(key) {
            return key !== "Year" && key !== "Characteristics";
        }))
        .range(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#008000", "#800000", "#FFD700", "#008080", "#000000"]);


    // Filter data based on selected provinces
    let provinces_selected = [];
    provinces_selected.push("British Columbia"); //temp... use buttons
    var PovFilteredData = data.filter(function(d) {
        return provinces_selected.includes(d.Geography);
    });

    // Filter data based on selected health characteristics
    let characteristics_selected = [];
    characteristics_selected.push("Perceived health, very good or excellent"); //temp... use buttons
    characteristics_selected.push("Perceived health, fair or poor"); //temp... use buttons
    var filteredData = PovFilteredData.map(function(d) {
        var obj = {
            Geography: d.Geography,
            Year: d.Year,
            Characteristics: d.Characteristics
        };
        for (var i = 0; i < characteristics_selected.length; i++) {
            obj[characteristics_selected[i]] = d[characteristics_selected[i]];
        }
        return obj;
    });


    // Select Percent or Number of persons
    var data_type_selected = "Percent"; //temp... use buttons


    // Add dots for each health characteristic
    for (var i = 0; i < characteristics_selected.length; i++) {
        svg.append("g")
            .selectAll("dot")
            .data(filteredData.filter(function(d) {
                return d.Characteristics === data_type_selected;
            }))
            .enter()
            .append("circle")
            .attr("cx", function (d) { 
                return x(d.Year);
            })
            .attr("cy", function (d) { 
                return y(d[characteristics_selected[i]]);
            })
            .attr("r", 5)
            .style("fill", function (d) { 
                return color(characteristics_selected[i]);
            });
        }
    

    });



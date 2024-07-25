function updateChart(newData) {
    console.log(newData);
    console.log(newData['provinces']);
    console.log(newData['characteristics']);

    
    // Set the dimensions and margins of the graph
    var margin = ({top: 10, right: 30, bottom: 40, left: 150});
    const height = 250;
    const width = 800;

    // Update the SVG dimensions in case the container size has changed
    d3.select("#line_chart").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Ensure the 'g' element's transform is correct and not being re-applied accumulatively
    var g = d3.select("#line_chart").select("svg").select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Clear previous elements if necessary before redrawing
    g.selectAll("*").remove();

    

    // Load data from a CSV file
    d3.csv("/data/Health_Characteristics.csv").then(function(data) {       

        // Add X axis
        var x = d3.scaleLinear()
            .domain([d3.min(data, function(d) { return +d.Year; }) - 0.25, d3.max(data, function(d) { return +d.Year; })]) // get the min and max of the year column
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")") // move the x axis to the bottom
            .call(d3.axisBottom(x).ticks(d3.max(data, function(d) { return +d.Year; }) - d3.min(data, function(d) { return +d.Year; })).tickFormat(d3.format("d")));

        //Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 70])
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
        provinces_selected = newData['provinces']
        var PovFilteredData = data.filter(function(d) {
            return provinces_selected.includes(d.Geography);
        });

        // Filter data based on selected health characteristics
        let characteristics_selected = [];
        characteristics_selected = newData['characteristics']
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

        // filter data to average of all selected provinces
        /*var averageData = filteredData.map(function(d) {
            var obj = {
                Year: d.Year,
                Characteristics: d.Characteristics
            };
            
            
            for (var i = 0; i < characteristics_selected.length; i++) {
                
                var sum = 0;
                for (var j = 0; j < provinces_selected.length; j++) {
                    sum += d[characteristics_selected[i]];
                }
                sum = sum / provinces_selected.length;
                obj[characteristics_selected[i]] = sum;

            }
            return obj;
        });

        console.log(filteredData);
        console.log(averageData);*/
        // Filter data to average of all selected provinces
// Filter data to average of all selected provinces
var averageData = filteredData.reduce((acc, d) => {
    // Find if the year and characteristic type already exist in the accumulator
    let existing = acc.find(item => item.Year === d.Year && item.Characteristics === d.Characteristics);
    
    if (!existing) {
        existing = { Year: d.Year, Characteristics: d.Characteristics };
        // Initialize sums for each characteristic
        for (let i = 0; i < characteristics_selected.length; i++) {
            existing[characteristics_selected[i]] = 0;
        }
        existing.count = 0;  // To keep track of how many provinces are added
        acc.push(existing);
    }
    
    // Sum the values for each characteristic
    for (let i = 0; i < characteristics_selected.length; i++) {
        existing[characteristics_selected[i]] += parseFloat(d[characteristics_selected[i]].replace(/,/g, '')) || 0;
    }
    existing.count += 1;
    
    return acc;
}, []).map(d => {
    // Calculate the average for each characteristic
    for (let i = 0; i < characteristics_selected.length; i++) {
        d[characteristics_selected[i]] = d[characteristics_selected[i]] / d.count;
    }
    delete d.count;  // Remove the count property after averaging
    return d;
});

console.log(filteredData);
console.log(averageData);






        // Add dots for each health characteristic
        for (var i = 0; i < characteristics_selected.length; i++) {
            svg.append("g")
                .selectAll("dot")
                .data(averageData.filter(function(d) {
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
        
                // Connect dots with lines
    for (var i = 0; i < characteristics_selected.length; i++) {
        svg.append("path")
            .datum(filteredData.filter(function(d) {
                return d.Characteristics === data_type_selected;
            }))
            .attr("fill", "none")
            .attr("stroke", function (d) { 
                return color(characteristics_selected[i]);
            })
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.Year) })
                .y(function(d) { return y(d[characteristics_selected[i]]) })
            )
            .attr("opacity", 0.5);
        }

        });
    }      



////////////////////////////////////////////////////////////////
// Code for the first time the page is loaded

//updateChart({'provinces': ['British Columbia'], 'characteristics': ['Perceived health, very good or excellent', 'Perceived health, fair or poor']});



// Set the dimensions and margins of the graph
var margin = ({top: 10, right: 30, bottom: 40, left: 150});
const height = 250;
const width = 800;

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
        .domain([0, 70])
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
    

    // Connect dots with lines
    for (var i = 0; i < characteristics_selected.length; i++) {
        svg.append("path")
            .datum(filteredData.filter(function(d) {
                return d.Characteristics === data_type_selected;
            }))
            .attr("fill", "none")
            .attr("stroke", function (d) { 
                return color(characteristics_selected[i]);
            })
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.Year) })
                .y(function(d) { return y(d[characteristics_selected[i]]) })
            );
        }


    });



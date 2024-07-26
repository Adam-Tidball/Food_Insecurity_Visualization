
/// /// Initial SVG setup and values
// Set the dimensions and margins of the graph
var margin = ({top: 10, right: 30, bottom: 40, left: 150});
const height = 250;
const width = 800;
let rawData = await d3.csv("/data/Health_Characteristics.csv");


// append the svg object to the body of the page
var svg = d3.select("#line_chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// "export" (haha not actually, but basically) the function so you can use it in your html elements
window.updateLineChart = updateLineChart;


var x = d3.scaleLinear()
        .domain([2017.75, 2022]) // get the min and max of the year column
        .range([ 0, width ]);

var y = d3.scaleLinear()
    .domain([0, 70])
    .range([ height, 0]);

svg.append("g")
    .attr("transform", "translate(0," + height + ")") // move the x axis to the bottom
    .call(d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d3.format("d"))
    );

svg.append("g")
    .call(d3.axisLeft(y));


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

var color = d3.scaleOrdinal()
    .domain(Object.keys(rawData[0]).filter(function(key) {
        return key !== "Year" && key !== "Characteristics";
    }))
    .range(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#008000", "#800000", "#FFD700", "#008080", "#000000"]);


////// Main update Loop 
function updateLineChart(newData) {
    console.log(newData);
    console.log(newData['provinces']);
    console.log(newData['characteristics']);

    // Color scale: based on health characteristics
    var data_type_selected = "Percent"; //temp... use buttons

    // Filter data based on selected provinces
    let provinces_selected = newData["provinces"]
    var ProvFilteredData = rawData.filter(function(d) {
        return provinces_selected.includes(d.Geography);
    });

    // Filter data based on selected health characteristics
    let characteristics_selected = newData['characteristics']
    var filteredData = ProvFilteredData.map(function(d) {
        var obj = {
            Geography: d.Geography,
            Year: d.Year,
            Characteristics: d.Characteristics
        };
        for (var i = 0; i < characteristics_selected.length; i++) {
            obj[characteristics_selected[i]] = d[characteristics_selected[i]];
        }
        return obj;
    }).filter( d => {
        return d.Characteristics === data_type_selected;
    });

    console.log("filteredData", filteredData);
    // Select Percent or Number of persons

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
    })

    let finalFilteredData = characteristics_selected.map(char_sel => {
        var obj = {
            "characteristic": char_sel,
            2018: averageData[0][char_sel],
            2019: averageData[1][char_sel],  
            2020: averageData[2][char_sel], 
            2021: averageData[3][char_sel], 
            2022: averageData[4][char_sel], 
        }
        return obj;

    });
    // Add dots for each health characteristic
    svg.selectAll("#char_line_group")
        .data(finalFilteredData)
        .join(
            enter => {
                let g = enter.append("g")
                    .attr("id", "char_line_group")
                
                g.append("path")
                    .datum(d => d)
                    .attr("fill", "none")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(function(d) { return x(d.Year) })
                        .y(function(d) { return y(d[characteristics_selected[i]]) })
                    )
                    .attr("opacity", 0.3);
                // provinces_selected.forEach(province => {
                //     let path_datum = filteredData.filter( d => {
                //         return d.Geography === province
                //     })
                //     console.log("line_datum", path_datum)
                //     g.append("path")
                //         .datum(path_datum)
                //         .attr("fill", "none")
                //         .attr("stroke", function (d) { 
                //             return color(characteristics_selected[i]);
                //         })
                //         .attr("stroke-width", 1.5)
                //         .attr("d", d3.line()
                //             .x(function(d) { return x(d.Year) })
                //             .y(function(d) { return y(d[characteristics_selected[i]]) })
                //         )
                //         .attr("opacity", 0.3);;
                // });

                g.append("path")
                for (let year = 2018; year < 2023; year ++){
                    g.append("circle")
                    .attr("cx", d => x(year))
                    .attr("cy", d => y(d[year]))
                    .attr("r", 5)
                    .style("fill", d => color(d.characteristic))
                    .attr("id", "year"+ year);
                }


            },
            update => {
                let g = update;
                for (let year = 2018; year < 2023; year ++){
                    g.select("#year" + year)
                        .attr("cx", function (d) { 
                            return x(year);
                        })
                        .attr("cy", function (d) { 
                            return y(d[year]);
                        })
                        .attr("r", 5)
                        .style("fill", function (d) { 
                            return color(d.characteristic);
                        })
                }

            }, 
            exit => {
                let g = exit;
                exit.remove('*')
            }

        )
        
    
    
    // Connect dots with lines
    // Connect dots with lines
    // for (var i = 0; i < characteristics_selected.length; i++) {
    //     var filteredDataByCharacteristic = filteredData.filter(function(d) {
    //         return d.Characteristics === data_type_selected;
    //     });
         
    //     for (var j = 0; j < filteredDataByCharacteristic.length; j += 5) {
    //         var subset = filteredDataByCharacteristic.slice(j, j + 5);
    //         console.log(subset);
    //         svg.append("path")
    //             .datum(subset)
    //             .attr("fill", "none")
    //             .attr("stroke", function (d) { 
    //                 return color(characteristics_selected[i]);
    //             })
    //             .attr("stroke-width", 1.5)
    //             .attr("d", d3.line()
    //                 .x(function(d) { return x(d.Year) })
    //                 .y(function(d) { return y(d[characteristics_selected[i]]) })
    //             )
    //             .attr("opacity", 0.3);;
    //     }
    // }
}
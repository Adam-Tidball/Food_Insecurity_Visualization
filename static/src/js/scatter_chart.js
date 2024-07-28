
/// /// Initial SVG setup and values
// Set the dimensions and margins of the graph
var margin = ({top: 10, right: 30, bottom: 40, left: 150});
const height = 250;
const width = 800;
let rawData = await d3.csv("/data/Health_Characteristics.csv");

let starting_values = {
    "provinces": ["British Columbia", "Alberta"], 
    "characteristics": ["Diabetes"],
    "year": 2018
}

// append the svg object to the body of the page
var svg = d3.select("#line_chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");



// "export" (haha not actually, but basically) the function so you can use it in your html elements
window.updateLineChart = updateLineChart;


var x = d3.scaleLinear()
        .domain([2017.50, 2022.50]) // get the min and max of the year column
        .range([ 0, width ]);

var y = d3.scaleLinear()
    .domain([0, 70])
    .range([ height, 0]);

let cur_year_box_selected = 2018
for (let i = 0; i < 5; i++){
    svg.append("rect")
    .attr("id", "timeline_box" + (2018+i))
    .attr("x", (width/5) * i )
    .attr("y", 0)
    .attr("width", (width)/5 )
    .attr("height", height)
    .classed("fill-success", true)
    .style("opacity", 0 )
    .on("mouseover", d => {
        if ((2018 + i) != cur_year_box_selected){
            updateCircleChartYear(2018+i)
            svg.select("#timeline_box" + (2018+i))
                .style("opacity", 0.12)
            console.log("#timeline_box" + (cur_year_box_selected))
            svg.select("#timeline_box" + (cur_year_box_selected))
                .style("opacity", 0)
            cur_year_box_selected = (2018 + i)
        }
    })
}

svg.append("g")
    .attr("transform", "translate(0," + height + ")") // move the x axis to the bottom
    .call(d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d3.format("d"))
    );

svg.append("g")
    .call(d3.axisLeft(y));

// X axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width/2)
    .attr("y", height + margin.top + 30)
    .text("Year");

// Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", margin.top + 100)
    .attr("x", -margin.right - 10)
    .text("People (%)")


var colorMapping = {
    "Perceived Good Health": "#5C3E23",
    "Perceived Poor Health": "#2A3A92",
    "Percieved good mental health": "#02692B",
    "Percieved poor mental health": "#1388E7",
    "Obese": "#E00400",
    "Diabetes": "#A637F6",
    "High blood pressure": "#C72486",
    "Mood disorder": "#DD7703"
};

// 56a3a6-2d4739-e4572e-6b0f1a-f3a712

var color = function(characteristic) {
    return colorMapping[characteristic] || "#000000"; // Default to black if not found
};
/*var color = d3.scaleOrdinal()
    .domain(Object.keys(rawData[0]).filter(function(key) {
        return key !== "Year" && key !== "Characteristics";
    }))
    .range(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#008000", "#800000", "#FFD700", "#008080", "#000000"]);
*/


updateLineChart({"provinces": [], "characteristics": []})


function sanitizeId(id) {
    return id.replace(/\s+/g, '_');
}

////// Main update Loop 
function updateLineChart(newData) {
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
    console.log("finalFilteredData", finalFilteredData);
    // Add dots for each health characteristic
    svg.selectAll("#char_line_group")
        .data(finalFilteredData)
        .join(
            enter => {
                let g = enter.append("g")
                    .attr("id", "char_line_group")
                    .attr("onclick", d => {
                        return "updateCircleChartCharacteristic(" + "'" +  d.characteristic + "'" +  ")";
                    } )
                
                
                for (let year = 2018; year < 2023; year ++){
                    g.append("circle")
                        .attr("cx", d => x(year))
                        .attr("cy", d => y(d[year]))
                        .attr("r", 5)
                        .style("fill", d => color(d.characteristic))
                        .attr("id", "year"+ year)
                        .on("mouseover", function(d){
                            d3.select(this.parentNode)
                                .selectAll("line")
                                .style("opacity", 1)
                                .style("stroke-width", "3px")
                            let data = d3.select(this).datum();
                            d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "block");
                                
                        })
                        .on("mouseout", function(d){
                            d3.select(this.parentNode)
                                .selectAll("line")
                                .style("opacity", 0.3)
                                .style("stroke-width", "2px")
                            let data = d3.select(this).datum();
                            d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "none"); //make nnone
                        });
                        

                // Delete all province groups and lines
                g.selectAll("#province_group").selectAll("line").remove();
                g.selectAll("#province_group").remove();


                for (let province of provinces_selected){
                    let province_group = g.append("g")
                        .attr("id", "province_group")
                    for (let year = 2018; year < 2022; year ++){


                        // Add label at the end of the scatter line

                        var prov = provinces_selected[0];
                            g.append("text")
                                .attr("id", d => "text"+sanitizeId(d.characteristic))
                                .attr("x", x(2022) + 15) // Position the text to the right of the circle
                                .attr("y", d => {
                                    let dataForNextYear = filteredData.find(item => item.Geography === prov && item.Year == (2022));
                                    return y(dataForNextYear[d.characteristic]);
                                })
                                .text(d => d.characteristic)
                                .style("font-size", "13px")
                                .style("font-weight", "bold")
                                .style("fill", d => color(d.characteristic))
                                .style("display", "none")
                                .style("width", 20)
                                .style("word-wrap", "break-word");


                        province_group.append("line")
                            .attr("x1", x(year))
                            .attr("x2", x(year+1))
                            .attr("y1", d => {
                                let dataForYear = filteredData.find(item => item.Geography === province && item.Year == year);
                                return y(dataForYear[d.characteristic]);
                            })
                            .attr("y2", d => {
                                let dataForNextYear = filteredData.find(item => item.Geography === province && item.Year == (year + 1));
                                return y(dataForNextYear[d.characteristic]);
                            })
                            .style("stroke-width", "2px")
                            .style("stroke", d => color(d.characteristic))
                            .style("opacity", 0.3)
                            .attr("id", d => "line_year"+ sanitizeId(province) + year + sanitizeId(d.characteristic))
                            .on("mouseover", function(d){
                                d3.select(this.parentNode.parentNode)
                                    .selectAll("line")
                                    .style("opacity", 1)
                                    .style("stroke-width", "3px")
                                let data = d3.select(this).datum();
                                d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "block");
                                
                            })
                            .on("mouseout", function(d){
                                d3.select(this.parentNode.parentNode)
                                    .selectAll("line")
                                    .style("opacity", 0.3)
                                    .style("stroke-width", "2px")
                                let data = d3.select(this).datum();
                                d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "none"); //make nnone
                            });


                    }
                }
                                        
            }

            
                
  
            },
            update => {
                let g = update;
                g.attr("onclick", d => {
                    return "updateCircleChartCharacteristic(" + "'" +  d.characteristic + "'" +  ")";
                } )
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
                        .on("mouseover", function(d){
                            d3.select(this.parentNode)
                                .selectAll("line")
                                .style("opacity", 1)
                                .style("stroke-width", "3px")
                            let data = d3.select(this).datum();
                            d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "block");
                               
                        })
                        .on("mouseout", function(d){
                            d3.select(this.parentNode)
                                .selectAll("line")
                                .style("opacity", 0.3)
                                .style("stroke-width", "2px")
                            let data = d3.select(this).datum();
                            d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "none"); //make nnone
                           
                        });
                }
                // delete all lines
                g.selectAll("#province_group").selectAll("line").remove();
                g.selectAll("#province_group").remove();

                for (let province of provinces_selected){
                    let province_group = g.append("g")
                        .attr("id", "province_group")
                    for (let year = 2018; year < 2022; year ++){
                        
                        var prov = provinces_selected[0];
                        g.append("text")
                            .attr("id", d => "text"+sanitizeId(d.characteristic))
                            .attr("x", x(2022) + 15) // Position the text to the right of the circle
                            .attr("y", function(d) {
                                let dataForNextYear = filteredData.find(item => item.Geography === prov && item.Year == (2022));
                                return y(dataForNextYear[d.characteristic]);
                            })
                            .text(d => d.characteristic)
                            .style("font-size", "13px")
                            .style("font-weight", "bold")
                            .style("fill", function(d)
                            {
                                return color(d.characteristic);    
                            })
                            .style("display", "none")

                        province_group.append("line")
                            .data(finalFilteredData)//test
                            .attr("x1", function (d) {
                                return x(year);
                            })
                            .attr("x2", function (d) {
                                return x(year+1);
                            })
                            .attr("y1", function (d) { 
                                let dataForYear = filteredData.find(item => item.Geography === province && item.Year == year);
                                return y(dataForYear[d.characteristic]);
                            })
                            .attr("y2", function (d) {
                                let dataForNextYear = filteredData.find(item => item.Geography === province && item.Year == (year + 1));
                                return y(dataForNextYear[d.characteristic]);
                            })
                            .style("stroke-width", "2px")
                            .style("stroke", function (d) { 
                                return color(d.characteristic);
                            })
                            .style("opacity", function (d) {
                                return 0.3;
                            })
                            .attr("id", function (d) {
                                console.log(d);
                                return "line_year"+ sanitizeId(province) + year + sanitizeId(d.characteristic);
                            })
                            .on("mouseover", function(d){
                                d3.select(this.parentNode.parentNode).selectAll("line")
                                    //.selectAll("line")
                                    .style("opacity", 1)
                                    .style("stroke-width", "3px")
                                let data = d3.select(this).datum();
                                d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "block");
                            

                            })
                            .on("mouseout", function(d){
                                d3.select(this.parentNode.parentNode)
                                    .selectAll("line")
                                    .style("opacity", 0.3)
                                    .style("stroke-width", "2px")
                                let data = d3.select(this).datum();
                                d3.select(this.parentNode.parentNode).select("#text" + sanitizeId(data.characteristic)).style("display", "none"); //make nnone
                            });
                    }
                }
                

            }, 
            exit => {
                let g = exit;
                g.remove('*')
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
updateLineChart(starting_values);
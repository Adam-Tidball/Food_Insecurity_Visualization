import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// console.log(d3);
const rawData = await d3.csv("/data/Health_Characteristics.csv")

const margin = ({
    top: 20,
    right: 0,
    bottom: 10,
    left: 50
});
const height = 250
const width = 800 
let year = 2018
let rScale = d3.scaleLinear().domain([0, 7]).range([0, 20])
let xScale = d3.scaleLinear().domain([125, 155]).range([margin.left, width - margin.right])
let yScale = d3.scaleLinear().domain([5, 30]).range([height - margin.bottom, margin.top])


let svg = d3.select("#health_circle_chart")
    .classed("border", true)
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
;
const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
const yAxis = svg
    .append('g')
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
;
const circle_pos_size = function (circle_sel, char_sel){
    circle_sel
        .attr("id", "circle_marks")
        .attr("year_prov", d=> d.Year + "_" + d.Geography)
        .attr("r", d => rScale(Number(d[char_sel])))
        .attr("cx", d => xScale(d.CPI))
        .attr("cy", d => (yScale(d.FoodInsecure)))
        .attr("class", "circle_marks");
}
const text_pos_size = function(text_sel){
    text_sel.text(d => d.Geography)
        .attr("x", d => xScale(d.CPI))
        .style("pointer-events", "none")
        .attr("y", d =>yScale(d.FoodInsecure))
        .attr("opacity", 0);
}

const updateCircleChart = function updateCircleChart(year = cur_year, provinces = cur_prov_used, char_sel = "Diabetes"){
    console.log(year, provinces, char_sel)
    console.log("year", year);
    cur_year = year; 
    cur_prov_used = provinces; 
    let data = rawData
        .filter( d =>  provinces.includes(d.Geography))
        .map(function(d) {
            var obj = {
                Geography: d.Geography,
                Year: Number(d.Year),
                Characteristics: d.Characteristics,
                CPI: Number(d.CPI),
                FoodInsecure : Number(d.FoodInsecure)
            };
            
            obj[char_sel] = Number(d[char_sel]);
            return obj;
        }).
        filter( d => {
            return d.Characteristics === "Percent";
        })
        .filter( d => d.Year === year);




    console.log(data);

    let circle_gs = d3.select("#health_circle_chart")
    .selectAll("#circle_gs")
    .data(data) 
    .join(
        enter => {
            console.log("in enter")
            var g = enter.append("g")
                .attr("id", "circle_gs");
                const circles = g.append('circle')
                .on("mouseover", function(d){
                    d3.select(this)
                        .attr("opacity", 0.75)
                    d3.select(this.parentNode).selectAll("text")
                        .attr("opacity", 1)
                })
                .on("mouseout", function(d){
                    d3.select(this.parentNode).selectAll("text")
                        .attr("opacity", 0)
                });
            circle_pos_size(circles, char_sel)
            const text = g.append('text');
            text_pos_size(text);
            
        },
        update => {
            console.log("in update")
            
            update.transition()
                .call( update => update.select("#circle_marks").call(circle => {
                    circle_pos_size(circle, char_sel)
                }))
                .call( update => update.select("text").call(text_pos_size))
        },
        exit => {
            exit.remove("*")
        }
    );

    document.getElementById("listenbutton")
        .innerText = year
}

document.getElementById("slide_mouse")
    .addEventListener("mousemove", onMousemove, false);

window.updateCircleChartProvince = updateCircleChartProvince;
window.updateCircleChartCharacteristic = updateCircleChartCharacteristic;
window.updateCircleChartYear = updateCircleChartYear;

var cur_prov_used = [];
var cur_char_sel = "Diabetes"
var cur_year = 2018;

function updateCircleChartCharacteristic(char_sel){
    cur_char_sel = char_sel;
    updateCircleChart(cur_year, cur_prov_used, char_sel);
}

function updateCircleChartProvince(provinces){
    cur_prov_used = provinces; 

    updateCircleChart(cur_year, provinces, char_sel);
}

function updateCircleChartYear(year){
    cur_year = year; 
    updateCircleChart(year, cur_prov_used, cur_char_sel);
}


function onMousemove(event){
    let rect = event.target.getBoundingClientRect();
    let x = Number(event.offsetX);


    const year_to_use = Math.round( (x / rect.width) * (2022 - 2018) + 2018)
    if (year_to_use != cur_year){
        updateCircleChartYear(year_to_use); 
    }
}
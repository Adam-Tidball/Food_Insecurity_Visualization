import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// console.log(d3);
const my_DATA = await d3.csv("/data/Health_Characteristics_diabetes_pruned.csv");
let parsedData = my_DATA.map( d => ({
    Geography: d.Geography,
    Diabetes: Number(d.Diabetes.replace(/,/g,'')),
    DiabetesPercent: Number(d.DiabetesPercent.replace(/,/g,'')),
    Year: d.Year,
    FoodInsecure: d.FoodInsecure,
    Cpi: d.Cpi
}));

const dataAt = function dataAt(year){
    return parsedData.filter( d => d.Year == year);
}

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

const t = svg.transition().duration(750);

const circle_pos_size = function (circle_sel){
    console.log(circle_sel)
    circle_sel
        .attr("id", "circle_marks")
        .attr("year_prov", d=> d.Year + "_" + d.Geography)
        .attr("r", d => rScale(Math.pow(d.DiabetesPercent, 0.6)))
        .attr("cx", d => xScale(d.Cpi))
        .attr("cy", d => (yScale(d.FoodInsecure)))
        .attr("class", "circle_marks");
}

const text_pos_size = function(text_sel){
    text_sel.text(d => d.Geography)
        .attr("x", d => xScale(d.Cpi))
        .style("pointer-events", "none")
        .attr("y", d =>yScale(d.FoodInsecure))
        .attr("opacity", 0);
}

const updateCircles = function updateCircles(year){
    let circle_gs = d3.select("#health_circle_chart")
    .selectAll("#circle_gs")
    .data(dataAt(year)) 
    .join(
        enter => {
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
            circle_pos_size(circles)
            const text = g.append('text');
            text_pos_size(text);
        },
        update => {
            update.transition()
                .call( update => update.select("#circle_marks").call(circle_pos_size))
                .call( update => update.select("text").call(text_pos_size))
        },
        exit => {
            exit.remove("*")
        }
    );

    document.getElementById("listenbutton")
        .innerText = year
}

document.getElementById("listenbutton")
    .addEventListener("click", updateCircles, false)

document.getElementById("slide_mouse")
    .addEventListener("mousemove", onMousemove, false);


updateCircles(2018);
function onMousemove(event){
    let rect = event.target.getBoundingClientRect();
    let x = Number(event.offsetX);


    const year_to_use = Math.round( (x / rect.width) * (2022 - 2018) + 2018)
    if (year_to_use != year){
        year = year_to_use
        updateCircles(year_to_use) 
    }
}
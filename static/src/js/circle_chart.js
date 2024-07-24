// console.log(d3);
var my_DATA = await d3.csv("/data/Health_Characteristics_diabetes_pruned.csv");
let parsedData = my_DATA.map( d => ({
    Geography: d.Geography,
    Diabetes: Number(d.DiabetesPercent.replace(/,/g,'')),
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
let rScale = d3.scaleLinear().domain([0, 100]).range([0, 150])
let xScale = d3.scaleLinear().domain([125, 155]).range([margin.left, width - margin.right])
let yScale = d3.scaleLinear().domain([5, 30]).range([height - margin.bottom, margin.top])


let circle_chart = d3.select("#health_circle_chart")
    .classed("border", true)
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
;

const gx = d3.select("#health_circle_chart")
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

const yAxis = circle_chart.append('g')
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
;


let circles = d3.select("#health_circle_chart")
    .selectAll("#circle_marks")
    .data(dataAt(year))
    .enter()
    .append("circle")
        .sort((a,b) => {d3.descending(a.Geography, b.Geography)})
        .classed("circle_marks", true)
        .attr("id", "circle_marks")
        .attr("year_prov", d=> d.Year + "_" + d.Geography)
        .attr("r", d => rScale(d.Diabetes))
        .attr("cx", d => xScale(d.Cpi))
        .attr("cy", d => (yScale(d.FoodInsecure)))
;


const updateCircles = function updateCircles(){
    year = year + 1;
    if (year > 2022){
        year = 2018
    }
    circles.data(dataAt(year))
    .join("circle")
        .transition()
            .attr("r", d => rScale(d.Diabetes))
            .attr("year_prov", d=> d.Year + "_" + d.Geography)
            .attr("cx", d => xScale(d.Cpi))
            .attr("cy", d => (yScale(d.FoodInsecure)))
}

document.getElementById("listenbutton")
    .addEventListener("click", updateCircles)
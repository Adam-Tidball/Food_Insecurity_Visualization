// console.log(d3);
var my_DATA = await d3.csv("/data/Health_Characteristics_diabetes_pruned.csv");
let parsedData = my_DATA.map( d => ({
    Geography: d.Geography,
    Diabetes: Number(d.DiabetesPercent.replace(/,/g,'')),
    Year: d.Year,
    FoodInsecure: d.FoodInsecure,
    Cpi: d.Cpi
}));

const margin = ({
    top: 20,
    right: 0,
    bottom: 10,
    left: 30
});

const height = 250
const width = 600 


let rScale = d3.scaleLinear().domain([4, 9]).range([1, 9])
let xScale = d3.scaleLinear().domain([125, 155]).range([margin.left, width - margin.right])
let yScale = d3.scaleLinear().domain([5, 30]).range([height - margin.bottom, margin.top])


console.log(parsedData);

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


let circle_marks = d3.select("#health_circle_chart")
    .selectAll("#circle_marks")
    .data(parsedData)
    .enter()
    .append("circle")
    .classed("circle_marks", true)
    .attr("id", "circle_marks")
    .attr("year_prov", d=> d.Year + "_" + d.Geography)
    .attr("r", d => rScale(d.Diabetes))
    .attr("cx", d => xScale(d.Cpi))
    .attr("cy", d => (yScale(d.FoodInsecure)))
;

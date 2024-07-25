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


let circle_chart = d3.select("#health_circle_chart")
    .classed("border", true)
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
;

const xAxis = d3.select("#health_circle_chart")
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

const yAxis = circle_chart.append('g')
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
;


let circle_gs = d3.select("#health_circle_chart")
    .selectAll("#circle_marks")
    .data(dataAt(year))
    .join("g");

circle_gs.append('circle')
        .sort((a,b) => {d3.descending(a.Geography, b.Geography)})     
        .classed("circle_marks", true)
        .attr("id", "circle_marks")
        .attr("year_prov", d=> d.Year + "_" + d.Geography)
        .attr("r", d => rScale(Math.pow(d.DiabetesPercent, 0.6)))
        .attr("cx", d => xScale(d.Cpi))
        .attr("cy", d => (yScale(d.FoodInsecure)))

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

circle_gs.append('text')
    .text(d => d.Geography)
    .attr("x", d => xScale(d.Cpi))
    .style("pointer-events", "none")
    .attr("y", d =>yScale(d.FoodInsecure))
    .attr("opacity", 0);

console.log(Math.pow(11.5, 0.6))

const updateCircles = function updateCircles(year){
    console.log(year)
    circle_gs.data(dataAt(year)).join("g")
    
    let update_c = function update_c(selection) {
        selection.select("circle")
            .attr("r", d => rScale(Math.pow(d.DiabetesPercent, 0.6)))
            .attr("year_prov", d=> d.Year + "_" + d.Geography)
            .attr("cx", d => xScale(d.Cpi))
            .attr("cy", d => yScale(d.FoodInsecure))
    }

    let update_t = function update_t(selection) {
        selection.select("text")
            .attr("x", d => xScale(d.Cpi))
            .attr("y", d => (yScale(d.FoodInsecure)))
    }
    circle_gs.exit()
        .transition()

    circle_gs.transition()
        .duration(1000)
        .call(update_c)
        .call(update_t)

    document.getElementById("listenbutton")
        .innerText = year
}

document.getElementById("listenbutton")
    .addEventListener("click", updateCircles, false)

document.getElementById("slide_mouse")
    .addEventListener("mousemove", onMousemove, false);


year = 2018
function onMousemove(event){
    let rect = event.target.getBoundingClientRect();
    let x = Number(event.offsetX);
    
    console.log("X Position: " + typeof(x));
    console.log(typeof(rect.width));
     
    console.log( x / rect.width);

    const year_to_use = Math.round( (x / rect.width) * (2022 - 2018) + 2018)
    if (year_to_use != year){
        year = year_to_use
        updateCircles(year_to_use) 
    }
}
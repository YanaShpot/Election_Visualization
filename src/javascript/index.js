import * as d3 from 'd3';

let numCols = 10;
let rectW = 4;
let rectH = 2;
let spaceBetweenRect = 0.5;

let margin = {
    right: 40,
    left: 40,
    top: 70,
    bottom: 40
};

let svgContainer = d3.select(".chart")
    .append("g")
    .attr("transform", "translate(0" + margin.left + "," + margin.top + ")");

let div = d3.select(".tooltip")
    .style("opacity", 0);


let d = d3.csv('./data/merged_data_rows_excluded.csv').then(function(data) {
    data[0].counter = 1;
    outer: for (let i = 1; i < data.length; i++) {
        if (data[i].convocation === 1){
            data[i].counter = 1;

        }
        else {
            for (let j = i - 1; j >= 0; j--) {
                if(data[j].convocation < data[i].convocation
                    && data[j].last_name === data[i].last_name
                    && data[j].first_name === data[i].first_name
                    && data[j].birthday === data[i].birthday) {
                    data[i].counter = 1 + data[j].counter;
                    continue outer;
                }
            }
            data[i].counter = 1;
        }
    }

    let convocationsCountsNested = d3.nest()
        .key(function(d){ return d.convocation })
        .key(function(d){ return d.counter })
        .entries(data);
    console.log(convocationsCountsNested);

    let  convocations = d3.nest()
        .key(function(d){ return d.convocation })
        .sortValues(function(x,y) {
            return d3.descending(x.counter,y.counter)
        })
        .entries(data);
    console.log(convocations);

    svgContainer.append("text")
        .attr("x", 0)
        .attr("y", -30)
        .text("1990 - 1994")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");

    svgContainer.append("text")
        .attr("x", 110)
        .attr("y", -30)
        .text("1994 - 1998")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");

    svgContainer.append("text")
        .attr("x", 220)
        .attr("y", -30)
        .text("1998 - 2002")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");

    svgContainer.append("text")
        .attr("x", 330)
        .attr("y", -30)
        .text("2002 - 2006")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");

    svgContainer.append("text")
        .attr("x", 440)
        .attr("y", -30)
        .text("2006 - 2007")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");


    svgContainer.append("text")
        .attr("x", 550)
        .attr("y", -30)
        .text("2007 - 2012")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");

    svgContainer.append("text")
        .attr("x", 660)
        .attr("y", -30)
        .text("2012 - 2014")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");

    svgContainer.append("text")
        .attr("x", 770)
        .attr("y", -30)
        .text("2014 - 2019")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");

    svgContainer.append("text")
        .attr("x", 880)
        .attr("y", -30)
        .text("2019")
        .style("text-decoration", "underline")
        .style("font-size", 10)
        .style("font-family", "Ubuntu Condensed");


    let plots = svgContainer.selectAll("g")
        .data(convocations)
        .enter()
        .append("g")
        .attr("transform", function(d){
            let xCoordinate = (d.key - 1) * 110;
            console.log(xCoordinate);
            return "translate(" + xCoordinate + ")"

        });

    plots.selectAll(".rect")
        .data(function(d){
            return d.values; //.filter(d.counter === "1");
        })
        .enter()
        .append("rect")
        .attr("transform", "translate(0,120) scale(1,-1)")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("x", function(d, i){
            let colIndex = i % numCols;
            return colIndex * (rectW + spaceBetweenRect)
        })
        .attr("y", function(d, i){
            let rowIndex = Math.floor(i/numCols);
            return rowIndex * (rectH + spaceBetweenRect)
        })
        .attr("r", 4)
        .style("fill", '#a6bddb')
        .style("stroke", "none")
        .on("mouseover", function(d){
            div.transition()
                .duration(100)
                .style("opacity", 1);
            let element = d3.select(this);
            element.style("fill", "rgba(0,0,0,0.1)");
            div.html("<span style = 'font-weight: bold'>" + d.first_name +" " + d.last_name + "</span>" + "<br>" + "<span style = 'font-style: italic'>" + "Кількість скликань: "+ d.counter + "</span>")
                .style("font-family", "Ubuntu Condensed");
            div.style("visibility", "visible")
        })
        .on("mousemove", function(d){
            div.style("left", (d3.event.pageX - rectW/2) + "px")
                .style("top", (d3.event.pageY - 25 - rectH) + "px")
        })
        .on("mouseout", function(d){
            div.transition()
                .duration(500);
            div.style("visibility", "hidden");
            let element = d3.select(this);
            element.style("fill", "#a6bddb")
        })
});
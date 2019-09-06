import * as d3 from 'd3';

let numCols = 10;
let rectW = 4;
let rectH = 2;
let spaceBetweenRect = 0.5;
let spaceBetweenCols = 55;

const years = ['1990-1994', '1994-1998',
    '1998-2002', '2002-2006',
    '2006-2007', '2007-2012',
    '2012-2014', '2014-2019', '2019'];

const colors = ['#a6bddb', '#eda9d0','#e48dbb','#d971a6',
    '#cb5692','#bb3a7d','#a71d68','#8e0152']

let margin = {
    right: 40,
    left: 40,
    top: 70,
    bottom: 40
};


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

    let svgContainer = d3.select(".chart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let plots = svgContainer.selectAll("g")
        .data(convocations)
        .enter()
        .append("g")
        .attr("transform", function(d){
            let xCoordinate = (d.key - 1) *spaceBetweenCols;
            return "translate(" + xCoordinate +")";});


    let title = plots.append('g')
        .style("text-anchor", "middle")
        .style("font-family", "Ubuntu Condensed")
        .attr("transform", "translate("+(numCols*(rectW+spaceBetweenRect) - spaceBetweenRect)/2+")");

    title.append("text")
        .attr("class", "block_title")
        .text(function(d) {
            return years[d.key - 1];
        });

    plots.selectAll(".rect")
        .data(function(d){
            return d.values; //.filter(d.counter === "1");
        })
        .enter()
        .append("rect")
        .attr("transform", "translate(0,150) scale(1,-1)")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("x", function(d, i){
            let colIndex = i % numCols;
            return colIndex * (rectW + spaceBetweenRect)
        })
        .attr("y", function(d,i){
            let rowIndex = Math.floor(i/numCols);
            return rowIndex * (rectH + spaceBetweenRect)
        })
        .style("fill", function(d) {
            //data.forEach(function(d){
                let color =  colors[d.counter - 1];
                console.log(color);
                return color;

            //})
        })
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
        .on("mousemove", function(){
            div.style("left", (d3.event.pageX - rectW/2) + "px")
                .style("top", (d3.event.pageY - 25 - rectH) + "px")
        })
        .on("mouseout", function(){
            div.transition()
                .duration(500);
            div.style("visibility", "hidden");
            let element = d3.select(this);
            element.style("fill", function(d) {

                let color = colors[d.counter - 1];
                console.log(color);
                return color;
            });
        });

    let div = d3.select(".tooltip")
        .style("opacity", 0);
});
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
    //Add counter columnn
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

    //Count number of first year deputies, and repetitive deputies
    let convCounts = d3.nest()
        .key(function(d){ return d.convocation })
        .key(function(d){{
            if (d.counter === 1) {
                return d.counter
            }
        }
        })
        .rollup(function(d) {
            return d.length; })
        .object(data);

    for(let d in convCounts) {
        if (d === "1"){
            convCounts[d]["other"] = 0;
            continue;
        }
        convCounts[d]["other"] = convCounts[d][undefined];
        delete convCounts[d][undefined];
        }
    //console.log(convCounts);

    //Count percentage
    let percentage = [];
    for(let d in convCounts){
        let percent = Math.round(100 * convCounts[d][1]/(convCounts[d][1] + convCounts[d]["other"]));

        percentage.push(percent);
    }
    //console.log(percentage);

    let  convocations = d3.nest()
        .key(function(d){ return d.convocation })
        .sortValues(function(x,y) {
            return d3.ascending(x.counter,y.counter)
        })
        .entries(data);
    //console.log(convocations);

    let svgContainer = d3.select(".chart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   /* let main_title = svgContainer
        .append('g')
        .style("text-anchor", "middle")
        .style("font-family", "Ubuntu Condensed");

    main_title.append("text")
        .attr("class", "main_title")
        .text("Як оновлювався склад верховної ради");


    main_title.append("text")
        .attr("class", "main_subtitle")
        .text("Кожен прямокутник на графіку ‒ це один депутат або депутатка у Верховній Раді.\n" +
            "        Кількість людей у скликаннях не однакова (і може бути більшою за 450),\n" +
            "        оскільки тут враховані всі, хто був депутатом чи депутаткою протягом певного скликання");

*/
    let plot = svgContainer.selectAll("g")
        .data(convocations)
        .enter()
        .append("g")
        .attr("transform", function(d){
            let xCoordinate = (d.key - 1) *spaceBetweenCols;
            return "translate(" + xCoordinate +")";});

    let block_title = plot.append('g')
        .style("text-anchor", "middle")
        .style("font-family", "Ubuntu Condensed")
        .attr("transform", "translate("+(numCols*(rectW+spaceBetweenRect) - spaceBetweenRect)/2+")");

    block_title.append("text")
        .attr("class", "block_title")
        .text(function(d) {
            return years[d.key - 1];
        });
    block_title.append("line")
        .attr("stroke-width",1)
        .attr("stroke","#5D646F")
        .attr("x1",Math.ceil(-((rectW + spaceBetweenRect) * numCols - spaceBetweenRect)/2) )
        .attr("x2",Math.ceil(((rectW + spaceBetweenRect) * numCols - spaceBetweenRect)/2) )
        .attr("transform", "translate(0,2.5)");



    block_title.append("text")
        .attr("class", "percent_subtitle")
        .attr("y", 14)
        .text(function(d) {
            return percentage[d.key - 1] + '%';
        });

    plot.selectAll(".rect")
        .data(function(d){
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("transform", function (d){
            if (d.counter === 1) {
                return "translate(0,150) scale(1,-1)";
            }
            else {
                return "translate(0,150)";
            }

        } )
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("x", function(d, i){

            if (d.counter === 1) {
                let colIndex = i % numCols;
                return colIndex * (rectW + spaceBetweenRect)
            }
            else {
                let dif =  convCounts[d.convocation][1]%numCols;
                //console.log(dif);

                let colIndex = (i - dif) % numCols;
                return (colIndex) * (rectW + spaceBetweenRect)
            }
        })
        .attr("y", function(d,i){
            if (d.counter === 1) {

                let rowIndex = Math.floor(i/numCols);
                return rowIndex * (rectH + spaceBetweenRect)
            }
            else {
                let dif =  convCounts[d.convocation][1]%numCols;
                let rowIndex = Math.floor((i - dif)/numCols);
                let firstBlockRows = Math.floor((convCounts[d.convocation][1])/numCols);
                return (rowIndex - firstBlockRows)* (rectH + spaceBetweenRect) + spaceBetweenRect;
            }

        })
        .style("fill", function(d) {
                let color =  colors[d.counter - 1];
                //console.log(color);
                return color;
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
                //console.log(color);
                return color;
            });
        });

    let div = d3.select(".tooltip")
        .style("opacity", 0);
});
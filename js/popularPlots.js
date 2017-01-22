/*
 *  PopularPlots - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

PopularPlots = function(_parentElement, _data, _eventHandler) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;

    this.initVis();
};

PopularPlots.prototype.initVis = function() {

    var vis = this;

    vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
    vis.width = $(vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;


    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.popHeight = 70;
    vis.repHeight = vis.popHeight/2;
    vis.linHeight = vis.popHeight/2;


    vis.x = d3.scale.linear()
        .range([0,400])
        .domain([0,.4]);
    vis.xRev = d3.scale.linear()
        .range([0,-400])
        .domain([0,.4]);

    vis.formatValue = d3.format(".0%");

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("top")
        .ticks(5)
        .tickFormat(function(d) { return vis.formatValue(d); });
    vis.xRevAxis = d3.svg.axis()
        .scale(vis.xRev)
        .orient("top")
        .ticks(5)
        .tickFormat(function(d) { return vis.formatValue(d); });

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(" + vis.width/2 + ",80)");

    vis.svg.select(".x-axis").call(vis.xAxis);

    vis.svg.append("g")
        .attr("class", "x-axis axis xrev-axis")
        .attr("transform", "translate(" + (vis.width/2) + ",80)");

    vis.svg.select(".xrev-axis").call(vis.xRevAxis);

    vis.svg.append("text")
        .text("Party Percent Advantage in:")
        .attr("text-anchor","middle")
        .attr("x",vis.width/2)
        .attr("y",10);

    vis.svg.append("text")
        .text("House Representatives")
        .style("font-weight","bold")
        .attr("text-anchor","middle")
        .attr("x",vis.width/2)
        .attr("y",30);

    vis.svg.append("text")
        .text("Popular Vote")
        .style("font-weight","bold")
        .attr("text-anchor","middle")
        .attr("x",vis.width/2)
        .attr("y",50)
        .attr("opacity",.3);

    vis.svg.append("text")
        .text("Republican Advantage")
        .style("font-weight","bold")
        .style("font-size","large")
        .attr("text-anchor","start")
        .attr("x",220)
        .attr("y",50);

    vis.svg.append("text")
        .text("Democratic Advantage")
        .style("font-weight","bold")
        .style("font-size","large")
        .attr("text-anchor","end")
        .attr("x",vis.width-220)
        .attr("y",50);

    vis.USAData = vis.data[0];
    vis.data = vis.data.filter(function(d, index) {
        return d.State != "United States";
    });

    vis.wrangleData();

};

PopularPlots.prototype.wrangleData = function() {
    var vis = this;




    vis.updateVis();

};

PopularPlots.prototype.updateVis = function() {
    var vis = this;

    vis.USAtip = d3.tip().attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function() {
            var string = "In the United States, ";
            if (vis.USAData.PopCounter < 0) {
                string = string + vis.formatValue(vis.USAData.RepPercent) + " of voters selected a Republican representative, <br>but " + vis.formatValue(vis.USAData.RepRepPercent) + " of the country's House Representatives are Republican.";
            } else {
                string = string + vis.formatValue(vis.USAData.DemPercent) + " of voters selected a Democratic representative, <br>but " + vis.formatValue(vis.USAData.DemRepPercent) + " of the country's House Representatives are Democratic.";
            }
            return string;
        });

    vis.statetip = d3.tip().attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            var string = "In the state of " + d.State + ", ";
            if (d.PopCounter < 0) {
                string = string + vis.formatValue(d.RepPercent) + " of voters selected a Republican representative, <br>but " + vis.formatValue(d.RepRepPercent) + " of the state's Representatives are Republican.";
            } else {
                string = string + vis.formatValue(d.DemPercent) + " of voters selected a Democratic representative, <br>but " + vis.formatValue(d.DemRepPercent) + " of the state's Representatives are Democratic.";
            }
            return string;
        });

    vis.svg.call(vis.USAtip);

    vis.svg.call(vis.statetip);

    vis.svg.append("text")
        .text("United States")
        .style("font-weight","bold")
        .style("font-size","large")
        .attr("text-anchor","end")
        .attr("x",200)
        .attr("y",100 + vis.popHeight/2);

    vis.USAPopBar = vis.svg.append("rect")
        .attr("class","USAPopBar")
        .attr("x",function(d) {
            if (vis.USAData.PopCounter < 0) {
                return vis.width/2 - vis.x(Math.abs(vis.USAData.PopCounter));
            } else {
                return vis.width/2;
            }
        })
        .attr("y", 95)
        .attr("width", function(d,index) {
            return vis.x(Math.abs(vis.USAData.PopCounter));
        })
        .attr("height", function(d,index) {
            return vis.popHeight;
        })
        .attr("fill", function(d) {
            if (vis.USAData.PopCounter < 0) {
                return "red";
            } else {
                return "blue";
            }
        })
        .attr("opacity", .3);

    vis.USARepBar = vis.svg.append("rect")
        .attr("class","USARepBar")
        .attr("x",function(d) {
            if (vis.USAData.RepCounter < 0) {
                return vis.width/2 - vis.x(Math.abs(vis.USAData.RepCounter));
            } else {
                return vis.width/2;
            }
        })
        .attr("y", 95 + vis.popHeight/2 - vis.repHeight/2)
        .attr("width", function(d,index) {
            return vis.x(Math.abs(vis.USAData.RepCounter));
        })
        .attr("height", function(d,index) {
            return vis.repHeight;
        })
        .attr("fill", function(d) {
            if (vis.USAData.RepCounter < 0) {
                return "red";
            } else {
                return "blue";
            }
        })
        .on('mouseover', vis.USAtip.show)
        .on('mouseout', vis.USAtip.hide);

    vis.statePopBars = vis.svg.selectAll(".repBar")
        .data(vis.data);

    vis.statePopBars.enter().append("rect")
        .attr("class","repBar")
        .attr("x",function(d) {
            if (d.PopCounter < 0) {
                return vis.width/2 - vis.x(Math.abs(d.PopCounter));
            } else {
                return vis.width/2;
            }
        })
        .attr("y", function(d, index) {
            return 95 + (index + 1) * (vis.popHeight + 5);
        })
        .attr("width", function(d,index) {
            return vis.x(Math.abs(d.PopCounter));
        })
        .attr("height", function(d,index) {
            return vis.popHeight;
        })
        .attr("fill", function(d) {
            if (d.PopCounter < 0) {
                return "red";
            } else {
                return "blue";
            }
        })
        .attr("opacity", .3);

    vis.statePopBars.exit().remove();

    vis.stateRepBars = vis.svg.selectAll(".popBar")
        .data(vis.data);

    vis.stateRepBars.enter().append("rect")
        .attr("class","repBar")
        .attr("x",function(d) {
            if (d.RepCounter < 0) {
                return vis.width/2 - vis.x(Math.abs(d.RepCounter));
            } else {
                return vis.width/2;
            }
        })
        .attr("y", function(d, index) {
            return 95 + vis.popHeight/2 - vis.repHeight/2 + (index + 1) * (vis.popHeight + 5);
        })
        .attr("width", function(d,index) {
            return vis.x(Math.abs(d.RepCounter));
        })
        .attr("height", function(d,index) {
            return vis.repHeight;
        })
        .attr("fill", function(d) {
            if (d.RepCounter < 0) {
                return "red";
            } else {
                return "blue";
            }
        })
        .on('mouseover', vis.statetip.show)
        .on('mouseout', vis.statetip.hide);

    vis.stateRepBars.exit().remove();

    // vis.stateIdeal = vis.svg.selectAll(".stateIdeal")
    //     .data(vis.data);
    //
    // vis.stateIdeal.enter().append("line")
    //     .attr("class","stateIdeal")
    //     .attr("x1",function(d) {
    //         if (d.ClosestCounter < 0) {
    //             console.log(d);
    //             return vis.width/2 - vis.x(Math.abs(d.ClosestCounter));
    //         } else {
    //             return vis.width/2 + vis.x(Math.abs(d.ClosestCounter));
    //         }
    //
    //     })
    //     .attr("x2",function(d) {
    //         if (d.ClosestCounter < 0) {
    //             return vis.width/2 - vis.x(Math.abs(d.ClosestCounter));
    //         } else {
    //             return vis.width/2 + vis.x(Math.abs(d.ClosestCounter));
    //         }
    //     })
    //     .attr("y1", function(d, index) {
    //         return 95 + vis.popHeight/2 - vis.repHeight/2 + (index + 1) * (vis.popHeight + 5);
    //     })
    //     .attr("y1", function(d, index) {
    //         return 95 + vis.popHeight/2 - vis.repHeight/2 + (index + 1) * (vis.popHeight + 5) + vis.linHeight;
    //     });
    //
    // vis.stateIdeal.exit().remove();


    vis.stateLabels = vis.svg.selectAll(".popBar")
        .data(vis.data);

    vis.stateLabels.enter().append("text")
        .text(function(d) {
            return d.State;
        })
        .style("font-weight","bold")
        .style("font-size","large")
        .attr("text-anchor","end")
        .attr("x",200)
        .attr("y",function(d,index) {
            return 100 + vis.popHeight/2 + (index + 1) * (vis.popHeight + 5);
        });


};



// PopularPlots.prototype.highlightState = function(state) {
//     var vis = this;
//
//     if (state) {
//         vis.svg.selectAll(".state")
//             .data(vis.json.features).transition().duration(80)
//             .style("opacity",function(d) {
//                 if(d.properties.name == state) {
//                     return 1;
//                 } else {
//                     return .1
//                 }
//             });
//
//         // vis.svg.selectAll(".bg-map")
//         //     .data(vis.json.features).transition().duration(80)
//         //     .style("stroke",function(d) {
//         //         if(d.properties.name == state) {
//         //             return "black";
//         //         } else {
//         //             return "gray";
//         //         }
//         //     });
//     } else {
//         vis.svg.selectAll(".state")
//             .data(vis.json.features).transition().duration(80)
//             .style("opacity", .3);
//
//         // vis.svg.selectAll(".bg-map")
//         //     .data(vis.json.features).transition().duration(80)
//         //     .style("stroke", "gray");
//     }
// };
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
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");;

    d3.json("data/us-states.json", function(json) {
        vis.json = json;
        vis.wrangleData();
    });
};

PopularPlots.prototype.wrangleData = function() {
    var vis = this;

    // console.log("check");
    // console.log(vis.json);
    console.log(vis.data);

    for (var j = 0; j < vis.json.features.length; j++) {
        console.log(vis.json.features[j]);
        if (vis.data[vis.json.features[j].properties.name]){
            vis.json.features[j].properties.ElectoralToPopRatio = vis.data[vis.json.features[j].properties.name].ElectoralToPopRatio;
            vis.json.features[j].properties["2016Vote"] = vis.data[vis.json.features[j].properties.name]["2016Vote"];
            vis.json.features[j].properties["PercentElectoralVotes"] = vis.data[vis.json.features[j].properties.name]["PercentElectoralVotes"];

        }
    }

    vis.updateVis();

};

PopularPlots.prototype.updateVis = function() {
    var vis = this;

    vis.projection = d3.geo.albersUsa()
        .translate([vis.width / 2, vis.height / 2])
        .scale([800]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    // Render the U.S. by using the path generator
    vis.svg.selectAll("path")
        .data(vis.json.features)
        .enter().append("path")
        .attr("d", vis.path)
        .attr("stroke","black")
        .attr("fill","lightgray");

    var x,y;

    vis.svg.selectAll(".state")
        .data(vis.json.features)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", vis.path)
        .attr("transform", function(d,index) {
            var centroid = vis.path.centroid(d),
                x = centroid[0],
                y = centroid[1];
            return "translate(" + x + "," + y + ")"
                + "scale(" + d.properties.ElectoralToPopRatio + ")"
                + "translate(" + -x + "," + -y + ")";
        })
        .attr("fill",function(d) {
            // if (d.properties.prop < .2) {return "#feedde"}
            // else if (d.properties.prop < .4) {return "#fdbe85"}
            // else if (d.properties.prop < .6) {return "#fd8d3c"}
            // else if (d.properties.prop < .8) {return "#e6550d"}
            // else {return "#a63603"}
            if (d.properties["2016Vote"] == "Rep") { return "red" }
            else { return "blue" };
        })
        .attr("stroke","white")
        .attr("fill-opacity",.3)
        .style("stroke-width", function(d) {
            return .5/d.properties.ElectoralToPopRatio;
        });



};

// PopularPlots.prototype.highlightState = function(state) {
//     var vis = this;
//
//     if (state) {
//         vis.svg.selectAll("path")
//             .data(vis.json.features).transition().duration(80)
//             .style("opacity",function(d) {
//                 if(d.properties.name == state) {
//                     return 1;
//                 } else {
//                     return .3
//                 }
//             });
//         // .attr("fill",function(d) {
//         // if(d.properties.name == state) {
//         //     if (d.properties.prop < .2) {return "#feedde"}
//         //     else if (d.properties.prop < .4) {return "#fdbe85"}
//         //     else if (d.properties.prop < .6) {return "#fd8d3c"}
//         //     else if (d.properties.prop < .8) {return "#e6550d"}
//         //     else {return "#a63603"}
//         // } else {
//         //     if (d.properties.prop < .2) {return "#feedde"}
//         //     else if (d.properties.prop < .4) {return "#fdbe85"}
//         //     else if (d.properties.prop < .6) {return "#fd8d3c"}
//         //     else if (d.properties.prop < .8) {return "#e6550d"}
//         //     else {return "#a63603"}
//         // }
//         // })
//     } else {
//         vis.svg.selectAll("path")
//             .data(vis.json.features).transition().duration(80)
//             .style("opacity", 1);
//         // .attr("fill",function(d) {
//         //     if (d.properties.senDeniers == 2) {return "red"}
//         //     else if (d.properties.senDeniers == 1) {return "purple"}
//         //     else {return "blue"}
//         // })
//     }
// };
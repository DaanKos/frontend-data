import * as d3 from 'd3';
import drawDetail from "./vizDrawDetail";

// This function draws the map
// Each country gets a fill color based on their "categoryWithMostObjects"
// It also declares that when an individual country gets clicked, it should run the drawDetail function with it's own properties
export default function(givenG, givenSection, pathCreator, countryData, colorScale) {
    givenG.selectAll("path")
          .data(countryData)
          .enter()
          .append("path")
          .attr("d", pathCreator)
          .style("fill", d => colorScale(d.properties.categoryWithMostObjects))
          .style("stroke", 'black')
          .style("stroke-width", .75)
          .style("stroke-opacity", 0)
          .on('mouseover', function() {
                d3.select(this)
                  .style('stroke-opacity', 1)
          })
          .on('mouseout', function() {
                d3.select(this)
                  .style('stroke-opacity', 0)
          })
          .on('click', function(d) {
                drawDetail(givenSection, d.properties)
          })
}
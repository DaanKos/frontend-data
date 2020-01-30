// This function draws a legend in the assigned "legendG" space
// This code for drawing a legend was heavily inspired by Yan Holtz at https://www.d3-graph-gallery.com/graph/custom_legend.html
export default function(givenG, uniqCategories, colorScale) {
    let size = 20

    // Adding the "Legenda" title to the legend
    givenG.append("text")
          .text("Legenda")
          .attr("x", 16)
          .attr("y", 55)
          .style("font-weight", "700")

    // Adding the colored rectangles
    givenG.selectAll("rects")
          .data(uniqCategories)
          .enter()
          .append("rect")
          .attr("x", 16)
          .attr("y", function(d,i){ return 65 + i*(size+5)})
          .attr("width", size)
          .attr("height", size)
          .style("fill", function(d){ return colorScale(d)})

    // Adding the correct labels to each rectangle, colored in the same color
    givenG.selectAll("labels")
          .data(uniqCategories)
          .enter()
          .append("text")
          .attr("x", 16 + size*1.2)
          .attr("y", function(d,i){ return (65 + i*(size+5) + (size/2))+5})
          .style("fill", function(d){
            if (d === undefined){
                return "black"
            } else {
                return colorScale(d)
            }
          })
          .style("font-size", ".75em")
          .text(function(d){
            if (d === undefined){
                return "Geen objecten"
            } else {
            // Remove main and add space before every new word that starts with a capital letter, code for adding the space is written by Rocket Hazmat at https://stackoverflow.com/a/15343790/12734791
                return d.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2')
            }
          })
          .attr("text-anchor", "left")
}
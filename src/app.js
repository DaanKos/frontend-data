import createFinalArray from "./utils/createFinalArray";
import * as d3 from 'd3'
// import { feature } from 'topojson';
// const { select, geoPath, geoNaturalEarth1 } = d3;

function createViz() {
  createFinalArray().then(result => {
    console.log("Result given to createViz: ", result);
    console.log("Can create viz in this function, result is available...");

    const legendSvg = d3.select('#legendSvg');
    const mapSvg = d3.select('#mapSvg');
    const detailSection = d3.select('#detailSection');
    const legendG = legendSvg.append('g');
    const mapG = mapSvg.append('g').attr("transform", "translate(-75,0)");
    // const detailG = detailSvg.append('g');
    const worldMap = d3.geoNaturalEarth1();
    const pathCreator = d3.geoPath().projection(worldMap);

    let state = {
      countryArrayFromMap: [],
      dataCount: [],
    }

    state.countryArrayFromData = result;

    mapSvg.call(d3.zoom().scaleExtent([1 / 8, 24]).on('zoom', onzoom));

    function onzoom() {
      mapG.attr('transform', d3.event.transform);
    }

    // Fetch map layout JSON + create an array containing unique countries
    function rendermapLayout() {     
      d3.json('https://enjalot.github.io/wwsd/data/world/world-110m.geojson')
          .then(json => {
              json.features.forEach((feature, i) => {
                  state.countryArrayFromMap.push(feature.properties.name);
                  state.dataCount.push(feature)
              });
          }).then(x => {
              countTracker(state.countryArrayFromData, state.dataCount, state.countryArrayFromMap)
          }).then(x => {
              let categoryArray = state.dataCount.map(function(item){ return item.properties.categoryWithMostObjects });
              let uniq = [...new Set(categoryArray)];
              uniq.sort();
              let colScale = d3.scaleOrdinal().domain(uniq).range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#6a3d9a", "#b15928", "#fff"])

              drawMap(state.dataCount, colScale)
              drawLegend(uniq, colScale)
          })
    };

    rendermapLayout()
    
    function countTracker( results, dataCount, countryArray ){
      results.forEach(result => {
          if(countryArray.includes(result.country)) {
              dataCount.forEach((counter) => {
                  if(counter.properties.name == result.country){
                    counter.properties = result
                  }
              });
          }
      })
    return { results, dataCount }
  }

    function drawMap(dataCount, colScale) {
        mapG.selectAll("path")
         .data(dataCount)
         .enter()
         .append("path")
         .attr("d", pathCreator)
         .attr("class", d => d.properties.categoryWithMostObjects)
         .style("fill", d => colScale(d.properties.categoryWithMostObjects))
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
          drawDetail(d.properties)
         })
    }


    function drawDetail(givenData) {
      console.log(givenData)
      console.log(givenData.categories)
      console.log(givenData.country)

      let descSortByObjCount = function(){
        if (givenData.categories){
          let tempData = givenData.categories.slice(0);
          tempData.sort(function(a,b) {
            return b.categoryObjCount - a.categoryObjCount;
          })
          return tempData
        } else {
          return [{
            categoryName: "dit land gevonden",
            categoryObjCount: "Geen"
          }]
        }
      }

      let countryName = function(){
        if (givenData.country){
          return [{name: givenData.country}]
        } else if (givenData.name){
          return [{name: givenData.name}]
        }
      }

      console.log("This is countryName: ", countryName)
      console.log("This is descmeuk: ", descSortByObjCount)

      let title = detailSection.selectAll("h3")
                              .data(countryName)
                              .text(d => d.name)

      title.exit()
           .remove()

      title.enter()
           .append("h3")
           .text(d => d.name)
           .attr("class", "detailSectionTitle")

      let categories = detailSection.selectAll("p")
                           .data(descSortByObjCount)
                           .text(d => d.categoryObjCount+ " objecten in " +d.categoryName.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2'));
      categories.exit()
             .remove()

      categories.enter()
             .append("p")
             .text(d => d.categoryObjCount+ " objecten in " +d.categoryName.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2'))
             .attr("class", "detailSectionText")

    //   detailG.enter()
    //          .append("text")
    //          .text("Detailpagina")
    //          .attr("x", 10)
    //          .attr("y", 30)
    //          .style("font-weight", "bold")
    //          .exit()
    //          .remove()

    //   detailG.selectAll("title")
    //          .enter()
    //          .append("text")
    //          .text(countryName)
    //          .attr("x", 10)
    //          .attr("y", 50)
    }
    

    function drawLegend(uniq, colScale) {
      let size = 20
      legendG.append("text")
            .text("Legenda")
            .attr("x", 10)
            .attr("y", 30)
            .style("font-weight", "bold")

      legendG.selectAll("mydots")
        .data(uniq)
        .enter()
        .append("rect")
          .attr("x", 10)
          .attr("y", function(d,i){ return 40 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("width", size)
          .attr("height", size)
          .style("fill", function(d){ return colScale(d)})

      // Add one dot in the legend for each name.
      legendG.selectAll("mylabels")
        .data(uniq)
        .enter()
        .append("text")
          .attr("x", 10 + size*1.2)
          .attr("y", function(d,i){ return (40 + i*(size+5) + (size/2))+5}) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", function(d){
            if (d === undefined){
              return "black"
            } else {
              return colScale(d)
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
  })
}

createViz();
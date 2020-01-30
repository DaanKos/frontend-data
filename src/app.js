import createFinalArray from "./utils/createFinalArray";
import vizJoinData from "./utils/vizJoinData";
import vizDrawMap from "./utils/vizDrawMap";
import vizDrawLegend from "./utils/vizDrawLegend";
import * as d3 from 'd3'

function createViz() {
  createFinalArray().then(result => {
    
    // Console logging the result given to the function, to see if this is the correct data it should indeed receive
    console.log("Result given to createViz: ", result);

    // Declaring const's that are needed in the rest of the function, they won't change at all
    const legendSvg = d3.select('#legendSvg');
    const mapSvg = d3.select('#mapSvg');
    const detailSection = d3.select('#detailSection');
    const legendG = legendSvg.append('g');
    const mapG = mapSvg.append('g').attr("transform", "translate(-75,0)");
    const worldMap = d3.geoNaturalEarth1();
    const pathCreator = d3.geoPath().projection(worldMap);

    // Adding zooming function to the map portion of the vizualisation
    mapSvg.call(d3.zoom().scaleExtent([1 / 8, 24]).on('zoom', onzoom));
    function onzoom() {
      mapG.attr('transform', d3.event.transform);
    }

    // Adding a state in which we put all the data we use, both the data the function has been given as a parameter and the mapdata received from an external source within this function
    let createVizState = {
      countryNameArrayFromMap: [],
      countryData: [],
    }

    // Adding the result, given as a parameter to this function, to the state declared above
    createVizState.countryArrayFromData = result;

    // Running the different functions in the correct order to create the final vizualisation
    function funcChainAll() {     
      // Retrieving the world map data as geojson, and sending (parts of) it's features to the earlier declared state
      // Giovanni Kaaijk showed me this data source and retrieval methods, so props to him! https://github.com/GiovanniKaaijk/frontend-data/blob/master/index.js#L54
      d3.json('https://enjalot.github.io/wwsd/data/world/world-110m.geojson')
          .then(json => {
              json.features.forEach((feature) => {
                  createVizState.countryNameArrayFromMap.push(feature.properties.name);
                  createVizState.countryData.push(feature)
              });
          }).then(function(){
              // After the previous step has been completed, we have all the data we need available to us, so we're joining them together
              let joinedData = vizJoinData(createVizState.countryArrayFromData, createVizState.countryData, createVizState.countryNameArrayFromMap)
              createVizState.countryData = joinedData.countryData
          }).then(function(){
              // After joining the data in the previous step all that's left to do is use the data to create a vizualisation
              // We start this off by creating an array with all the categories found at categoryWithMostObjects
              let categoryArray = createVizState.countryData.map(function(item){
                return item.properties.categoryWithMostObjects
              });

              // We create a new filtered array that only contains unique categories, removing all duplicates
              let uniqCategories = [...new Set(categoryArray)];

              // We sort this array alphabetically
              uniqCategories.sort();

              // We declare a color scale which we will use for filling the countries with different colors and creating a correct legend
              let colorScale = d3.scaleOrdinal().domain(uniqCategories).range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#a80000", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#6a3d9a", "#b15928", "#fff"])

              // Lastly, the drawMap and drawLegend functions get called, and they're given the correct properties
              vizDrawMap(mapG, detailSection, pathCreator, createVizState.countryData, colorScale)
              vizDrawLegend(legendG, uniqCategories, colorScale)
          })
    };

    // Calling the funcChainAll function
    funcChainAll()

  })
};

createViz();
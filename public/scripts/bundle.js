(function (d3) {
    'use strict';

    // Function that compares the objects in an array, and returns a new, single array
    // Creates array that contains one object per country, contains the categoryWithMostObjects for this country

    function compareArray(results) {
        return results.reduce((newItems, currentItem) => {
            
            // Is there an item that has a country property that's equal to the current item country property?
            const foundItem = newItems.find(item => item.country === currentItem.country);

            // If the country doesn't exist in the new item array, create it as a new object with the necessary properties
            if (!foundItem) {
                const newItem = {
                    country: currentItem.country,
                    countryGeo: currentItem.countryGeo,
                    countryLat: currentItem.countryLat,
                    countryLong: currentItem.countryLong,
                    categoryWithMostObjects: currentItem.mainCategory,
                    categoryWithMostObjectsObjectCount: currentItem.objectCountTotal,
                    categories: [{
                        categoryName: currentItem.mainCategory,
                        categoryObjCount: currentItem.objectCountTotal
                    }]
                };

                // Push the new item to the newItems array
                newItems.push(newItem);
            } else if (foundItem.categoryWithMostObjectsObjectCount < currentItem.objectCountTotal) {
                // If the country does exist in the new item array, check if it's mainCategory objectCountTotal is bigger than the one of the country in the array
                // Is it bigger? Replace the categoryWithMostObjects and categoryWithMostObjectsObjectCount
                foundItem.categoryWithMostObjects = currentItem.mainCategory;
                foundItem.categoryWithMostObjectsObjectCount = currentItem.objectCountTotal;

                // Also add the currentItem's mainCategory to the categories array as an object, containing it's name and objectCountTotal
                foundItem.categories.push({
                    categoryName: currentItem.mainCategory,
                    categoryObjCount: currentItem.objectCountTotal
                });
            } else {
                // If the country does exist in the new item array, check if it's mainCategory objectCountTotal is bigger than the one of the country in the array
                // Is it smaller? Add the currentItem's mainCategory to the categories array as an object, containing it's name and objectCountTotal
                foundItem.categories.push({
                    categoryName: currentItem.mainCategory,
                    categoryObjCount: currentItem.objectCountTotal
                });
            }

            // Return newItems array
            return newItems
        }, [])
    }

    // Function that formats the given data
    // Uses a parameter to determine what the mainCategory is, and has to be given data (results) which it will format
    // Creates a new object structure for every object in the array
    // Also combines all entries that have the same country property, resulting in an array which shows the amount of objects for the main category

    function formatData(mainCategory, results) {
        return results
            .map(result => {
                return {
                    mainCategory,
                    subCategory: result.subcategorieLabel.value,
                    countryLabel: result.landLabel.value,
                    countryGeo: result.land.value,
                    countryLat: Number(result.lat.value),
                    countryLong: Number(result.long.value),
                    objectCount: Number(result.choCount.value)
                }
            }).reduce((newItems, currentItem) => {
                // Is there an item that has a country property that's equal to the current item country property?
                const foundItem = newItems.find(item => item.country === currentItem.countryLabel);

                // If the country doesn't exist in the new item array, create it as a new object with the necessary properties
                if (!foundItem) {
                    const newItem = {
                        country: currentItem.countryLabel,
                        countryGeo: currentItem.countryGeo,
                        countryLat: currentItem.countryLat,
                        countryLong: currentItem.countryLong,
                        mainCategory: currentItem.mainCategory,
                        objectCountTotal: currentItem.objectCount
                    };

                    // Push the new item to the newItems array
                    newItems.push(newItem);
                } else {
                    // If the country does exist in the new item array, add current item objectCount to objectCountTotal of that item
                    foundItem.objectCountTotal = foundItem.objectCountTotal + currentItem.objectCount;
                }

                // Return newItems array
                return newItems
    		}, [])
    }

    // File that contains the query that's used in runQuery
    // Changes according to the given parameter, which should be the termMasterId for the query

    function queryCollection(termMasterId) {
    	return `
        #+ summary: Wapens query - haalt alle aantallen van de wapens subcategorieen op per land
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX gn: <http://www.geonames.org/ontology#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX edm: <http://www.europeana.eu/schemas/edm/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
        # tel aantallen per land
        SELECT ?subcategorie ?subcategorieLabel ?lat ?long ?land ?landLabel (COUNT(?cho) AS ?choCount) WHERE {
        # haal van een term in de thesaurus de subcategorieen op
        <https://hdl.handle.net/20.500.11840/termmaster${termMasterId}> skos:narrower* ?subcategorie .
        # haal de objecten van deze subcategorieen en de plaats
        ?cho edm:isRelatedTo ?subcategorie .
        ?cho dct:spatial ?plaats .
        ?subcategorie skos:prefLabel ?subcategorieLabel .
        # haal het landLabel op van de plaats
        ?plaats skos:exactMatch/gn:parentCountry ?land .
        ?land wgs84:lat ?lat .
        ?land wgs84:long ?long .
        ?land gn:name ?landLabel .
        }
        GROUP BY ?lat ?long ?land ?subcategorie ?landLabel ?subcategorieLabel
        ORDER BY DESC(?choCount)
        LIMIT 1000
        `
        }

    // Function that runs the query and data retrieval

    async function runQuery(mainCategory, termMasterId) {
        // The following piece of code was written by user Razpudding (Laurens), from https://codepen.io/Razpudding/pen/LKMbwZ
        // I have edited the code to fit my needs and use my own endpoint
        //Github CMDA
        const url ="https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-17/sparql";
      
        //Note that the query is wrapped in es6 template strings to allow for easy copy pasting
        const query = queryCollection(termMasterId);
      
        // Call the url with the query attached, output data
        let formattedDataResponse = await fetch(url+"?query="+ encodeURIComponent(query) +"&format=json")
        .then(res => res.json())
        .then(json => {
          // Put received json in a let
          let results = json.results.bindings;
          // Format the received data
          let formattedData = formatData(mainCategory, results);
      
          // Return formatted data
          return formattedData
        });
      
        // Return formatted data response from the executed fetch
        return formattedDataResponse;
    }

    // File that contains the necessary categoryNames with their corresponding termMasterId's
    // Gets used to loop through and exectute data retrieval

    var categoryArray = [
        {
            categoryName: "mainPopularCulture",
            termMasterId: 10045782,
        },
        {
            categoryName: "mainJachtVisserijVoedselgaring",
            termMasterId: 2803,
        },
        {
            categoryName: "mainWapens",
            termMasterId: 2091,
        },
        {
            categoryName: "mainLandTuinEnBosbouw",
            termMasterId: 2819,
        },
        {
            categoryName: "mainVeeteeltEnProducten",
            termMasterId: 1843,
        },
        {
            categoryName: "mainVoedingDrankGenotmiddelen",
            termMasterId: 2839,
        },
        {
            categoryName: "mainKledingEnPersoonlijkeversiering",
            termMasterId: 2704,
        },
        {
            categoryName: "mainLichaamsVerzorgingGeneeskundePersoonlijkcomfort",
            termMasterId: 2718,
        },
        {
            categoryName: "mainVestiging",
            termMasterId: 2726,
        },
        {
            categoryName: "mainNijverheidHandelEnDienstverlening",
            termMasterId: 2754,
        },
        {
            categoryName: "mainVervoer",
            termMasterId: 2624,
        },
        {
            categoryName: "mainCommunicatie",
            termMasterId: 2634,
        },
        {
            categoryName: "mainSociaalPolitiekJuridisch",
            termMasterId: 2642,
        },
        {
            categoryName: "mainLevenscyclus",
            termMasterId: 2649,
        },
        {
            categoryName: "mainReligieEnRitueel",
            termMasterId: 2652,
        },
        {
            categoryName: "mainKunst",
            termMasterId: 2657,
        },
        {
            categoryName: "mainOntspanningSportEnSpel",
            termMasterId: 2676,
        },
        {
            categoryName: "mainOnbepaald",
            termMasterId: 1834,
        },
        {
            categoryName: "mainStrijdEnOorlog",
            termMasterId: 16239,
        }
      ];

    // Function that combines the received array's

    function combineArrays() {
        let combinedArray = [];
      
        categoryArray.map(categoryItem => {
          combinedArray.push(runQuery(categoryItem.categoryName, categoryItem.termMasterId));
        });
      
        return Promise.all(combinedArray).then(data => {
          // The following line of code was written by user Gumbo from https://stackoverflow.com/a/10865042
          // It merges the array of arrays (that was fed) to a single array
          let merged = [].concat.apply([], data);
          return merged
        })
    }

    function createFinalArray() {
        return combineArrays().then(result => {
          console.log("Result given to combine array: ", result);
          let compared = compareArray(result);
          return compared
        })
    }

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
        };

        // Adding the result, given as a parameter to this function, to the state declared above
        createVizState.countryArrayFromData = result;
        
        // This function joins the data from the retrieved map and the given results together
        // This causes for the countryData in state to contain both the data needed for drawing the svg and the data given to the createVizFunction
        // This code was heavily inspired by Giovanni Kaaijk's countTracker function, found at https://github.com/GiovanniKaaijk/frontend-data/blob/master/countTracker.js
        function joinData( countryArrayFromData, countryData, countryNameArrayFromMap ){
          countryArrayFromData.forEach(result => {
              if(countryNameArrayFromMap.includes(result.country)) {
                  countryData.forEach((entry) => {
                      if(entry.properties.name == result.country){
                        entry.properties = result;
                      }
                  });
              }
          });
          // return { countryData }
        }

        // This function draws the map
        // Each country gets a fill color based on their "categoryWithMostObjects"
        // It also declares that when an individual country gets clicked, it should run the drawDetail function with it's own properties
        function drawMap(countryData, colorScale) {
            mapG.selectAll("path")
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
                  .style('stroke-opacity', 1);
             })
             .on('mouseout', function() {
              d3.select(this)
                  .style('stroke-opacity', 0);
             })
             .on('click', function(d) {
              drawDetail(d.properties);
             });
        }


        // This function draws a detailpage in the assigned "detailSection" space
        function drawDetail(givenData) {

          // This let contains an array with all categories, in an descending order by objectCount
          let descSortByObjCount = function(){
            if (givenData.categories){
              let tempData = givenData.categories.slice(0);
              tempData.sort(function(a,b) {
                return b.categoryObjCount - a.categoryObjCount;
              });
              return tempData
            } else {
              return [{
                // This categoryName is a bit hacky, I will slice of the first 4 characters in a later function so I added 4 x's to prevent a faulty display of words
                categoryName: "xxxxdit land gevonden",
                categoryObjCount: "Geen"
              }]
            }
          };

          // This let contains the country name, it is a needed cleanup, since the map data and given data don't use the exact same naming scheme
          // This let catches the difference, and converts it to an object in a new array, since d3 needs an array to be fed
          let countryName = function(){
            if (givenData.country){
              return [{name: givenData.country}]
            } else if (givenData.name){
              return [{name: givenData.name}]
            }
          };

          // I've learned about the general update pattern from various sources, but the main inspiration was one by Curran, found at https://github.com/curran/d3-in-motion/blob/master/archive/units/unit-01/module-05/example-09/index.html
          let title = detailSection.selectAll("h3")
                                   .data(countryName);

          title.exit()
               .remove();

          title.enter()
               .append("h3")
               .attr("class", "detailSectionTitle")
               .merge(title)
                .text(d => d.name);
               
          // Again, the main inspiration for this update pattern was one by Curran, found at https://github.com/curran/d3-in-motion/blob/master/archive/units/unit-01/module-05/example-09/index.html
          let categories = detailSection.selectAll("p")
                                        .data(descSortByObjCount);

          categories.exit()
                    .remove();

          categories.enter()
                    .append("p")
                    .attr("class", "detailSectionText")
                    .merge(categories)
                      .text(function(d){
                        if (d.categoryObjCount == 1){
                          return (d.categoryObjCount+ " object in " +d.categoryName.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2'))
                        } else {
                          return (d.categoryObjCount+ " objecten in " +d.categoryName.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2'))
                        }
                      });
        }    
        // This function draws a legend in the assigned "legendG" space
        // This code for drawing a legend was heavily inspired by Yan Holtz at https://www.d3-graph-gallery.com/graph/custom_legend.html
        function drawLegend(uniqCategories, colorScale) {
          let size = 20;

          // Adding the "Legenda" title to the legend
          legendG.append("text")
                .text("Legenda")
                .attr("x", 16)
                .attr("y", 55)
                .style("font-weight", "700");

          // Adding the colored rectangles
          legendG.selectAll("rects")
            .data(uniqCategories)
            .enter()
            .append("rect")
              .attr("x", 16)
              .attr("y", function(d,i){ return 65 + i*(size+5)})
              .attr("width", size)
              .attr("height", size)
              .style("fill", function(d){ return colorScale(d)});

          // Adding the correct labels to each rectangle, colored in the same color
          legendG.selectAll("labels")
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
              .attr("text-anchor", "left");
        }
        // Running the different functions in the correct order to create the final vizualisation
        function funcChainAll() {     
          // Retrieving the world map data as geojson, and sending (parts of) it's features to the earlier declared state
          // Giovanni Kaaijk showed me this data source and retrieval methods, so props to him! https://github.com/GiovanniKaaijk/frontend-data/blob/master/index.js#L54
          d3.json('https://enjalot.github.io/wwsd/data/world/world-110m.geojson')
              .then(json => {
                  json.features.forEach((feature) => {
                      createVizState.countryNameArrayFromMap.push(feature.properties.name);
                      createVizState.countryData.push(feature);
                  });
              }).then(function(){
                  // After the previous step has been completed, we have all the data we need available to us, so we're joining them together
                  joinData(createVizState.countryArrayFromData, createVizState.countryData, createVizState.countryNameArrayFromMap);
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
                  let colorScale = d3.scaleOrdinal().domain(uniqCategories).range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#a80000", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#6a3d9a", "#b15928", "#fff"]);

                  // Lastly, the drawMap and drawLegend functions get called, and they're given the correct properties
                  drawMap(createVizState.countryData, colorScale);
                  drawLegend(uniqCategories, colorScale);
              });
        }
        // Calling the funcChainAll function
        funcChainAll();

      });
    }
    createViz();

}(d3));

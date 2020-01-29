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

                // Also add the currentItem's mainCategory to the object with it's objectCountTotal
                foundItem.categories.push({
                    categoryName: currentItem.mainCategory,
                    categoryObjCount: currentItem.objectCountTotal
                });
            } else {
                // If the country does exist in the new item array, check if it's mainCategory objectCountTotal is bigger than the one of the country in the array
                // Is it smaller? Add the currentItem's mainCategory to the object with it's objectCountTotal
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
        };

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
                      state.dataCount.push(feature);
                  });
              }).then(x => {
                  countTracker(state.countryArrayFromData, state.dataCount, state.countryArrayFromMap);
              }).then(x => {
                  let categoryArray = state.dataCount.map(function(item){ return item.properties.categoryWithMostObjects });
                  let uniq = [...new Set(categoryArray)];
                  uniq.sort();
                  let colScale = d3.scaleOrdinal().domain(uniq).range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#6a3d9a", "#b15928", "#fff"]);

                  drawMap(state.dataCount, colScale);
                  drawLegend(uniq, colScale);
              });
        }
        rendermapLayout();
        
        function countTracker( results, dataCount, countryArray ){
          results.forEach(result => {
              if(countryArray.includes(result.country)) {
                  dataCount.forEach((counter) => {
                      if(counter.properties.name == result.country){
                        counter.properties = result;
                      }
                  });
              }
          });
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


        function drawDetail(givenData) {
          console.log(givenData);
          console.log(givenData.categories);
          console.log(givenData.country);

          let descSortByObjCount = function(){
            if (givenData.categories){
              let tempData = givenData.categories.slice(0);
              tempData.sort(function(a,b) {
                return b.categoryObjCount - a.categoryObjCount;
              });
              return tempData
            } else {
              return []
            }
          };

          let countryName = function(){
            if (givenData.country){
              return [{name: givenData.country}]
            } else if (givenData.name){
              return [{name: givenData.name}]
            }
          };

          console.log("This is countryName: ", countryName);
          console.log("This is descmeuk: ", descSortByObjCount);

          let title = detailSection.selectAll("h3")
                                  .data(countryName)
                                  .text(d => d.name);

          title.exit()
               .remove();

          title.enter()
               .append("h3")
               .text(d => d.name)
               .attr("class", "detailSectionTitle");

          let categories = detailSection.selectAll("p")
                               .data(descSortByObjCount)
                               .text(d => d.categoryObjCount+ " objecten in " +d.categoryName.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2'));
          categories.exit()
                 .remove();

          categories.enter()
                 .append("p")
                 .text(d => d.categoryObjCount+ " objecten in " +d.categoryName.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2'))
                 .attr("class", "detailSectionText");

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
          let size = 20;
          legendG.append("text")
                .text("Legenda")
                .attr("x", 10)
                .attr("y", 30)
                .style("font-weight", "bold");

          legendG.selectAll("mydots")
            .data(uniq)
            .enter()
            .append("rect")
              .attr("x", 10)
              .attr("y", function(d,i){ return 40 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
              .attr("width", size)
              .attr("height", size)
              .style("fill", function(d){ return colScale(d)});

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
              .attr("text-anchor", "left");
        }
      });
    }

    createViz();

}(d3));

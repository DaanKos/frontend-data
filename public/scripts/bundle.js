(function (d3, topojson) {
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
                    objectCountTotal: currentItem.objectCountTotal,
                };

                // Push the new item to the newItems array
                newItems.push(newItem);
            } else if (foundItem.objectCountTotal < currentItem.objectCountTotal) {
                // If the country does exist in the new item array, check if it's mainCategory objectCountTotal is bigger than the one of the country in the array
                // Is it bigger? Replace the categoryWithMostObjects and objectCountTotal
                // Is it smaller? Do nothing, as this means this mainCategory isn't the biggest of the country in question
                foundItem.categoryWithMostObjects = currentItem.mainCategory;
                foundItem.objectCountTotal = currentItem.objectCountTotal;
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

    const { select, geoPath, geoNaturalEarth1, behavior } = d3;

    function createViz() {
      createFinalArray().then(result => {
        console.log("Result given to createViz: ", result);
        console.log("Can create viz in this function, result is available...");

        const svg = select('svg');
        const projection = geoNaturalEarth1();
        const pathGenerator = geoPath().projection(projection);


        svg
          .attr("width", "100%")
          .attr("height", "100%")
          .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform);
          }))
          .append("g");

        setupMap();
        drawMap(result);

        function setupMap(){      
          svg
            .append('path')
            .attr('class', 'sphere')
            .attr('d', pathGenerator({ type: 'Sphere' }));
        }

        function drawMap(result) {
          d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json')
            .then(data => {
              const countries = topojson.feature(data, data.objects.countries);
              svg
                .selectAll('path')
                .data(countries.features)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', pathGenerator);

                plotCategoryPerCountry(result);
            });
        }

        function plotCategoryPerCountry(result) {
            console.log("This is result in d3: ", result);
            
            svg
                .selectAll('text')
                .data(result)
                .enter()
                .append('text')
                .attr('class', 'categoryLabel')
                .attr('x', function(d) {
                  return projection([d.countryLong, d.countryLat])[0]
                })
                .attr('y', function(d) {
                  return projection([d.countryLong, d.countryLat])[1]
                })
                .text(d => d.categoryWithMostObjects.slice(4))
                .style("text-anchor", "middle");
        }
      });
    }

    createViz();

}(d3, topojson));

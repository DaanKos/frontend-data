// This function draws a detailpage in the assigned "detailSection" space
export default function(givenSection, givenData) {

    // This let contains an array with all categories, in an descending order by objectCount
    let descSortByObjCount = function(){
      if (givenData.categories){
        let tempData = givenData.categories.slice(0);
        tempData.sort(function(a,b) {
          return b.categoryObjCount - a.categoryObjCount;
        })
        return tempData
      } else {
        return [{
          // This categoryName is a bit hacky, I will slice of the first 4 characters in a later function so I added 4 x's to prevent a faulty display of words
          categoryName: "xxxxdit land gevonden",
          categoryObjCount: "Geen"
        }]
      }
    }

    // This let contains the country name, it is a needed cleanup, since the map data and given data don't use the exact same naming scheme
    // This let catches the difference, and converts it to an object in a new array, since d3 needs an array to be fed
    let countryName = function(){
      if (givenData.country){
        return [{name: givenData.country}]
      } else if (givenData.name){
        return [{name: givenData.name}]
      }
    }

    // I've learned about the general update pattern from various sources, but the main inspiration was one by Curran, found at https://github.com/curran/d3-in-motion/blob/master/archive/units/unit-01/module-05/example-09/index.html
    let title = givenSection.selectAll("h3")
                             .data(countryName)

    title.exit()
         .remove()

    title.enter()
         .append("h3")
         .attr("class", "detailSectionTitle")
         .merge(title)
          .text(d => d.name)
         
    // Again, the main inspiration for this update pattern was one by Curran, found at https://github.com/curran/d3-in-motion/blob/master/archive/units/unit-01/module-05/example-09/index.html
    let categories = givenSection.selectAll("p")
                                  .data(descSortByObjCount)

    categories.exit()
              .remove()

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
                })
  };
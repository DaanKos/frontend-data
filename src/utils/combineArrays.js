// Function that combines the received array's
// Also calls function runQuery, and uses the categoryArray file to loop through

import runQuery from "./runQuery";
import categoryArray from "./categoryArray";

export default function combineArrays() {
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
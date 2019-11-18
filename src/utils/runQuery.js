// Function that runs the query and data retrieval
// Uses queryCollection to know how the query is set up and uses formatData to format the received data for the first time

import formatData from "./formatData";
import queryCollection from "./queryCollection";

export default async function runQuery(mainCategory, termMasterId) {
    // The following piece of code was written by user Razpudding (Laurens), from https://codepen.io/Razpudding/pen/LKMbwZ
    // I have edited the code to fit my needs and use my own endpoint
    //Github CMDA
    const url ="https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-17/sparql"
  
    //Note that the query is wrapped in es6 template strings to allow for easy copy pasting
    const query = queryCollection(termMasterId);
  
    // Call the url with the query attached, output data
    let formattedDataResponse = await fetch(url+"?query="+ encodeURIComponent(query) +"&format=json")
    .then(res => res.json())
    .then(json => {
      // Put received json in a let
      let results = json.results.bindings;
      // Format the received data
      let formattedData = formatData(mainCategory, results)
  
      // Return formatted data
      return formattedData
    });
  
    // Return formatted data response from the executed fetch
    return formattedDataResponse;
}
// This function joins the data from the retrieved map and the given results together
// This causes for the countryData in state to contain both the data needed for drawing the svg and the data given to the createVizFunction
// This code was heavily inspired by Giovanni Kaaijk's countTracker function, found at https://github.com/GiovanniKaaijk/frontend-data/blob/master/countTracker.js
export default function(countryArrayFromData, countryData, countryNameArrayFromMap){
    countryArrayFromData.forEach(result => {
        if(countryNameArrayFromMap.includes(result.country)) {
            countryData.forEach((entry) => {
                if(entry.properties.name == result.country){
                  entry.properties = result
                }
            });
        }
    })
    
    return { countryData }
}
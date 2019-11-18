// Function that compares the objects in an array, and returns a new, single array
// Creates array that contains one object per country, contains the categoryWithMostObjects for this country

export default function(results) {
    return results.reduce((newItems, currentItem) => {
        
        // Is there an item that has a country property that's equal to the current item country property?
        const foundItem = newItems.find(item => item.country === currentItem.country)

        // If the country doesn't exist in the new item array, create it as a new object with the necessary properties
        if (!foundItem) {
            const newItem = {
                country: currentItem.country,
                countryGeo: currentItem.countryGeo,
                countryLat: currentItem.countryLat,
                countryLong: currentItem.countryLong,
                categoryWithMostObjects: currentItem.mainCategory,
                objectCountTotal: currentItem.objectCountTotal,
            }

            // Push the new item to the newItems array
            newItems.push(newItem)
        } else if (foundItem.objectCountTotal < currentItem.objectCountTotal) {
            // If the country does exist in the new item array, check if it's mainCategory objectCountTotal is bigger than the one of the country in the array
            // Is it bigger? Replace the categoryWithMostObjects and objectCountTotal
            // Is it smaller? Do nothing, as this means this mainCategory isn't the biggest of the country in question
            foundItem.categoryWithMostObjects = currentItem.mainCategory
            foundItem.objectCountTotal = currentItem.objectCountTotal
        }

        // Return newItems array
        return newItems
    }, [])
}
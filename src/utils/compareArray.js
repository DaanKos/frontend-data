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
                categoryWithMostObjectsObjectCount: currentItem.objectCountTotal,
                categories: [{
                    categoryName: currentItem.mainCategory,
                    categoryObjCount: currentItem.objectCountTotal
                }]
            }

            // Push the new item to the newItems array
            newItems.push(newItem)
        } else if (foundItem.categoryWithMostObjectsObjectCount < currentItem.objectCountTotal) {
            // If the country does exist in the new item array, check if it's mainCategory objectCountTotal is bigger than the one of the country in the array
            // Is it bigger? Replace the categoryWithMostObjects and categoryWithMostObjectsObjectCount
            foundItem.categoryWithMostObjects = currentItem.mainCategory
            foundItem.categoryWithMostObjectsObjectCount = currentItem.objectCountTotal

            // Also add the currentItem's mainCategory to the categories array as an object, containing it's name and objectCountTotal
            foundItem.categories.push({
                categoryName: currentItem.mainCategory,
                categoryObjCount: currentItem.objectCountTotal
            })
        } else {
            // If the country does exist in the new item array, check if it's mainCategory objectCountTotal is bigger than the one of the country in the array
            // Is it smaller? Add the currentItem's mainCategory to the categories array as an object, containing it's name and objectCountTotal
            foundItem.categories.push({
                categoryName: currentItem.mainCategory,
                categoryObjCount: currentItem.objectCountTotal
            })
        }

        // Return newItems array
        return newItems
    }, [])
}
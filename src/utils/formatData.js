// Function that formats the given data
// Uses a parameter to determine what the mainCategory is, and has to be given data (results) which it will format
// Creates a new object structure for every object in the array
// Also combines all entries that have the same country property, resulting in an array which shows the amount of objects for the main category

export default function(mainCategory, results) {
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
            const foundItem = newItems.find(item => item.country === currentItem.countryLabel)

            // If the country doesn't exist in the new item array, create it as a new object with the necessary properties
            if (!foundItem) {
                const newItem = {
                    country: currentItem.countryLabel,
                    countryGeo: currentItem.countryGeo,
                    countryLat: currentItem.countryLat,
                    countryLong: currentItem.countryLong,
                    mainCategory: currentItem.mainCategory,
                    objectCountTotal: currentItem.objectCount
                }

                // Push the new item to the newItems array
                newItems.push(newItem)
            } else {
                // If the country does exist in the new item array, add current item objectCount to objectCountTotal of that item
                foundItem.objectCountTotal = foundItem.objectCountTotal + currentItem.objectCount
            }

            // Return newItems array
            return newItems
		}, [])
}
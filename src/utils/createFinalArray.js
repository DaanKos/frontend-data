import compareArray from "./compareArray";
import combineArrays from "./combineArrays";

export default function createFinalArray() {
    return combineArrays().then(result => {
      console.log("Result given to combine array: ", result);
      let compared = compareArray(result);
      return compared
    })
}
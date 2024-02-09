
export function getType(item: unknown) {
    if (item === null || item === undefined) return 'null';
    if (Array.isArray(item)) return 'Array';
    if (item instanceof Date) return 'Date';
    if (typeof item === 'object') return 'object';
    return typeof item;
}
   
export function getCommonType(list) {
    const types = list.map(getType)
    const uniqueTypes = new Set(types)
  
  
    if (uniqueTypes.size === 1) {
      // return types[0];
      return [...uniqueTypes][0];
    }

    uniqueTypes.delete("null")
  
    // console.log("getCommonType", [...uniqueTypes][0])
    if (uniqueTypes.size === 1) {
      // return types[0];
      return [...uniqueTypes][0];
    }
  
    // Logique pour déterminer le type commun dans une liste mixte
    if (uniqueTypes.has('object') || uniqueTypes.has('Array') || uniqueTypes.has('Date')) {
      return 'object';
    }

    // if (uniqueTypes.has('string')) {
    //   return 'string'; // String est le plus flexible pour les types primitifs
    // }
    
    if (uniqueTypes.has('number') && uniqueTypes.has('boolean')) {
      return 'number'; // Number peut être approprié pour les mélanges de nombres et de booléens
    }
  
    return 'string'
}
  
// console.log(getCommonType([1, 2, 3])); // 'number'
// console.log(getCommonType(['a', 'b', 'c'])); // 'string'
// console.log(getCommonType([new Date(), new Date()])); // 'date'
// console.log(getCommonType([1, 'a', true])); // 'string'
// console.log(getCommonType([{}, 123])); // 'object'
// console.log(getCommonType([true, false])); // 'boolean'
// console.log(getCommonType([1, true])); // 'number'
// console.log(getCommonType([[], {}])); // 'object'
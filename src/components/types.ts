import { normalize as normalizeString } from "../utils/string"

//#region Generic
type GenericOrDictOfGeneric<T> = T | { [key: string]: GenericOrDictOfGeneric<T> }

export type ID = string

export type DatatablePropertyId = string | { propId: ID, [key: string]: DatatablePropertyId }

export type StyleProps = string | { [style: string]: string } | StyleSheet
export type ClassProps = string | Array<string> | { [classname: string]: boolean }
//#endregion

//#region Colonnes
export type DatatableColumnCellOptions = {
    text?: null | string | Function // le text qui s'affiche dans la cellule
    displaySort?: null | boolean
    displayExpanse?: null | boolean
    displaySelect?: null | boolean
    justify?: 'start'|'end'|'center'|'space-between'|'space-around'|'space-evenly'
    align?: 'start'|'end'|'center'|'baseline'|'stretch'
    prefix?: string
    suffix?: string
    cols?: string
}

export class DatatableColumn {
    id?: null | ID // Column Id
    property?: null | string // The property name of each row to use
    
    header: DatatableColumnCellOptions = { displaySort: true, displayExpanse: true, displaySelect: true} // options 
    footer: DatatableColumnCellOptions = { displaySort: false, displayExpanse: false, displaySelect: false }
    body: DatatableColumnCellOptions = { text: (val : string | number) => val, displaySelect: true, displayExpanse: true } 

    columnStyle: StyleProps | Function = {} // le style pour toute la colonne
    headerStyle: StyleProps | Function = {} // le style pour le header de la colonne
    footerStyle: StyleProps | Function = {} // le style pour le footer de la colonne
    bodyStyle: StyleProps | Function = {} // le style pour les cellules de la colonne

    columnClass:  ClassProps | Function = [] // les class pour toute la colonne
    headerClass: ClassProps | Function = [] // les class pour le header de la colonne
    footerClass: ClassProps | Function = [] // les class pour le footer de la colonne
    bodyClass: ClassProps | Function = [] // les class pour les cellules de la colonne
    
    draggable: boolean = false
    resizable: boolean = false

    // la manière de trier les lignes par cette colonne :
    sort: boolean // pour activer ou désactiver le trie par la colonne
        | Function // pour définir la manière de trier la colonne (lambda de la fonction sort)
    = true 

    // pour définir si le filtrage fonctionne sur les valeurs de cette colonne 
    filter: boolean // pour activer ou désactiver le filtrage sur la colonne
        | Function // activer en définissant la fonction lambda, args : filter (string de recherche), valeur (any)
        | Array<{ label: string, method: Function }>
        // Voir pour mettre un objet avec le type de valeur 
    = true 
    // Voir pour avoir un filtre complexe sur chaque en-tête et faire une recherche en profondeur dans les tableaux imbriqués

    // pour définir si comment grouper sur les valeurs de cette colonne :
    group: boolean // pour activer le groupement
        | Function // pour activer le groupement en définissant la manière dont le groupement s'opere (fonction executée sur chaque ligne retournant la valeur du groupe pour la ligne)
    = false 

    selection: { // pour permettre de selectionne des lignes avec une checkbox depuis cette colonne :
        single?: boolean,  // pour qu'une seule ligne puisse etre sélectionnée à la fois
        global?: boolean // pour avoir dans le header un bouton permettant de tout sélectionner/désélectionner
    } | null = null 

    expansion: GenericOrDictOfGeneric<{  // pour permettre de configurer l'expension des lignes depuis cette colonne :
        single?: boolean, // pour qu'une seule ligne puisse etre etendu à la fois
        global?: boolean, // pour avoir dans le header un bouton permettant de tout étendre/réduire
        text?: null | string | Function, // le contenu de l'extension (si pas de datatable imbriqué)
        property?: string, // la propriété contenant le sous-datatable
        columns?: null | Partial<DatatableColumn>[], // de la même forme que ce header si c'est un sous-datable
        props?: object,  // l'ensemble des props à passer au sous-datatable (à voir comment gérer avec $attrs)  | anciennement "options",
        style?: StyleProps | Function,
        class?: ClassProps | Function,
    }> | null = null 

    // divider: boolean | null = false // pour ajouter une barre de séparation avec la colonne de droite
    dividerLeft: boolean = false // pour ajouter une barre de séparation avec la colonne de gauche
    dividerRight: boolean = false // pour ajouter une barre de séparation avec la colonne de droite

    sticky: "right" | "left" | null | { 
        position: "right" | "left" | null, 
        zIndex?: number | undefined, 
        distance?: number | string  
    } = null // la position ("right" ou "left") pour mettre une position sticky null sinon
    
    hidden: boolean
}
//#endregion

//#region Cells
export type DatatableCell = string | number | boolean | Date | Object | Array<any>
//#endregion

//#region Rows
// export type DatatableRow = {
export class DatatableRow {
    [property: string]: DatatableCell | {
        value: DatatableCell,
        rows: Array<DatatableRow>
    }
    style: StyleProps | Function = {}
    class: ClassProps | Function = []
    sticky: "top" | "bottom" | null | { 
        position: "top" | "bottom" | null, 
        zIndex?: number | undefined, 
        distance?: number | string  
    } = null 
}
// let test: DatatableRow = { yolo:"yolo", nb: 125, test: false, embeded: { value: 12, rows: [{ sub:"row", val: 89 }] } }
//#endregion

//#region Sort
export class DatatableColumnSort {
    // column?: string
    sorted?: boolean = false
    desc?: boolean = false
    expansion?: null | DatatableSort
    position?: number = 0
}
export type DatatableSort = { [column: string]: DatatableColumnSort } // Array<DatatableColumnSort>
// let test: DatatableSort = [{column:"yolo"}, {column:"embeded", desc: false, expansion: [{ column: "lol", desc: true}] }, {column:"don't sort", sorted: false, expansion: [{ column: "lol", desc: true}] }]
//#endregion

//#region Group
export class DatatableColumnGroup {
    column?: string
    grouped?: boolean = false
    expansion?: null | DatatableGroup
}
export type DatatableGroup = Array<DatatableColumnGroup>
//#endregion

//#region Filter
export class DatatableColumnFilter {
    // column?: string
    method?: null | (keyof typeof filtersLabels) = "Equals" // | Function = (a: DatatableCell , b: DatatableCell ) => a == b
    value?: any
    expansion?: null | DatatableFilter
}
export type DatatableFilter = Function |  { [column: string]: Function | DatatableColumnFilter } // Array<DatatableColumnFilter>

export type DatatableFilterValueType = null | "boolean" | "number" | "string" | "Date" | "object" | "Array"
export const filtersFunctions = {
    
    it(value: unknown) {
        return !!value
    },
    in(value: unknown) {
        return value === null || value === undefined
    },

    eq(value: unknown, comparison: unknown) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true
        
        if (typeof value === "string" && typeof comparison === "string")
            return normalizeString(value) == normalizeString(comparison)

        // if (typeof value === "number") 
        return value == comparison

        throw new Error(`"Equals" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },

    gt(value: unknown, comparison: any) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true

        if (typeof value === "number") return value > comparison

        return false
        throw new Error(`"Greate Than" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },
    ge(value: unknown, comparison: any) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true

        if (typeof value === "number") return value >= comparison
        
        return false
        throw new Error(`"Greater Than or Equals" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },

    lt(value: unknown, comparison: any) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true

        if (typeof value === "number") return value < comparison
        
        return false
        throw new Error(`"Less Than" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },
    le(value: unknown, comparison: any) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true

        if (typeof value === "number") return value <= comparison
        
        return false
        throw new Error(`"Less Than or Equals" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },

    be(value: unknown, min: number, max: number) {
        // if (filtersFunctions.in(min) || min === "" || filtersFunctions.in(max) || max === "") return true

        if (typeof value === "number") return filtersFunctions.ge(value, min) && filtersFunctions.le(value, max)

        return false
    },

    includes(value: unknown, comparison: unknown) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true

        if (typeof value === "string" && typeof comparison === "string")
            return normalizeString(value).includes(normalizeString(comparison))
        if (typeof value === "number" && typeof comparison === "string")
            return normalizeString(String(value)).includes(normalizeString(comparison))

        return false
        throw new Error(`"Includes"/"Contains" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },

    sw(value: unknown, comparison: string) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true

        if (typeof value === "string" && typeof comparison === "string")
            return normalizeString(value).startsWith(normalizeString(comparison))
    
        return false
        throw new Error(`"Starts Width" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },
    ew(value: unknown, comparison: string) {
        // if (filtersFunctions.in(comparison) || comparison === "") return true

        if (typeof value === "string" && typeof comparison === "string")
            return normalizeString(value).endsWith(normalizeString(comparison))

        return false
        throw new Error(`"Starts Width" filter not implemented for ${value} typeof ${typeof value === "object" ? value?.constructor?.name : typeof value}`)
    },    

    match(value: unknown, comparison: string) {
        if (filtersFunctions.in(comparison) || comparison === "") return true

        try {
            const regex = new RegExp(comparison);
            const stringValue = String(value);
            return regex.test(stringValue);
        } catch (error) {
            return false
            throw new Error("Match Regex not implemented")
        }
    },

}
function filterComparisonIsDefined(comparison) {
    return comparison !== null && comparison !== undefined && comparison !== ""
}
export const filtersLabels = {
    "No filter": null, //() => true,
    
    "True": (...args: any[]) => filtersFunctions.it(args[0]),
    "False": (...args: any[]) => !filtersFunctions.it(args[0]),

    "Equals": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.eq(args[0], args[1]) : true,
    "Not equals": (...args: any[]) => filterComparisonIsDefined(args[1]) ? !filtersFunctions.eq(args[0], args[1]) : true,

    "Greater Than": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.gt(args[0], args[1]) : true,
    "Greater Than or Equal": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.ge(args[0], args[1]) : true,

    "Less Than": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.lt(args[0], args[1]) : true,
    "Less Than or Equal": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.le(args[0], args[1]) : true,

    "Between": (...args: any[]) => filterComparisonIsDefined(args[1]) && filterComparisonIsDefined(args[2]) ? filtersFunctions.be(args[0], args[1], args[2]) : true,

    "Is Null": (...args: any[]) => filtersFunctions.in(args[0]),
    "Not Null": (...args: any[]) => !filtersFunctions.in(args[0]),

    "Contains": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.includes(args[0], args[1]) : true,
    "Doesn't Contain": (...args: any[]) => filterComparisonIsDefined(args[1]) ? !filtersFunctions.includes(args[0], args[1]) : true,

    "Starts With": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.sw(args[0], args[1]) : true,
    "Doesn't start With": (...args: any[]) => filterComparisonIsDefined(args[1]) ? !filtersFunctions.sw(args[0], args[1]) : true,
    "Ends With": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.ew(args[0], args[1]) : true,
    "Doesn't end With": (...args: any[]) => filterComparisonIsDefined(args[1]) ? !filtersFunctions.ew(args[0], args[1]) : true,

    "Corresponds Regex": (...args: any[]) => filterComparisonIsDefined(args[1]) ? filtersFunctions.match(args[0], args[1]) : true,
}
export type DatatableFilterLabel = keyof typeof filtersLabels
export const filtersLabelsForTypes: { [key in DatatableFilterValueType]: DatatableFilterLabel[] } = {
    "boolean": ["No filter", "True", "False", ],
    "number": ["No filter", "Contains", "Doesn't Contain", "Equals", "Not equals", "Greater Than", "Greater Than or Equal", "Less Than", "Less Than or Equal", ],
    "string": ["No filter", "Contains", "Doesn't Contain", "Equals", "Not equals", "Starts With", "Doesn't start With", "Ends With", "Doesn't end With", "Corresponds Regex",  "True", "False" ],
    "object": ["No filter", "True", "False", "Is Null", "Not Null", ],
    "Date": ["No filter", "Is Null", "Not Null", "Equals", "Not equals", "Greater Than", "Greater Than or Equal", "Less Than", "Less Than or Equal", ],
    "Array": ["No filter"]
}
export const defaultFilterForType: { [key in DatatableFilterValueType]?: DatatableFilterLabel } = {
    // "boolean": "No filter",
    "number": "Contains",
    "string": "Contains",
    // "object": "No filter",
    // "Date": "Equals"
}
//#endregion

//#region Expand
export type DatatableExpansion = { [key: string]: GenericOrDictOfGeneric<Array<string> | boolean> } //GenericOrDictOfGeneric<Array<string>>
// let test: DatatableExpansion = { "col1": ["row1", "rwo2"], "col2" : { col2_1 : [ "row2-1", "row2-2" ], col2_2: true, col2_3: false }}
//#endregion

//#region Select
// export type DatatableSelection = { [key: string]: GenericOrDictOfGeneric<Array<string> | boolean> } //GenericOrDictOfGeneric<Array<string>>
// let test: DatatableSelection = { "col1": ["row1", "rwo2"], "col2" : { col2_1 : [ "row2-1", "row2-2" ], col2_2: true, col2_3: { "col2_3-1": true } }}
export class DatatableColumnSelection {
    column?: string
    selected?: Array<ID>
    expansion?: null | DatatableSelection
}
export type DatatableSelection = Array<string> | Array<DatatableColumnSelection> //GenericOrDictOfGeneric<Array<string>>
// let test: DatatableSelection = [ { column: "col2", selected: ["row1", "row2"], expansion: [] } ]
//#endregion

//#region Sticky
export type DatatableSticky = { header: boolean, footer: boolean }
//#endregion

//#region Dividers
export type DatatableDividers = boolean | { header?: boolean | string, footer?: boolean | string, body?: boolean | string }
//#endregion 

//#region Pagination
export type DatatablePagination = boolean | {}
//#endregion

//#region Draggable
export type DatatableDraggable = boolean | { rows?: boolean, columns?: boolean } & { [key: string]: DatatableDraggable }
// let test: DatatableDraggable = { columns: true, "col2": true, "col4" : { "col4-2": { rows: true } } }
//#endregion

//#region Resizable
export type DatatableResizable = boolean | { rows?: boolean, columns?: boolean } & { [key: string]: DatatableResizable }
// let test: DatatableResizable = { columns: true, "col2": true, "col4" : { "col4-2": { rows: true } } }
//#endregion

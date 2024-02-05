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
    id?: null | ID // l'id de la colonne
    property?: null | string // la propriété de chaque row à utiliser dans la cellule
    
    header: DatatableColumnCellOptions = { displaySort: true, displayExpanse: true, displaySelect: true, /*header: true*/ } // options de la cellule de la colonne dans le header
    footer: DatatableColumnCellOptions = { displaySort: false, displayExpanse: false, displaySelect: false, /*header: true*/ } // options de la cellule de la colonne dans le header
    body: DatatableColumnCellOptions = { text: (val : string | number) => val, displaySelect: true, displayExpanse: true } // options des cellules de la colonne dans le body

    columnStyle: StyleProps = {} // le style pour toute la colonne
    headerStyle: StyleProps = {} // le style pour le header de la colonne
    footerStyle: StyleProps = {} // le style pour le footer de la colonne
    bodyStyle: StyleProps = {} // le style pour les cellules de la colonne

    columnClass:  ClassProps = [] // les class pour toute la colonne
    headerClass: ClassProps = [] // les class pour le header de la colonne
    footerClass: ClassProps = [] // les class pour le footer de la colonne
    bodyClass: ClassProps = [] // les class pour les cellules de la colonne
    
    draggable: boolean = false
    resizable: boolean = false

    // la manière de trier les lignes par cette colonne :
    sort: boolean // pour activer ou désactiver le trie par la colonne
        | Function // pour définir la manière de trier la colonne (lambda de la fonction sort)
    = true 

    // pour définir si le filtrage fonctionne sur les valeurs de cette colonne 
    filter: boolean // pour activer ou désactiver le filtrage sur la colonne
        | Function // activer en définissant la fonction lambda, args : filter (string de recherche), valeur (any)
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
        props?: object  // l'ensemble des props à passer au sous-datatable (à voir comment gérer avec $attrs)  | anciennement "options"
    }> | null = null 

    // divider: boolean | null = false // pour ajouter une barre de séparation avec la colonne de droite
    dividerLeft: boolean = false // pour ajouter une barre de séparation avec la colonne de gauche
    dividerRight: boolean = false // pour ajouter une barre de séparation avec la colonne de droite

    sticky: "right" | "left" | null | { 
        position?: "right" | "left" | null, 
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
export type DatatableRow = {
    [property: string]: DatatableCell | {
        value: DatatableCell,
        rows: Array<DatatableRow>
    },
    style?: StyleProps,
    class?: ClassProps,
}
// let test: DatatableRow = { yolo:"yolo", nb: 125, test: false, embeded: { value: 12, rows: [{ sub:"row", val: 89 }] } }
//#endregion

//#region Sort
export class DatatableColumnSort {
    column?: string
    sorted?: boolean = false
    desc?: boolean = false
    expansion?: null | DatatableSort
}
export type DatatableSort = Array<DatatableColumnSort>
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
    column?: string
    method?: null | Function = (a: DatatableCell , b: DatatableCell ) => a == b
    value?: DatatableCell
    expansion?: null | DatatableColumnFilter
}
export type DatatableFilter = DatatableCell | Array<DatatableColumnFilter>

export const filterFunctions = {
    
    eq(value, comparison) {
        if (typeof value === "number") return value === comparison
        
        throw new Error(`"Equals" filter not implemented for ${value} typeof ${typeof value === "object" ? value.constructor.name : typeof value}`)
    },

    gt(value, comparison) {
        if (typeof value === "number") return value > comparison
        
        throw new Error(`"Greate Than" filter not implemented for ${value} typeof ${typeof value === "object" ? value.constructor.name : typeof value}`)
    },
    ge(value, comparison) {
        if (typeof value === "number") return value >= comparison
        
        throw new Error(`"Greater Than or Equals" filter not implemented for ${value} typeof ${typeof value === "object" ? value.constructor.name : typeof value}`)
    },

    lt(value, comparison) {
        if (typeof value === "number") return value < comparison
        
        throw new Error(`"Less Than" filter not implemented for ${value} typeof ${typeof value === "object" ? value.constructor.name : typeof value}`)
    },
    le(value, comparison) {
        if (typeof value === "number") return value <= comparison
        
        throw new Error(`"Less Than or Equals" filter not implemented for ${value} typeof ${typeof value === "object" ? value.constructor.name : typeof value}`)
    },

    in(value) {
        return value === null || value === undefined
    },

    includes(value, comparison) {
        return comparison.includes(value)
    },

    sw(value, comparison: string) {
        return comparison.startsWith(value)
    },
    ew(value, comparison: string) {
        return comparison.endsWith(value)
    }

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
export type DatatableDividers = { header?: boolean, footer?: boolean, body?: boolean } | boolean
//#endregion 

//#region Pagination
export type DatatablePagination = boolean | {}
//#endregion

//#region Draggable
export type DatatableDraggable = boolean | { rows?: boolean, columns?: boolean } & { [key: string]: DatatableDraggable }
// let test: DatatableDraggable = { columns: true, "col2": true, "col4" : { "col4-2": { rows: true } } }
//#endregion

//#region Draggable
export type DatatableResizable = boolean | { rows?: boolean, columns?: boolean } & { [key: string]: DatatableResizable }
// let test: DatatableResizable = { columns: true, "col2": true, "col4" : { "col4-2": { rows: true } } }
//#endregion

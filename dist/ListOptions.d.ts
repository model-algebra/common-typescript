import type { ArgumentType, Filterable, ModelFilter, Op, Sortable, SortDefinition, SortKey } from "./Model.js";
/** The parts of a model the options come from; Model and models in JSON form have them. */
export interface ListModel {
    metadata: {
        name: string;
    };
    fields: Array<{
        name: string;
        type: string;
        parameters?: Record<string, any>;
        sortable?: Sortable;
        filterable?: Filterable;
    }>;
    sortings?: Record<string, SortKey[]>;
    filters?: Record<string, ModelFilter>;
}
export interface SortOption {
    /** Key in sort parameters. */
    key: string;
    /** Directions records can be sorted in by this key. */
    directions: Array<'asc' | 'desc'>;
    /** For a sortable field: the field, the name of its definition ('' if unnamed) and the definition. */
    field?: string;
    definitionName?: string;
    definition?: SortDefinition;
    /** For a sort order of the model: its keys. */
    sortKeys?: SortKey[];
}
export interface FilterOption {
    /** Name of the filter parameter. */
    name: string;
    /** 'value': the client gives a value; 'switch': the client only switches the filter on. */
    input: 'value' | 'switch';
    /** Field filters, and rules of the model: the field the filter is about. */
    field?: string;
    /** Field filters: the name of the definition ('' if unnamed). Filters of the model: their name. */
    definitionName: string;
    /** Comparison: operator, and the fixed value or the other field it compares with, if any. */
    op?: Op;
    value?: unknown;
    otherField?: string;
    /** Compare function(value, row) instead of the value. */
    function?: string;
    /** predicate(value, row[, argument]) for fields, predicate(row[, argument]) for the model. */
    predicate?: string;
    /** Type of the value the client gives: 'field' for one of the field's type. */
    valueType?: 'field' | ArgumentType;
    scope: 'field' | 'model';
}
export declare const OP_NAMES: Record<Op, string>;
/** Names list parameters have or may have, which filters can't take. */
export declare const RESERVED_PARAMETERS: string[];
/** The ways records of the model can be sorted. */
export declare function sortOptions(model: ListModel): SortOption[];
/** The filters of the model's records: one per parameter. */
export declare function filterOptions(model: ListModel): FilterOption[];
//# sourceMappingURL=ListOptions.d.ts.map
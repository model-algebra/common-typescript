export declare class Metadata {
    name: string;
    version: string;
    schema?: string;
    description?: string;
    constructor(data: any);
}
/** Target-specific options keyed by target name (e.g. "postgresql"); ignored by other targets. */
export type Targets = Record<string, Record<string, any>>;
/** Comparison operator of rules and filters. */
export type Op = "=" | "!=" | "<" | "<=" | ">" | ">=";
/** Comparison of a field with a literal value or with another field. */
export interface Rule {
    field: string;
    op: Op;
    value?: any;
    otherField?: string;
}
/** Constraint spanning one or more fields of the model. */
export interface TableConstraint {
    name: string;
    type: "primaryKey" | "unique" | "check";
    fields?: Array<string>;
    rule?: Rule;
}
export interface Index {
    name: string;
    fields: Array<string>;
    unique?: boolean;
    where?: Rule;
    targets?: Targets;
}
/** How records can be sorted by a field: by the value, or by function(value, row). */
export interface SortDefinition {
    function?: string;
    /** Directions clients may sort in (default: both). */
    direction?: "asc" | "desc" | "both";
    nulls?: "first" | "last";
}
/** Type of the value a client gives a predicate, as fields declare types. */
export interface ArgumentType {
    type: string;
    parameters?: Record<string, any>;
}
/**
 * How records can be filtered by a field. One of:
 * - op: compare the value (or function(value, row)) with the value the client gives, or with value or otherField;
 * - ops: the same, with an operator the client chooses;
 * - predicate: keep records for which predicate(value, row) is true, or predicate(value, row, argument) with an argument
 *   the client gives; argument true means a value of the field's type.
 */
export interface FilterDefinition {
    op?: Op;
    ops?: Op[];
    value?: any;
    otherField?: string;
    function?: string;
    predicate?: string;
    argument?: true | ArgumentType;
}
/** true for the default, one definition, or named definitions. */
export type Sortable = boolean | SortDefinition | Record<string, SortDefinition>;
export type Filterable = boolean | FilterDefinition | Record<string, FilterDefinition>;
/** One key of a sort order: a field, a function of the whole record, or function(value, row) of a field. */
export interface SortKey {
    field?: string;
    function?: string;
    /** Default: asc. */
    direction?: "asc" | "desc";
    nulls?: "first" | "last";
}
/** A named filter of a model: a rule, or a predicate of the whole record, predicate(row) or predicate(row, argument). */
export type ModelFilter = Rule | {
    predicate: string;
    argument?: ArgumentType;
};
export declare class Constraint {
    readonly name: string;
    readonly value: any;
    constructor(name: string, value: any);
}
export declare class Field {
    name: string;
    type: string;
    description?: string;
    parameters?: Record<string, any>;
    constraints: Array<Constraint>;
    targets?: Targets;
    sortable?: Sortable;
    filterable?: Filterable;
    constructor(data: any);
    static fromJSON(data: any): Field;
}
export declare class Model {
    metadata: Metadata;
    fields: Array<Field>;
    constraints: Array<TableConstraint>;
    indexes: Array<Index>;
    /** Named sort orders. */
    sortings?: Record<string, SortKey[]>;
    /** Named filters. */
    filters?: Record<string, ModelFilter>;
    constructor(data: any);
    static fromJSON(data: any): Model;
    static fromJsonString(jsonString: string): Model;
}
//# sourceMappingURL=Model.d.ts.map
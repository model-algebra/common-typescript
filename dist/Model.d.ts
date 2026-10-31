export declare class Metadata {
    name: string;
    version: string;
    schema?: string;
    description?: string;
    constructor(data: any);
}
/** Target-specific options keyed by target name (e.g. "postgresql"); ignored by other targets. */
export type Targets = Record<string, Record<string, any>>;
/** Comparison of a field with a literal value or with another field. */
export interface Rule {
    field: string;
    op: "=" | "!=" | "<" | "<=" | ">" | ">=";
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
    constructor(data: any);
    static fromJSON(data: any): Field;
}
export declare class Model {
    metadata: Metadata;
    fields: Array<Field>;
    constraints: Array<TableConstraint>;
    indexes: Array<Index>;
    constructor(data: any);
    static fromJSON(data: any): Model;
    static fromJsonString(jsonString: string): Model;
}
//# sourceMappingURL=Model.d.ts.map
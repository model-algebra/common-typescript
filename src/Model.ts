/* Classes to store data model. Example of model in json format:
{
    "metadata": {
        "name": "User",
        "version": "1.0.0"
    },
    "fields": [
        {
            "name": "id",
            "type": "integer",
            "description": "Main index",
            "constraints": {
                "primaryKey": true,
                "nullable": false
            }
        },
        {
            "name": "userName",
            "type": "string",
            "description": "Login name",
            "constraints": {
                "nullable": false
            }
        },
        {
            "name": "firstName",
            "type": "string",
            "description": "First name",
            "constraints": {
                "nullable": false
            }
        },
        {
            "name": "secondName",
            "type": "string",
            "description": "Second name"
        }
    ]
}
*/

export class Metadata {
    name: string;
    version: string;
    schema?: string;
    description?: string;

    constructor(data: any) {
        this.name = data.name;
        this.version = data.version;
        this.schema = data.schema;
        this.description = data.description;
    }
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

export class Constraint {
    constructor(public readonly name: string, public readonly value: any) {}
}

export class Field {
    name: string;
    type: string;
    description?: string;
    parameters?: Record<string, any>;
    constraints: Array<Constraint>;
    targets?: Targets;

    constructor(data: any) {
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        this.parameters = data.parameters;
        this.constraints = data.constraints;
        this.targets = data.targets;
    }

    public static fromJSON(data: any): Field {
        const constraints: Array<Constraint> = [];
        if (data.constraints) {
            for (const [key, value] of Object.entries(data.constraints)) {
                constraints.push(new Constraint(key, value));
            }
        }
        return new Field({
            name: data.name,
            type: data.type,
            description: data.description,
            parameters: data.parameters,
            constraints: constraints,
            targets: data.targets
        });
    }
}

export class Model {
    metadata: Metadata;
    fields: Array<Field>;
    constraints: Array<TableConstraint>;
    indexes: Array<Index>;

    constructor(data: any) {
        this.metadata = data.metadata;
        this.fields = data.fields;
        this.constraints = data.constraints ?? [];
        this.indexes = data.indexes ?? [];
    }

    public static fromJSON(data: any): Model {
        const metadata = new Metadata(data.metadata);
        const fields: Array<Field> = data.fields.map((fieldData: any) => Field.fromJSON(fieldData));
        return new Model({
            metadata: metadata,
            fields: fields,
            constraints: data.constraints,
            indexes: data.indexes
        });
    }

    public static fromJsonString(jsonString: string): Model {
        const data = JSON.parse(jsonString);
        return Model.fromJSON(data);
    }
}
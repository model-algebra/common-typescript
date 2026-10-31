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
const withoutUndefined = (value) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
export class Metadata {
    name;
    version;
    schema;
    description;
    /** Keys the model format doesn't define, e.g. those of bridges, are kept as they are. */
    constructor(data) {
        Object.assign(this, data);
    }
    toJSON() {
        return withoutUndefined({ ...this });
    }
}
export class Constraint {
    name;
    value;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
export class Field {
    name;
    type;
    description;
    parameters;
    constraints;
    targets;
    sortable;
    filterable;
    /** Keys the model format doesn't define, e.g. form options of a UI bridge, are kept as they are. */
    constructor(data) {
        Object.assign(this, data);
    }
    static fromJSON(data) {
        const constraints = [];
        if (data.constraints) {
            for (const [key, value] of Object.entries(data.constraints)) {
                constraints.push(new Constraint(key, value));
            }
        }
        return new Field({ ...data, constraints });
    }
    /** The JSON form: constraints as a map, without empty values. */
    toJSON() {
        const constraints = Object.fromEntries((this.constraints ?? []).map(constraint => [constraint.name, constraint.value]));
        return withoutUndefined({ ...this, constraints: Object.keys(constraints).length > 0 ? constraints : undefined });
    }
}
export class Model {
    metadata;
    fields;
    constraints;
    indexes;
    /** Named sort orders. */
    sortings;
    /** Named filters. */
    filters;
    /** Keys the model format doesn't define, e.g. form options of a UI bridge, are kept as they are. */
    constructor(data) {
        Object.assign(this, data);
        this.constraints = data.constraints ?? [];
        this.indexes = data.indexes ?? [];
    }
    static fromJSON(data) {
        return new Model({
            ...data,
            metadata: new Metadata(data.metadata),
            fields: data.fields.map((fieldData) => Field.fromJSON(fieldData)),
        });
    }
    /** The JSON form, which Model.fromJSON() reads back; JSON.stringify(model) gives it too. */
    toJSON() {
        return withoutUndefined({
            ...this,
            metadata: this.metadata instanceof Metadata ? this.metadata.toJSON() : this.metadata,
            fields: this.fields.map(field => field instanceof Field ? field.toJSON() : field),
            constraints: this.constraints.length > 0 ? this.constraints : undefined,
            indexes: this.indexes.length > 0 ? this.indexes : undefined,
        });
    }
    static fromJsonString(jsonString) {
        const data = JSON.parse(jsonString);
        return Model.fromJSON(data);
    }
}
//# sourceMappingURL=Model.js.map
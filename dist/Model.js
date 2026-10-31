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
    name;
    version;
    schema;
    description;
    constructor(data) {
        this.name = data.name;
        this.version = data.version;
        this.schema = data.schema;
        this.description = data.description;
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
    constructor(data) {
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        this.parameters = data.parameters;
        this.constraints = data.constraints;
        this.targets = data.targets;
    }
    static fromJSON(data) {
        const constraints = [];
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
    metadata;
    fields;
    constraints;
    indexes;
    constructor(data) {
        this.metadata = data.metadata;
        this.fields = data.fields;
        this.constraints = data.constraints ?? [];
        this.indexes = data.indexes ?? [];
    }
    static fromJSON(data) {
        const metadata = new Metadata(data.metadata);
        const fields = data.fields.map((fieldData) => Field.fromJSON(fieldData));
        return new Model({
            metadata: metadata,
            fields: fields,
            constraints: data.constraints,
            indexes: data.indexes
        });
    }
    static fromJsonString(jsonString) {
        const data = JSON.parse(jsonString);
        return Model.fromJSON(data);
    }
}
//# sourceMappingURL=Model.js.map
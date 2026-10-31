# model-algebra-common

TypeScript classes of [model-algebra](https://github.com/model-algebra/model-algebra) models, and the interfaces of
bridges, shared by the TypeScript projects (ddl-bridge-typescript, typescript-bridge, vuetify-bridge and
model-algebra-typescript).

## Installation

```sh
pnpm add github:model-algebra/common-typescript
```

The built package is in the repository, so nothing is built when it is installed.

## Models

```ts
import { Model, ModelSet } from 'model-algebra-common'

const user = Model.fromJSON(json)           // or Model.fromJsonString(text)
user.metadata.name                          // 'User'
user.fields[0].constraints                  // Constraint objects: { name: 'primaryKey', value: true }
```

| Class or type | |
|---|---|
| `Model` | `metadata`, `fields`, table `constraints` and `indexes` |
| `Metadata` | `name`, `version`, `schema`, `description` |
| `Field` | `name`, `type`, `description`, `parameters`, `constraints`, `targets` |
| `Constraint` | One field constraint: `name` and `value` |
| `TableConstraint` | A `primaryKey`, `unique` or `check` constraint over the fields |
| `Rule` | A comparison of a field with a value or another field, for checks and partial indexes |
| `Index` | `name`, `fields`, `unique`, `where`, `targets` |
| `Targets` | Options for one target only, e.g. `{ postgresql: { type: 'CITEXT' } }` |
| `Sortable`, `SortDefinition` | `Field.sortable`: how records can be sorted by the field |
| `Filterable`, `FilterDefinition`, `ArgumentType` | `Field.filterable`: how records can be filtered by the field |
| `SortKey`, `ModelFilter` | `Model.sortings` and `Model.filters`: named sort orders and filters |

`Model.fromJSON()` reads field constraints into `Constraint` objects. `new Model(json)` keeps the JSON as it is, with
constraints as a map. The bridges accept both.

Keys the format doesn't define are kept, on the model, its metadata and its fields, so models can carry what a bridge
needs (the form options of vuetify-bridge, for example). `model.toJSON()` gives the JSON form back, with constraints
as a map and without empty values; `JSON.stringify(model)` uses it, and `Model.fromJSON(model.toJSON())` is the same
model.

The format itself is described in [model-schema](https://github.com/model-algebra/model-schema).

### Sorting and filtering

`sortable` and `filterable` take `true`, one definition, or named definitions (see
[model-schema](https://github.com/model-algebra/model-schema#sorting-and-filtering)). These helpers give named
definitions in every case; the one definition of `true` or of an unnamed definition is named `''`:

```ts
import { filterDefinitions, sortDefinitions } from 'model-algebra-common'

sortDefinitions(true)                                 // { '': {} }
sortDefinitions({ function: 'lower' })                // { '': { function: 'lower' } }
filterDefinitions(true)                               // { '': { op: '=' } }
filterDefinitions({ eq: { op: '=' }, prefix: { predicate: 'startsWith', argument: true } })   // as given
```

`sortOptions()` and `filterOptions()` list the ways a model's records can be sorted and filtered, with the names that
APIs and user interfaces use for them, so that bridges agree:

```ts
sortOptions(model).map(o => o.key)       // ['lastName.plain', 'lastName.caseless', 'age', 'byName']
filterOptions(model).map(o => o.name)    // ['lastName.prefix', 'age.gte', 'age.lte', 'status.active', 'adults']
```

A field's unnamed definition takes the field's name, named ones `<field>.<name>`, filters with operators the client
chooses `<name>.eq`, `.ne`, `.lt`, `.lte`, `.gt`, `.gte`; sort orders and filters of the model keep their names. Each
filter option says whether the client gives a value (`input: 'value'`, of `valueType`) or only switches it on
(`'switch'`). Names given twice, or names of unknown fields, are errors.

### Sets of models

A `ModelSet` holds related models, such as the tables of one database, by their unique names:

```ts
const shop = ModelSet.fromJSON([userJson, orderJson, productJson])

shop.get('Order')        // the model, or undefined
shop.names               // ['User', 'Order', 'Product']
for (const model of shop) { ... }
```

## Bridges

A bridge converts models to a target format and, where it can, back:

```ts
interface ModelBridge<M, T> {
    toTarget(model: M): T
    toModel(target: T): M
}

interface ModelSetBridge<T> {
    toTarget(models: ModelSet): T
    toModel(target: T): ModelSet
}
```

For example, `DdlBridge` of [ddl-bridge-typescript](https://github.com/model-algebra/ddl-bridge-typescript) converts a
model to `CREATE TABLE` and back, and `DdlSetBridge` does the same for the DDL of a whole database schema.

## Development

```sh
pnpm install
pnpm test
pnpm type-check
pnpm build
```

`dist/` is committed, because other projects install the package from GitHub without building it. Enable the
pre-commit hook once per clone; it rebuilds `dist/` and adds it to every commit that changes the sources:

```sh
git config core.hooksPath .githooks
```

CI fails when the committed `dist/` differs from a build of the sources.

## License

MIT

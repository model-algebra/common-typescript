import { filterDefinitions, sortDefinitions } from "./Query.js";
export const OP_NAMES = { '=': 'eq', '!=': 'ne', '<': 'lt', '<=': 'lte', '>': 'gt', '>=': 'gte' };
/** Names list parameters have or may have, which filters can't take. */
export const RESERVED_PARAMETERS = ['limit', 'offset', 'sort'];
const optionKey = (field, name) => name === '' ? field : `${field}.${name}`;
function checkField(model, name, where) {
    if (!model.fields.some(field => field.name === name))
        throw new Error(`${where} of model ${model.metadata.name} names unknown field ${name}`);
}
/** The ways records of the model can be sorted. */
export function sortOptions(model) {
    const options = [];
    for (const field of model.fields)
        for (const [definitionName, definition] of Object.entries(sortDefinitions(field.sortable))) {
            const direction = definition.direction ?? 'both';
            options.push({
                key: optionKey(field.name, definitionName),
                directions: direction === 'both' ? ['asc', 'desc'] : [direction],
                field: field.name, definitionName, definition,
            });
        }
    for (const [name, sortKeys] of Object.entries(model.sortings ?? {})) {
        for (const sortKey of sortKeys)
            if (sortKey.field !== undefined)
                checkField(model, sortKey.field, `Sort order ${name}`);
        options.push({ key: name, directions: ['asc'], sortKeys });
    }
    const keys = options.map(option => option.key);
    const twice = keys.find((key, i) => keys.indexOf(key) !== i);
    if (twice !== undefined)
        throw new Error(`Sort key ${twice} of model ${model.metadata.name} is defined twice; rename a sort order`);
    return options;
}
/** The filters of the model's records: one per parameter. */
export function filterOptions(model) {
    const options = [];
    for (const field of model.fields)
        for (const [definitionName, definition] of Object.entries(filterDefinitions(field.filterable))) {
            const name = optionKey(field.name, definitionName);
            const base = { field: field.name, definitionName, scope: 'field' };
            const fn = definition.function !== undefined ? { function: definition.function } : {};
            if (definition.ops !== undefined)
                for (const op of definition.ops)
                    options.push({ ...base, name: `${name}.${OP_NAMES[op]}`, input: 'value', op, valueType: 'field', ...fn });
            else if (definition.predicate !== undefined)
                options.push({
                    ...base, name, predicate: definition.predicate,
                    ...(definition.argument === undefined
                        ? { input: 'switch' }
                        : { input: 'value', valueType: definition.argument === true ? 'field' : definition.argument }),
                });
            else if (definition.otherField !== undefined) {
                checkField(model, definition.otherField, `Filter ${name}`);
                options.push({ ...base, name, input: 'switch', op: definition.op, otherField: definition.otherField, ...fn });
            }
            else if (definition.value !== undefined)
                options.push({ ...base, name, input: 'switch', op: definition.op, value: definition.value, ...fn });
            else
                options.push({ ...base, name, input: 'value', op: definition.op, valueType: 'field', ...fn });
        }
    for (const [name, filter] of Object.entries(model.filters ?? {})) {
        const base = { name, definitionName: name, scope: 'model' };
        if ('predicate' in filter) {
            options.push({
                ...base, predicate: filter.predicate,
                ...(filter.argument === undefined ? { input: 'switch' } : { input: 'value', valueType: filter.argument }),
            });
            continue;
        }
        checkField(model, filter.field, `Filter ${name}`);
        if (filter.otherField !== undefined)
            checkField(model, filter.otherField, `Filter ${name}`);
        options.push({
            ...base, input: 'switch', field: filter.field, op: filter.op,
            ...(filter.otherField !== undefined ? { otherField: filter.otherField } : { value: filter.value }),
        });
    }
    const names = new Set(RESERVED_PARAMETERS);
    for (const { name } of options) {
        if (names.has(name))
            throw new Error(`Query parameter ${name} of model ${model.metadata.name} is defined twice; rename a filter`);
        names.add(name);
    }
    return options;
}
//# sourceMappingURL=ListOptions.js.map
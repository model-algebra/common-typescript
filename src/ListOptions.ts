import type { ArgumentType, Filterable, ModelFilter, Op, Sortable, SortDefinition, SortKey } from "./Model.js";
import { filterDefinitions, sortDefinitions } from "./Query.js";

/*
 * How a list of records can be sorted and filtered, as named options: the keys a sort parameter takes and the filter
 * parameters, as APIs and user interfaces offer them. Bridges use these names so that they agree:
 *
 *   sort keys    lastName (a field's unnamed definition), lastName.caseless (a named one), byName (a sort order of
 *                the model); -key sorts in descending order
 *   filters      lastName, lastName.prefix (field filters, unnamed and named), age.gte (one per operator the client
 *                chooses: eq, ne, lt, lte, gt, gte), adults (a filter of the model)
 */

/** The parts of a model the options come from; Model and models in JSON form have them. */
export interface ListModel {
    metadata: { name: string };
    fields: Array<{ name: string; type: string; parameters?: Record<string, any>; sortable?: Sortable; filterable?: Filterable }>;
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

export const OP_NAMES: Record<Op, string> = { '=': 'eq', '!=': 'ne', '<': 'lt', '<=': 'lte', '>': 'gt', '>=': 'gte' };

/** Names list parameters have or may have, which filters can't take. */
export const RESERVED_PARAMETERS = ['limit', 'offset', 'sort'];

const optionKey = (field: string, name: string) => name === '' ? field : `${field}.${name}`;

function checkField(model: ListModel, name: string, where: string): void {
    if (!model.fields.some(field => field.name === name))
        throw new Error(`${where} of model ${model.metadata.name} names unknown field ${name}`);
}

/** The ways records of the model can be sorted. */
export function sortOptions(model: ListModel): SortOption[] {
    const options: SortOption[] = [];
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
            if (sortKey.field !== undefined) checkField(model, sortKey.field, `Sort order ${name}`);
        options.push({ key: name, directions: ['asc'], sortKeys });
    }
    const keys = options.map(option => option.key);
    const twice = keys.find((key, i) => keys.indexOf(key) !== i);
    if (twice !== undefined)
        throw new Error(`Sort key ${twice} of model ${model.metadata.name} is defined twice; rename a sort order`);
    return options;
}

/** The filters of the model's records: one per parameter. */
export function filterOptions(model: ListModel): FilterOption[] {
    const options: FilterOption[] = [];
    for (const field of model.fields)
        for (const [definitionName, definition] of Object.entries(filterDefinitions(field.filterable))) {
            const name = optionKey(field.name, definitionName);
            const base = { field: field.name, definitionName, scope: 'field' as const };
            const fn = definition.function !== undefined ? { function: definition.function } : {};
            if (definition.ops !== undefined)
                for (const op of definition.ops)
                    options.push({ ...base, name: `${name}.${OP_NAMES[op]}`, input: 'value', op, valueType: 'field', ...fn });
            else if (definition.predicate !== undefined)
                options.push({
                    ...base, name, predicate: definition.predicate,
                    ...(definition.argument === undefined
                        ? { input: 'switch' as const }
                        : { input: 'value' as const, valueType: definition.argument === true ? 'field' as const : definition.argument }),
                });
            else if (definition.otherField !== undefined) {
                checkField(model, definition.otherField, `Filter ${name}`);
                options.push({ ...base, name, input: 'switch', op: definition.op, otherField: definition.otherField, ...fn });
            } else if (definition.value !== undefined)
                options.push({ ...base, name, input: 'switch', op: definition.op, value: definition.value, ...fn });
            else
                options.push({ ...base, name, input: 'value', op: definition.op, valueType: 'field', ...fn });
        }
    for (const [name, filter] of Object.entries(model.filters ?? {})) {
        const base = { name, definitionName: name, scope: 'model' as const };
        if ('predicate' in filter) {
            options.push({
                ...base, predicate: filter.predicate,
                ...(filter.argument === undefined ? { input: 'switch' as const } : { input: 'value' as const, valueType: filter.argument }),
            });
            continue;
        }
        checkField(model, filter.field, `Filter ${name}`);
        if (filter.otherField !== undefined) checkField(model, filter.otherField, `Filter ${name}`);
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

import { describe, it, expect } from 'vitest';
import { filterOptions, sortOptions, type ListModel } from './ListOptions.js';

const person: ListModel = {
    metadata: { name: 'Person' },
    fields: [
        { name: 'lastName', type: 'STRING', sortable: { plain: {}, caseless: { function: 'lower' } },
          filterable: { equals: { op: '=' }, prefix: { predicate: 'startsWith', argument: true } } },
        { name: 'firstName', type: 'TEXT', sortable: true, filterable: { op: '=', function: 'lower' } },
        { name: 'age', type: 'INT16', sortable: { direction: 'desc' }, filterable: { ops: ['>=', '<='] } },
        { name: 'status', type: 'TEXT', filterable: { active: { op: '=', value: 'ACTIVE' }, blank: { predicate: 'isBlank' } } },
        { name: 'endsAt', type: 'DATE', filterable: { op: '>=', otherField: 'startsAt' } },
        { name: 'startsAt', type: 'DATE' },
    ],
    sortings: { byName: [{ field: 'lastName' }, { field: 'firstName' }] },
    filters: {
        adults: { field: 'age', op: '>=', value: 18 },
        overlap: { field: 'endsAt', op: '>=', otherField: 'startsAt' },
        verified: { predicate: 'isVerified' },
        nearby: { predicate: 'isWithinKm', argument: { type: 'FLOAT64' } },
    },
};

describe('sortOptions', () => {
    it('name the sort keys of fields and of the sort orders of the model', () => {
        expect(sortOptions(person).map(o => [o.key, o.directions])).toEqual([
            ['lastName.plain', ['asc', 'desc']],
            ['lastName.caseless', ['asc', 'desc']],
            ['firstName', ['asc', 'desc']],
            ['age', ['desc']],
            ['byName', ['asc']],
        ]);
        expect(sortOptions(person)[1]).toMatchObject({ field: 'lastName', definitionName: 'caseless', definition: { function: 'lower' } });
        expect(sortOptions(person)[4].sortKeys).toEqual([{ field: 'lastName' }, { field: 'firstName' }]);
    });

    it.each([
        ['sort orders named like sort keys', { sortings: { firstName: [{ field: 'lastName' }] } }, 'Sort key firstName of model Person is defined twice'],
        ['sort orders of unknown fields', { sortings: { byX: [{ field: 'x' }] } }, 'Sort order byX of model Person names unknown field x'],
    ])('reject %s', (_, extra, message) => {
        expect(() => sortOptions({ ...person, ...extra })).toThrow(message);
    });
});

describe('filterOptions', () => {
    it('give one option per parameter', () => {
        expect(filterOptions(person).map(o => [o.name, o.input, o.scope])).toEqual([
            ['lastName.equals', 'value', 'field'],
            ['lastName.prefix', 'value', 'field'],
            ['firstName', 'value', 'field'],
            ['age.gte', 'value', 'field'],
            ['age.lte', 'value', 'field'],
            ['status.active', 'switch', 'field'],
            ['status.blank', 'switch', 'field'],
            ['endsAt', 'switch', 'field'],
            ['adults', 'switch', 'model'],
            ['overlap', 'switch', 'model'],
            ['verified', 'switch', 'model'],
            ['nearby', 'value', 'model'],
        ]);
    });

    it('describe what each filter compares', () => {
        const options = Object.fromEntries(filterOptions(person).map(o => [o.name, o]));
        expect(options['lastName.prefix']).toEqual({ name: 'lastName.prefix', field: 'lastName', definitionName: 'prefix', scope: 'field', input: 'value', predicate: 'startsWith', valueType: 'field' });
        expect(options.firstName).toMatchObject({ op: '=', function: 'lower', valueType: 'field' });
        expect(options['age.gte']).toMatchObject({ field: 'age', op: '>=' });
        expect(options['status.active']).toMatchObject({ op: '=', value: 'ACTIVE' });
        expect(options.endsAt).toMatchObject({ op: '>=', otherField: 'startsAt' });
        expect(options.adults).toMatchObject({ field: 'age', op: '>=', value: 18 });
        expect(options.nearby).toMatchObject({ predicate: 'isWithinKm', valueType: { type: 'FLOAT64' } });
    });

    it('give nothing for models that can not be filtered', () => {
        expect(filterOptions({ metadata: { name: 'A' }, fields: [{ name: 'a', type: 'TEXT' }] })).toEqual([]);
        expect(sortOptions({ metadata: { name: 'A' }, fields: [{ name: 'a', type: 'TEXT' }] })).toEqual([]);
    });

    it.each([
        ['filters named like list parameters', { filters: { offset: { predicate: 'x' } } }, 'Query parameter offset of model Person is defined twice'],
        ['filters of the model named like field filters', { filters: { firstName: { predicate: 'x' } } }, 'Query parameter firstName of model Person is defined twice'],
        ['filters of unknown fields', { filters: { f: { field: 'x', op: '=', value: 1 } } }, 'Filter f of model Person names unknown field x'],
        ['filters comparing with unknown fields', { filters: { f: { field: 'age', op: '<', otherField: 'x' } } }, 'Filter f of model Person names unknown field x'],
    ])('reject %s', (_, extra, message) => {
        expect(() => filterOptions({ ...person, ...extra } as ListModel)).toThrow(message);
    });

    it('reject field filters comparing with unknown fields', () => {
        expect(() => filterOptions({ metadata: { name: 'A' }, fields: [{ name: 'a', type: 'INT32', filterable: { op: '<', otherField: 'x' } }] }))
            .toThrow('Filter a of model A names unknown field x');
    });
});

import { describe, it, expect } from 'vitest';
import { filterDefinitions, sortDefinitions } from './Query.js';
import { Model } from './Model.js';

describe('sortDefinitions', () => {
    it.each([
        ['nothing', undefined, {}],
        ['false', false, {}],
        ['true', true, { '': {} }],
        ['an empty definition', {}, { '': {} }],
        ['one definition', { function: 'lower', direction: 'desc' }, { '': { function: 'lower', direction: 'desc' } }],
        ['named definitions', { plain: {}, caseless: { function: 'lower' } }, { plain: {}, caseless: { function: 'lower' } }],
    ])('of %s', (_, sortable, expected) => {
        expect(sortDefinitions(sortable as any)).toEqual(expected);
    });
});

describe('filterDefinitions', () => {
    it.each([
        ['nothing', undefined, {}],
        ['true', true, { '': { op: '=' } }],
        ['an operator', { op: '>=' }, { '': { op: '>=' } }],
        ['operators', { ops: ['>=', '<='] }, { '': { ops: ['>=', '<='] } }],
        ['a fixed value', { op: '=', value: 'A' }, { '': { op: '=', value: 'A' } }],
        ['a predicate with a typed argument', { predicate: 'near', argument: { type: 'FLOAT64' } }, { '': { predicate: 'near', argument: { type: 'FLOAT64' } } }],
        ['named definitions', { eq: { op: '=' }, near: { predicate: 'near', argument: { type: 'FLOAT64' } } },
            { eq: { op: '=' }, near: { predicate: 'near', argument: { type: 'FLOAT64' } } }],
    ])('of %s', (_, filterable, expected) => {
        expect(filterDefinitions(filterable as any)).toEqual(expected);
    });
});

describe('Model.fromJSON', () => {
    it('keeps sorting and filtering', () => {
        const model = Model.fromJSON({
            metadata: { name: 'P', version: '1' },
            fields: [{ name: 'a', type: 'TEXT', sortable: true, filterable: { op: '=' } }],
            sortings: { byA: [{ field: 'a' }] },
            filters: { active: { predicate: 'isActive' } },
        });
        expect(model.fields[0].sortable).toBe(true);
        expect(model.fields[0].filterable).toEqual({ op: '=' });
        expect(model.sortings).toEqual({ byA: [{ field: 'a' }] });
        expect(model.filters).toEqual({ active: { predicate: 'isActive' } });
    });
});

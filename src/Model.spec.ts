import { describe, expect, it } from "vitest";
import { Field, Metadata, Model } from "./Model.js";

const json = {
    metadata: { name: 'Event', version: '1.0.0', owner: 'events team' },
    fields: [
        { name: 'id', type: 'INT64', constraints: { primaryKey: true, nullable: false } },
        { name: 'title', type: 'STRING', parameters: { length: 40 }, sortable: true, form: { label: 'Name', cols: 12 } },
    ],
    constraints: [{ name: 'title_unique', type: 'unique', fields: ['title'] }],
    form: { order: ['title'] },
};

describe('Model', () => {
    it('keeps keys the model format does not define', () => {
        const model = Model.fromJSON(json);
        expect((model as any).form).toEqual({ order: ['title'] });
        expect((model.fields[1] as any).form).toEqual({ label: 'Name', cols: 12 });
        expect((model.metadata as any).owner).toBe('events team');
        expect(model.metadata).toBeInstanceOf(Metadata);
        expect(model.fields[1]).toBeInstanceOf(Field);
        expect(model.fields[0].constraints.map(c => [c.name, c.value])).toEqual([['primaryKey', true], ['nullable', false]]);
    });

    it('gives back its JSON form', () => {
        const model = Model.fromJSON(json);
        expect(model.toJSON()).toEqual(json);
        expect(JSON.parse(JSON.stringify(model))).toEqual(json);
        expect(Model.fromJSON(model.toJSON())).toEqual(model);
    });

    it('leaves out what is empty', () => {
        expect(Model.fromJSON({ metadata: { name: 'A', version: '1' }, fields: [{ name: 'a', type: 'TEXT' }] }).toJSON())
            .toEqual({ metadata: { name: 'A', version: '1' }, fields: [{ name: 'a', type: 'TEXT' }] });
    });
});

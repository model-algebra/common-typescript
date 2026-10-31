import { Model } from "./Model.js";
/**
 * Models that belong together, such as the tables of one database. Models are identified
 * by metadata.name, which must be unique within the set; the order of the models is kept.
 */
export class ModelSet {
    byName = new Map();
    constructor(models = []) {
        for (const model of models) {
            const name = model.metadata.name;
            if (this.byName.has(name))
                throw new Error(`Model set contains more than one model named ${name}`);
            this.byName.set(name, model);
        }
    }
    get models() {
        return [...this.byName.values()];
    }
    get names() {
        return [...this.byName.keys()];
    }
    get size() {
        return this.byName.size;
    }
    get(name) {
        return this.byName.get(name);
    }
    has(name) {
        return this.byName.has(name);
    }
    [Symbol.iterator]() {
        return this.byName.values();
    }
    /** Builds the set from models in JSON form, as Model.fromJSON() reads them. */
    static fromJSON(data) {
        return new ModelSet(data.map(model => Model.fromJSON(model)));
    }
}
//# sourceMappingURL=ModelSet.js.map
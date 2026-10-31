import { Model } from "./Model.js";

/**
 * Models that belong together, such as the tables of one database. Models are identified
 * by metadata.name, which must be unique within the set; the order of the models is kept.
 */
export class ModelSet implements Iterable<Model> {
    private readonly byName = new Map<string, Model>();

    constructor(models: Iterable<Model> = []) {
        for (const model of models) {
            const name = model.metadata.name;
            if (this.byName.has(name))
                throw new Error(`Model set contains more than one model named ${name}`);
            this.byName.set(name, model);
        }
    }

    get models(): Model[] {
        return [...this.byName.values()];
    }

    get names(): string[] {
        return [...this.byName.keys()];
    }

    get size(): number {
        return this.byName.size;
    }

    get(name: string): Model | undefined {
        return this.byName.get(name);
    }

    has(name: string): boolean {
        return this.byName.has(name);
    }

    [Symbol.iterator](): Iterator<Model> {
        return this.byName.values();
    }

    /** Builds the set from models in JSON form, as Model.fromJSON() reads them. */
    public static fromJSON(data: any[]): ModelSet {
        return new ModelSet(data.map(model => Model.fromJSON(model)));
    }
}

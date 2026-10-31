import { Model } from "./Model.js";
/**
 * Models that belong together, such as the tables of one database. Models are identified
 * by metadata.name, which must be unique within the set; the order of the models is kept.
 */
export declare class ModelSet implements Iterable<Model> {
    private readonly byName;
    constructor(models?: Iterable<Model>);
    get models(): Model[];
    get names(): string[];
    get size(): number;
    get(name: string): Model | undefined;
    has(name: string): boolean;
    [Symbol.iterator](): Iterator<Model>;
    /** Builds the set from models in JSON form, as Model.fromJSON() reads them. */
    static fromJSON(data: any[]): ModelSet;
}
//# sourceMappingURL=ModelSet.d.ts.map
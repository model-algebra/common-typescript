import type { ModelSet } from "./ModelSet.js";

/**
 * Bridge between a set of related models and a target representation of all of them
 * together, such as the DDL of a database schema.
 *
 * @typeParam T - target format type
 */
export interface ModelSetBridge<T> {
    /** Converts the model set to the target format. */
    toTarget(models: ModelSet): T;

    /** Converts the target format back to a model set. */
    toModel(target: T): ModelSet;
}

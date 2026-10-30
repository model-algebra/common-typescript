/**
 * Bridge between a model-algebra model and some target representation
 * (DDL, TypeScript source, etc.).
 *
 * @typeParam M - model type
 * @typeParam T - target format type
 */
export interface ModelBridge<M, T> {
    /** Converts the model to the target format. */
    toTarget(model: M): T;

    /** Converts the target format back to the model. */
    toModel(target: T): M;
}

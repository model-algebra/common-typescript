/*
 * sortable and filterable take true, one definition, or named definitions. These functions give named definitions
 * in every case; the one definition of true or of an unnamed definition is named "".
 */
const SORT_KEYS = new Set(['function', 'direction', 'nulls']);
const FILTER_KEYS = new Set(['op', 'ops', 'value', 'otherField', 'function', 'predicate', 'argument']);
// Keys of a single definition whose values may be objects; values of all other keys of a map are definitions
const OBJECT_KEYS = new Set(['argument']);
function named(options, defaultDefinition, keys) {
    if (options === undefined || options === false)
        return {};
    if (options === true)
        return { '': defaultDefinition };
    const entries = Object.entries(options);
    // A single definition has only keys of definitions; a map has names, with definitions as values
    const single = entries.every(([key, value]) => keys.has(key) && (OBJECT_KEYS.has(key) || value === null || typeof value !== 'object' || Array.isArray(value)));
    return single ? { '': options } : options;
}
/** The sort definitions of a field by name; true is the definition {}, named "". */
export function sortDefinitions(sortable) {
    return named(sortable, {}, SORT_KEYS);
}
/** The filter definitions of a field by name; true is the definition { op: '=' }, named "". */
export function filterDefinitions(filterable) {
    return named(filterable, { op: '=' }, FILTER_KEYS);
}
//# sourceMappingURL=Query.js.map
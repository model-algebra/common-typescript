import type { FilterDefinition, Filterable, SortDefinition, Sortable } from "./Model.js";
/** The sort definitions of a field by name; true is the definition {}, named "". */
export declare function sortDefinitions(sortable: Sortable | undefined): Record<string, SortDefinition>;
/** The filter definitions of a field by name; true is the definition { op: '=' }, named "". */
export declare function filterDefinitions(filterable: Filterable | undefined): Record<string, FilterDefinition>;
//# sourceMappingURL=Query.d.ts.map
/**
 *  Returns keys of a record, similar to Object.keys()
 */
export function recordKeys<K extends PropertyKey, V>(object: Record<K, V>) {
  return Object.keys(object) as (K)[];
}

/**
 *  Returns values of a record, similar to Object.values()
 */
export function recordValues<K extends PropertyKey, V>(object: Record<K, V>) {
  return Object.values(object) as (V)[];
}

/**
 *  Returns entries of a record, similar to Object.entries()
 */
export function recordEntries<K extends PropertyKey, V>(object: Record<K, V>) {
  return Object.entries(object) as ([K, V])[];
}

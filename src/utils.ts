/** Counts occurrences of each element */
export function counter<T>(array: T[]): Map<T, number> {
    const counts = new Map<T, number>();
    for (const value of array) counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
}

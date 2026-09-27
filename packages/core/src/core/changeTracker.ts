/**
 * Collects the ids of blocks that were updated or removed and reports them in batches.
 *
 * - A block removed after being updated in the same batch is only reported as removed.
 * - `flush` reports the pending batch right away (e.g. when the app goes to background).
 * - If `onFlush` throws, the batch is put back so the changes are reported on the next flush.
 */
export function createChangeTracker(
    onFlush: (updatedIds: string[], removedIds: string[]) => void,
    delay: number
) {
    let updated = new Set<string>();
    let removed = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | null = null;

    function schedule() {
        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(flush, delay);
    }

    function markUpdated(...ids: string[]) {
        ids.forEach(id => updated.add(id));
        schedule();
    }

    function markRemoved(...ids: string[]) {
        ids.forEach(id => {
            updated.delete(id);
            removed.add(id);
        });
        schedule();
    }

    function flush() {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
        if (updated.size === 0 && removed.size === 0) return;

        const batch = { updated, removed };
        updated = new Set();
        removed = new Set();

        try {
            onFlush([...batch.updated], [...batch.removed]);
        } catch (error) {
            batch.updated.forEach(id => updated.add(id));
            batch.removed.forEach(id => removed.add(id));
            throw error;
        }
    }

    return { markUpdated, markRemoved, flush };
}

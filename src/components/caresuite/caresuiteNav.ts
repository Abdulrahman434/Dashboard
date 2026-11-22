/**
 * Hand-off between Categories Manager and Items Manager: "Manage Items" sets
 * the category, Items Manager opens on it. Module-level so it survives the
 * route change (the page may remount).
 */
let pendingCategoryId: string | null = null;

export function openItemsForCategory(id: string) {
  pendingCategoryId = id;
}

export function peekPendingCategory(): string | null {
  return pendingCategoryId;
}

export function clearPendingCategory() {
  pendingCategoryId = null;
}

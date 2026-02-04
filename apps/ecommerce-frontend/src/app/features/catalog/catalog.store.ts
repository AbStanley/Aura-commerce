import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';

type CatalogState = {
    selectedCategory: string | null;
    searchQuery: string;
};

const initialState: CatalogState = {
    selectedCategory: null,
    searchQuery: ''
};

export const CatalogStateStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store) => ({
        setCategory(categoryId: string | null) {
            patchState(store, { selectedCategory: categoryId });
        },
        setSearch(query: string) {
            patchState(store, { searchQuery: query });
        }
    }))
);

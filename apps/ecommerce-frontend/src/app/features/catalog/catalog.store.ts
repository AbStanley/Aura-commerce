import { signalStore, withMethods, withState } from '@ngrx/signals';

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
            // In a real app we might patch state here
        },
        setSearch(query: string) {
            // patchState(store, { searchQuery: query });
        }
    }))
);

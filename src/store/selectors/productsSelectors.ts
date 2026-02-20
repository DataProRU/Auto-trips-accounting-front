import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { Product } from "@/types";

export const selectProducts = (state: RootState) => state.products.products;
export const selectProductsLoading = (state: RootState) => state.products.loading;
export const selectProductsError = (state: RootState) => state.products.error;

export const selectProductOptions = createSelector(
  [selectProducts],
  (products: Product[]) =>
    products.map((p, i) => ({
      value: String(p.id),
      label: p.name,
      key: `product-${p.id}-${i}`,
    }))
);

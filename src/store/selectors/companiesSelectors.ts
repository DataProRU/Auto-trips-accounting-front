import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

export const selectCompanies = (state: RootState) => state.companies.companies;
export const selectCompaniesLoading = (state: RootState) => state.companies.loading;
export const selectCompaniesError = (state: RootState) => state.companies.error;

export const selectCompanyOptions = createSelector(
  [selectCompanies],
  (companies) =>
    companies.map((c, i) => ({
      value: String(c.id),
      label: c.name,
      key: `company-${c.id}-${i}`,
    }))
);

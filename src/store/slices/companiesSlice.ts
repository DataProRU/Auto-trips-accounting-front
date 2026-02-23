import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { Company } from '@/types/api';
import { fetchCompanies } from '@/services/companyService';
import type { RootState } from '@/store/store';

export interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
}

const initialState: CompaniesState = {
  companies: [],
  loading: false,
  error: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export default companiesSlice.reducer;

export const selectCompanies = (state: RootState) => state.companies.companies;
export const selectCompaniesLoading = (state: RootState) =>
  state.companies.loading;
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

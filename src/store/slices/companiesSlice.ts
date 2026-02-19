import { createSlice } from "@reduxjs/toolkit";
import type { Company } from "@/types/api";
import { fetchCompanies } from "@/services/companyService";

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
  name: "companies",
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

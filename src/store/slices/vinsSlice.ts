import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import type { VinNumber } from '@/types/api';
import type { RootState } from '@/types/store';
import { fetchVins } from '@/services/vinService';

export interface VinsState {
  vins: VinNumber[];
  loading: boolean;
  error: string | null;
}

const initialState: VinsState = {
  vins: [],
  loading: false,
  error: null,
};

const vinsSlice = createSlice({
  name: 'vins',
  initialState,
  reducers: {
    addVin: (state, action: PayloadAction<VinNumber>) => {
      const vin = action.payload;
      if (!state.vins.some((v) => v.id === vin.id)) {
        state.vins.push(vin);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVins.fulfilled, (state, action) => {
        state.loading = false;
        state.vins = action.payload;
        state.error = null;
      })
      .addCase(fetchVins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { addVin } = vinsSlice.actions;
export default vinsSlice.reducer;

export const selectVins = (state: RootState) => state.vins?.vins ?? [];
export const selectVinsLoading = (state: RootState) =>
  state.vins?.loading ?? false;

export const selectVinOptions = createSelector([selectVins], (vins) =>
  vins.map((v, i) => ({
    value: String(v.id),
    label: `${v.vin} — ${v.car_model}`,
    key: `vin-${v.id}-${i}`,
  }))
);

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../constants";

interface Institution {
  _id: string;
  name: string;
}

interface InstitutionsState {
  institutions: Institution[];
  loading: boolean;
  error: string | null;
}

const initialState: InstitutionsState = {
  institutions: [],
  loading: false,
  error: null,
};

export const fetchInstitutions = createAsyncThunk(
  "institutions/fetchInstitutions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/institutions`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch institutions"
      );
    }
  }
);

const institutionsSlice = createSlice({
  name: "institutions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstitutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstitutions.fulfilled, (state, action) => {
        state.loading = false;
        state.institutions = action.payload;
      })
      .addCase(fetchInstitutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default institutionsSlice.reducer;

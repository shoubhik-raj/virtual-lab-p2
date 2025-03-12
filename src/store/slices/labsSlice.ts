import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { API_URL } from "../../../constants";

interface Lab {
  _id: string;
  name: string;
  description: string;
  repoUrl: string;
  createdAt: string;
}

interface LabsState {
  labs: Lab[];
  currentLab: Lab | null;
  loading: boolean;
  error: string | null;
  labDetails: any;
}

const initialState: LabsState = {
  labs: [],
  currentLab: null,
  loading: false,
  error: null,
  labDetails: {},
};

export const fetchLabs = createAsyncThunk(
  "labs/fetchLabs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/labs`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch labs"
      );
    }
  }
);

export const createLab = createAsyncThunk(
  "labs/createLab",
  async (labData: FormData, { rejectWithValue }) => {
    try {
      console.log("GOT REQQ LAB ", labData);
      const response = await axios.post(`${API_URL}/labs`, labData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lab"
      );
    }
  }
);

export const fetchLabDetails = createAsyncThunk(
  "labs/fetchLabDetails",
  async (id: string) => {
    const response = await axios.get(`${API_URL}/labs/${id}`, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data; // Assuming the response contains the lab data
  }
);

export const fetchUserLabs = createAsyncThunk(
  "labs/fetchUserLabs",
  async () => {
    const response = await axios.get(`${API_URL}/labs`, {
      withCredentials: true,
    });
    return response.data;
  }
);

const labsSlice = createSlice({
  name: "labs",
  initialState,
  reducers: {
    setCurrentLab: (state, action) => {
      state.currentLab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabs.fulfilled, (state, action) => {
        state.loading = false;
        state.labs = action.payload;
      })
      .addCase(fetchLabs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createLab.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLab.fulfilled, (state, action) => {
        state.loading = false;
        state.labs.push(action.payload);
      })
      .addCase(createLab.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLabDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.labDetails = action.payload;
      })
      .addCase(fetchLabDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserLabs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLabs.fulfilled, (state, action) => {
        state.loading = false;
        state.labs = action.payload;
      })
      .addCase(fetchUserLabs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentLab } = labsSlice.actions;
export default labsSlice.reducer;

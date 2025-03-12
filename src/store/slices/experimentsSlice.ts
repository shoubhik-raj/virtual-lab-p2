import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../constants";

interface Experiment {
  _id: string;
  name: string;
  labId: string;
  aim: string;
  theory: string;
  procedure: string;
  pretest: [];
  posttest: [];
  references: string;
  contributors: string;
  faqs: string[];
  institution: string;
  thumbnail: string;
  createdAt: string;
  simulations: [];
}

interface ExperimentsState {
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExperimentsState = {
  experiments: [],
  currentExperiment: null,
  loading: false,
  error: null,
};

export const fetchExperiments = createAsyncThunk(
  "experiments/fetchExperiments",
  async (labId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/labs/${labId}/experiments`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch experiments"
      );
    }
  }
);

export const createExperiment = createAsyncThunk(
  "experiments/createExperiment",
  async (experimentData: FormData, { rejectWithValue }) => {
    console.log("redux", experimentData);
    try {
      const response = await axios.post(
        `${API_URL}/experiments`,
        experimentData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create experiment"
      );
    }
  }
);

// New function to fetch experiments associated with the user's labs
export const fetchUserExperiments = createAsyncThunk(
  "experiments/fetchUserExperiments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/experiments`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch experiments"
      );
    }
  }
);

export const fetchExperimentDetails = createAsyncThunk(
  "experiments/fetchExperimentDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/experiments/${id}`, {
        withCredentials: true,
      });
      console.log("FETHDK LD", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch experiment details"
      );
    }
  }
);

const experimentsSlice = createSlice({
  name: "experiments",
  initialState,
  reducers: {
    setCurrentExperiment: (state, action) => {
      state.currentExperiment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExperiments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperiments.fulfilled, (state, action) => {
        state.loading = false;
        state.experiments = action.payload;
      })
      .addCase(fetchExperiments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createExperiment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExperiment.fulfilled, (state, action) => {
        state.loading = false;
        state.experiments.push(action.payload);
      })
      .addCase(createExperiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserExperiments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserExperiments.fulfilled, (state, action) => {
        state.loading = false;
        state.experiments = action.payload;
      })
      .addCase(fetchUserExperiments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExperimentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperimentDetails.fulfilled, (state, action) => {
        state.loading = false;
        (state.currentExperiment = action.payload.experiment),
          action.payload.simulations;
      })
      .addCase(fetchExperimentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentExperiment } = experimentsSlice.actions;
export default experimentsSlice.reducer;

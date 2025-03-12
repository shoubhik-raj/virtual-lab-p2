import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { API_URL } from "../../../constants";

interface Simulation {
  id: string;
  name: string;
  subject: string;
  department: string;
  topic: string;
  details: string;
  prompt: string;
  code: string;
  createdAt: string;
}

interface SimulationsState {
  simulations: Simulation[];
  currentSimulation: Simulation | null;
  loading: boolean;
  error: string | null;
  generatedCode: string;
  generatedPrompt: string;
}

const initialState: SimulationsState = {
  simulations: [],
  currentSimulation: null,
  loading: false,
  error: null,
  generatedCode: "",
  generatedPrompt: "",
};

export const fetchSimulations = createAsyncThunk(
  "simulations/fetchSimulations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/simulations`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch simulations"
      );
    }
  }
);

export const fetchSimulationsByExperiment = createAsyncThunk(
  "simulations/fetchSimulationsByExperiment",
  async (experimentId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching simulations for experiment:', experimentId);
      const response = await axios.get(`${API_URL}/simulations/by-experiment/${experimentId}`, 
        { withCredentials: true }
      );
      console.log('Simulations for experiment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching simulations by experiment:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch simulations for this experiment"
      );
    }
  }
);

export const generateAIPrompt = createAsyncThunk(
  "simulations/generateAIPrompt",
  async (simulationData: any, { rejectWithValue }) => {
    try {
      console.log("generate ai prompt : ", simulationData);

      const response = await axios.post(
        `${API_URL}/simulations/generate-prompt`,
        simulationData,
        { withCredentials: true }
      );

      console.log("AI PROMOPT  response : ", response.data);

      return response.data; // Return the entire response data object, not just prompt
    } catch (error: any) {
      console.log("ERROR : ", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate AI prompt"
      );
    }
  }
);

export const generateSimulationCode = createAsyncThunk(
  "simulations/generateCode",
  async (prompt: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/simulations/generate-code`,
        { prompt },
        { withCredentials: true }
      );
      return response.data.code;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate simulation code"
      );
    }
  }
);

export const saveSimulation = createAsyncThunk(
  "simulations/saveSimulation",
  async (simulationData: any, { rejectWithValue }) => {
    try {
      console.log('Saving simulation with data:', JSON.stringify(simulationData));
      
      // Ensure required fields are provided
      if (!simulationData.experimentId) {
        return rejectWithValue('Experiment ID is required');
      }
      
      if (!simulationData.course) {
        return rejectWithValue('Course is required');
      }
      
      // Log the experimentId to make sure it's a valid ObjectId
      console.log('Experiment ID being sent to server:', simulationData.experimentId);
      
      const response = await axios.post(
        `${API_URL}/simulations`,
        simulationData,
        {
          withCredentials: true,
        }
      );
      
      console.log('Server response from save:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error saving simulation:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to save simulation"
      );
    }
  }
);

const simulationsSlice = createSlice({
  name: "simulations",
  initialState,
  reducers: {
    setCurrentSimulation: (state, action) => {
      state.currentSimulation = action.payload;
    },
    updateGeneratedCode: (state, action) => {
      state.generatedCode = action.payload;
    },
    updateGeneratedPrompt: (state, action) => {
      state.generatedPrompt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSimulations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimulations.fulfilled, (state, action) => {
        state.loading = false;
        state.simulations = action.payload;
      })
      .addCase(fetchSimulations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSimulationsByExperiment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimulationsByExperiment.fulfilled, (state, action) => {
        state.loading = false;
        state.simulations = action.payload;
      })
      .addCase(fetchSimulationsByExperiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateAIPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAIPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedPrompt = action.payload;
      })
      .addCase(generateAIPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateSimulationCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSimulationCode.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedCode = action.payload;
      })
      .addCase(generateSimulationCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveSimulation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSimulation.fulfilled, (state, action) => {
        state.loading = false;
        state.simulations.push(action.payload);
      })
      .addCase(saveSimulation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentSimulation,
  updateGeneratedCode,
  updateGeneratedPrompt,
} = simulationsSlice.actions;
export default simulationsSlice.reducer;

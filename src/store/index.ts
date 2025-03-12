import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import labsReducer from "./slices/labsSlice";
import experimentsReducer from "./slices/experimentsSlice";
import simulationsReducer from "./slices/simulationsSlice";
import institutionsReducer from "./slices/institutionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    labs: labsReducer,
    experiments: experimentsReducer,
    simulations: simulationsReducer,
    institutions: institutionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

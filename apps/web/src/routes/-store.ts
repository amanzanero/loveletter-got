import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/lib/state/users";
import { env } from "@/lib/env";

const store = configureStore({
  reducer: {
    users: userReducer,
  },
  devTools: !env.production,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

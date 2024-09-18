import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  name: string;
  id: number;
  publicId: string;
  gameId: number;
}

const initialState = {
  user: null as UserState | null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser } = userSlice.actions;

export default userSlice.reducer;

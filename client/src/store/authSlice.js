import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false, // true if user is logged in
  userData: null, // holds verified profile details and trust scores
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
    // Industry-level: update user metadata (e.g., KYC status or TrustScore)
    updateUser: (state, action) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false, 
  userData: null, 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Standard action for Register/Login
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload; 
    },
    // Alias action to fix SyntaxError in CompleteProfile
    authLogin: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
    updateUser: (state, action) => {
      if (state.userData) {
        // Redux Toolkit safely allows us to mutate state directly.
        // Object.assign cleanly merges the new payload (like our pending status) into the existing userData.
        Object.assign(state.userData, action.payload);
      }
    },
    setEmailVerified: (state) => {
      if (state.userData) {
        state.userData.isEmailVerified = true;
      }
    }
  },
});

// Exporting both names to satisfy all component imports
export const { login, authLogin, logout, updateUser, setEmailVerified } = authSlice.actions;
export default authSlice.reducer;
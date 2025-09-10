import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  type: 'info', // success, error, warning, info
  visible: false,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast(state, action) {
      const { message, type = 'info' } = action.payload;
      state.message = message;
      state.type = type;
      state.visible = true;
    },
    hideToast(state) {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;

export default toastSlice.reducer;
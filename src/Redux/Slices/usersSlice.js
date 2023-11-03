import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const usersUrl = 'http://localhost:3000/api/v1/users/';

const initialState = {
  user: { id: null, name: null, username: null },
  loading: false,
  status: 'idle',
  error: null,
};

const setLocalStorage = (userID, userName, userUsername) => {
  const userData = { id: userID, name: userName, username: userUsername };
  localStorage.setItem('user', JSON.stringify(userData));
};

const setUserState = (state, statusMessage = 'idle') => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user !== null) {
    state.status = statusMessage;
    state.user = user;
  } else {
    state.status = statusMessage;
  }
};

export const validateUser = createAsyncThunk('users/validateUser', async (name) => {
  try {
    const response = await axios.get(`${usersUrl}${name}`);
    return response.data;
  } catch (error) {
    return error.message;
  }
});

export const createUser = createAsyncThunk('users/createUser', async (user) => {
  try {
    const response = await axios.post(`${usersUrl}`, user);
    return response.data;
  } catch (error) {
    return error.message;
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    loadUserFromLocalStorage: (state) => {
      setUserState(state, 'Authenticated');
    },
  },
  extraReducers(builder) {
    builder
      .addCase(validateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateUser.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.exist) {
          setLocalStorage(action.payload.id, action.payload.name, action.payload.username);
          setUserState(state, 'Authenticated');
        } else {
          state.status = 'User not found';
        }
      })
      .addCase(validateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create the user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;

        if (typeof action.payload === 'string') {
          state.status = 'Failed to sign up';
        } else {
          state.status = 'created';
          setLocalStorage(action.payload.id, action.payload.name, action.payload.username);
          setUserState(state, 'created');
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { loadUserFromLocalStorage } = usersSlice.actions;
export default usersSlice.reducer;

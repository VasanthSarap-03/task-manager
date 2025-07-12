import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      const { date, task } = action.payload;
      if (!state[date]) {
        state[date] = [];
      }
      state[date].push(task);
    },
    deleteTask: (state, action) => {
      const { date, index } = action.payload;
      if (state[date]) {
        state[date].splice(index, 1);
        if (state[date].length === 0) {
          delete state[date];
        }
      }
    },
    editTask: (state, action) => {
      const { date, index, updatedTask } = action.payload;
      if (state[date] && state[date][index]) {
        state[date][index] = updatedTask;
      }
    }
  }
});

export const { addTask, deleteTask, editTask } = taskSlice.actions;
export default taskSlice.reducer;

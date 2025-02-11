import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/localStorage';

const STORAGE_KEYS = {
  CHECKLISTS: 'trip_checklists'
};

export default function TripChecklist({ tripId }) {
  const [checklist, setChecklist] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    // Load existing checklist for this trip
    const allChecklists = getFromLocalStorage(STORAGE_KEYS.CHECKLISTS, {});
    const tripChecklist = allChecklists[tripId] || [];
    setChecklist(tripChecklist);
  }, [tripId]);

  const handleAddTask = () => {
    if (!newTask.trim()) return;

    const newTaskItem = {
      id: Date.now(),
      text: newTask.trim(),
      completed: false
    };

    const updatedChecklist = [...checklist, newTaskItem];
    setChecklist(updatedChecklist);
    setNewTask('');

    // Save to localStorage
    const allChecklists = getFromLocalStorage(STORAGE_KEYS.CHECKLISTS, {});
    allChecklists[tripId] = updatedChecklist;
    saveToLocalStorage(STORAGE_KEYS.CHECKLISTS, allChecklists);
  };

  const handleToggleTask = (taskId) => {
    const updatedChecklist = checklist.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setChecklist(updatedChecklist);

    // Update localStorage
    const allChecklists = getFromLocalStorage(STORAGE_KEYS.CHECKLISTS, {});
    allChecklists[tripId] = updatedChecklist;
    saveToLocalStorage(STORAGE_KEYS.CHECKLISTS, allChecklists);
  };

  const handleDeleteTask = (taskId) => {
    const updatedChecklist = checklist.filter(task => task.id !== taskId);
    setChecklist(updatedChecklist);

    // Update localStorage
    const allChecklists = getFromLocalStorage(STORAGE_KEYS.CHECKLISTS, {});
    allChecklists[tripId] = updatedChecklist;
    saveToLocalStorage(STORAGE_KEYS.CHECKLISTS, allChecklists);
  };

  const completedTasks = checklist.filter(task => task.completed).length;
  const totalTasks = checklist.length;

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Trip Checklist</Typography>
        <Typography variant="body2" color="textSecondary">
          {completedTasks} / {totalTasks} completed
        </Typography>
      </Box>

      <Box display="flex" mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          label="Add a task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          size="small"
          sx={{ mr: 1 }}
        />
        <Tooltip title="Add Task">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTask}
            disabled={!newTask.trim()}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Tooltip>
      </Box>

      {checklist.length === 0 ? (
        <Typography 
          variant="body2" 
          color="textSecondary" 
          align="center"
          sx={{ py: 2, bgcolor: 'grey.50', borderRadius: 1 }}
        >
          No tasks added yet. Start planning your trip!
        </Typography>
      ) : (
        <List dense>
          {checklist.map((task) => (
            <ListItem 
              key={task.id} 
              disableGutters
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => handleDeleteTask(task.id)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText 
                primary={task.text}
                primaryTypographyProps={{
                  sx: task.completed ? { textDecoration: 'line-through', color: 'text.secondary' } : {}
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

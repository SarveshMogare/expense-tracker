import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO } from 'date-fns';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/localStorage';

const STORAGE_KEYS = {
  ITINERARIES: 'trip_itineraries'
};

const ACTIVITY_TYPES = [
  'Transportation',
  'Accommodation',
  'Sightseeing',
  'Dining',
  'Activity',
  'Other'
];

export default function TripItinerary({ tripId, tripStartDate, tripEndDate }) {
  const [itinerary, setItinerary] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentActivity, setCurrentActivity] = useState({
    id: null,
    title: '',
    description: '',
    type: 'Other',
    startTime: null,
    endTime: null
  });

  useEffect(() => {
    // Load existing itinerary for this trip
    const allItineraries = getFromLocalStorage(STORAGE_KEYS.ITINERARIES, {});
    const tripItinerary = allItineraries[tripId] || [];
    setItinerary(tripItinerary.map(item => ({
      ...item,
      startTime: item.startTime ? parseISO(item.startTime) : null,
      endTime: item.endTime ? parseISO(item.endTime) : null
    })));
  }, [tripId]);

  const handleOpenDialog = (activity = null) => {
    if (activity) {
      setCurrentActivity(activity);
    } else {
      setCurrentActivity({
        id: null,
        title: '',
        description: '',
        type: 'Other',
        startTime: null,
        endTime: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveActivity = () => {
    if (!currentActivity.title.trim()) return;

    const newActivity = {
      ...currentActivity,
      id: currentActivity.id || Date.now(),
      startTime: currentActivity.startTime?.toISOString(),
      endTime: currentActivity.endTime?.toISOString()
    };

    const updatedItinerary = currentActivity.id
      ? itinerary.map(item => item.id === currentActivity.id ? newActivity : item)
      : [...itinerary, newActivity];

    // Sort itinerary by start time
    const sortedItinerary = updatedItinerary.sort((a, b) => 
      new Date(a.startTime) - new Date(b.startTime)
    );

    setItinerary(sortedItinerary);
    handleCloseDialog();

    // Save to localStorage
    const allItineraries = getFromLocalStorage(STORAGE_KEYS.ITINERARIES, {});
    allItineraries[tripId] = sortedItinerary;
    saveToLocalStorage(STORAGE_KEYS.ITINERARIES, allItineraries);
  };

  const handleDeleteActivity = (activityId) => {
    const updatedItinerary = itinerary.filter(item => item.id !== activityId);
    setItinerary(updatedItinerary);

    // Update localStorage
    const allItineraries = getFromLocalStorage(STORAGE_KEYS.ITINERARIES, {});
    allItineraries[tripId] = updatedItinerary;
    saveToLocalStorage(STORAGE_KEYS.ITINERARIES, allItineraries);
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Trip Itinerary</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Activity
          </Button>
        </Box>

        {itinerary.length === 0 ? (
          <Typography 
            variant="body2" 
            color="textSecondary" 
            align="center"
            sx={{ py: 2, bgcolor: 'grey.50', borderRadius: 1 }}
          >
            No activities planned yet. Start creating your trip schedule!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {itinerary.map((activity) => (
              <Grid item xs={12} key={activity.id}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderLeftWidth: 5,
                    borderLeftColor: 
                      activity.type === 'Transportation' ? 'primary.main' :
                      activity.type === 'Accommodation' ? 'secondary.main' :
                      activity.type === 'Sightseeing' ? 'success.main' :
                      activity.type === 'Dining' ? 'warning.main' :
                      'grey.500'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {activity.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(activity.startTime), 'MMM dd, yyyy hh:mm a')} 
                      {activity.endTime && ` - ${format(new Date(activity.endTime), 'MMM dd, yyyy hh:mm a')}`}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 1, 
                        px: 1, 
                        py: 0.5, 
                        bgcolor: 'grey.200', 
                        borderRadius: 1 
                      }}
                    >
                      {activity.type}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                      onClick={() => handleOpenDialog(activity)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteActivity(activity.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentActivity.id ? 'Edit Activity' : 'Add New Activity'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={currentActivity.title}
                  onChange={(e) => setCurrentActivity({
                    ...currentActivity,
                    title: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={currentActivity.description}
                  onChange={(e) => setCurrentActivity({
                    ...currentActivity,
                    description: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    value={currentActivity.type}
                    label="Activity Type"
                    onChange={(e) => setCurrentActivity({
                      ...currentActivity,
                      type: e.target.value
                    })}
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Start Time"
                  value={currentActivity.startTime}
                  onChange={(newValue) => setCurrentActivity({
                    ...currentActivity,
                    startTime: newValue
                  })}
                  minDateTime={new Date(tripStartDate)}
                  maxDateTime={new Date(tripEndDate)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="End Time (Optional)"
                  value={currentActivity.endTime}
                  onChange={(newValue) => setCurrentActivity({
                    ...currentActivity,
                    endTime: newValue
                  })}
                  minDateTime={currentActivity.startTime || new Date(tripStartDate)}
                  maxDateTime={new Date(tripEndDate)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveActivity} 
              variant="contained" 
              disabled={!currentActivity.title.trim()}
            >
              Save Activity
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

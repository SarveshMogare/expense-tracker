import { useState } from 'react';
import { TextField, Button, Box, Paper, Typography, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function AddTripForm({ onAddTrip }) {
  const [tripData, setTripData] = useState({
    destination: '',
    startDate: null,
    endDate: null,
    budget: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!tripData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!tripData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!tripData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (tripData.startDate && tripData.endDate && tripData.startDate > tripData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (tripData.budget && isNaN(parseFloat(tripData.budget)) || parseFloat(tripData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onAddTrip({
      ...tripData,
      id: Date.now(),
      startDate: tripData.startDate.toISOString(),
      endDate: tripData.endDate.toISOString(),
      budget: parseFloat(tripData.budget) || null
    });

    setTripData({
      destination: '',
      startDate: null,
      endDate: null,
      budget: ''
    });
    setErrors({});
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Add New Trip</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Destination"
          value={tripData.destination}
          onChange={(e) => {
            setTripData({ ...tripData, destination: e.target.value });
            if (errors.destination) {
              setErrors({ ...errors, destination: null });
            }
          }}
          error={!!errors.destination}
          helperText={errors.destination}
          fullWidth
          required
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={tripData.startDate}
            onChange={(newDate) => {
              setTripData({ ...tripData, startDate: newDate });
              if (errors.startDate) {
                setErrors({ ...errors, startDate: null });
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!errors.startDate,
                helperText: errors.startDate
              }
            }}
          />

          <DatePicker
            label="End Date"
            value={tripData.endDate}
            onChange={(newDate) => {
              setTripData({ ...tripData, endDate: newDate });
              if (errors.endDate) {
                setErrors({ ...errors, endDate: null });
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!errors.endDate,
                helperText: errors.endDate
              }
            }}
            minDate={tripData.startDate}
          />
        </LocalizationProvider>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Budget (Optional)"
              type="number"
              value={tripData.budget}
              onChange={(e) => {
                setTripData({ ...tripData, budget: e.target.value });
                if (errors.budget) {
                  setErrors({ ...errors, budget: null });
                }
              }}
              error={!!errors.budget}
              helperText={errors.budget}
            />
          </Grid>
        </Grid>

        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          size="large"
          sx={{ mt: 2 }}
        >
          Add Trip
        </Button>
      </Box>
    </Paper>
  );
}

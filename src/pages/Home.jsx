import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TripList from '../components/TripList';
import AddTripForm from '../components/AddTripForm';
import { STORAGE_KEYS, saveToLocalStorage, getFromLocalStorage } from '../utils/localStorage';

export default function Home() {
  const [trips, setTrips] = useState(() => {
    try {
      const savedTrips = getFromLocalStorage(STORAGE_KEYS.TRIPS, []);
      return savedTrips || [];
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    try {
      saveToLocalStorage(STORAGE_KEYS.TRIPS, trips);
    } catch (error) {
      console.error('Error saving trips:', error);
    }
  }, [trips]);

  const handleAddTrip = (newTrip) => {
    try {
      const updatedTrips = [...trips, newTrip];
      setTrips(updatedTrips);
      saveToLocalStorage(STORAGE_KEYS.TRIPS, updatedTrips);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding trip:', error);
    }
  };

  const handleDeleteTrip = (tripId) => {
    try {
      const updatedTrips = trips.filter(trip => trip.id !== tripId);
      setTrips(updatedTrips);
      saveToLocalStorage(STORAGE_KEYS.TRIPS, updatedTrips);
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                My Trips
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setShowAddForm(!showAddForm)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3
                }}
              >
                {showAddForm ? 'Cancel' : 'Add New Trip'}
              </Button>
            </Box>
          </Grid>

          {showAddForm && (
            <Grid item xs={12}>
              <AddTripForm onAddTrip={handleAddTrip} />
            </Grid>
          )}

          <Grid item xs={12}>
            {trips.length > 0 ? (
              <TripList trips={trips} onDeleteTrip={handleDeleteTrip} />
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  backgroundColor: 'grey.50',
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Typography 
                  variant="h6" 
                  color="textSecondary"
                  gutterBottom
                >
                  No trips planned yet
                </Typography>
                <Typography 
                  variant="body1" 
                  color="textSecondary"
                >
                  Click "Add New Trip" to start planning your adventures!
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

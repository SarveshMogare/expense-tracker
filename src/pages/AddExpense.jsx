import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import AddExpenseForm from '../components/AddExpenseForm';
import { 
  getFromLocalStorage, 
  saveToLocalStorage 
} from '../utils/localStorage';
import { STORAGE_KEYS } from '../utils/constants';
import { enqueueSnackbar } from '../utils/snackbar';

// Diagnostic function to help debug local storage issues
const diagnosticLocalStorage = () => {
  try {
    console.group('Local Storage Diagnostic');
    
    // Check all storage keys
    const storageKeys = [
      STORAGE_KEYS.TRIPS, 
      STORAGE_KEYS.EXPENSES, 
      STORAGE_KEYS.FRIENDS
    ];

    storageKeys.forEach(key => {
      const item = localStorage.getItem(key);
      console.log(`${key}:`, item);
      
      try {
        const parsedItem = JSON.parse(item || '[]');
        console.log(`Parsed ${key}:`, parsedItem);
      } catch (parseError) {
        console.error(`Error parsing ${key}:`, parseError);
      }
    });

    console.groupEnd();
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
};

export default function AddExpense() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AddExpense Component Mounted');
    console.log('Current TripId:', tripId);

    // Run diagnostic
    diagnosticLocalStorage();

    try {
      // Fetch trips and current trip
      const savedTrips = getFromLocalStorage(STORAGE_KEYS.TRIPS, []);
      console.log('Saved Trips:', savedTrips);

      // Detailed logging for specific trip
      console.group('Trip Debugging');
      console.log('All Trips:', savedTrips);
      console.log('Searching for Trip ID:', tripId);
      console.log('Parsed Trip ID:', parseInt(tripId));

      // Check each trip for potential match issues
      savedTrips.forEach(trip => {
        console.log('Comparing Trip:', {
          storedId: trip.id,
          storedIdType: typeof trip.id,
          inputId: parseInt(tripId),
          inputIdType: typeof parseInt(tripId),
          match: trip.id === parseInt(tripId)
        });
      });

      const currentTrip = savedTrips.find(t => t.id === parseInt(tripId));
      console.log('Current Trip Found:', currentTrip);
      console.groupEnd();
      
      if (!currentTrip) {
        console.error('Trip not found for ID:', tripId);
        console.error('All trips:', savedTrips);
        
        // If no trips exist, redirect to home or show error
        if (savedTrips.length === 0) {
          setError('No trips found. Please create a trip first.');
        } else {
          setError(`Trip with ID ${tripId} not found. Available trips: ${savedTrips.map(t => t.id).join(', ')}`);
        }
        
        navigate('/');
        return;
      }

      // Fetch existing expenses for this trip
      const savedExpenses = getFromLocalStorage(STORAGE_KEYS.EXPENSES, [])
        .filter(exp => exp.tripId === parseInt(tripId));

      console.log('Saved Expenses:', savedExpenses);

      // Fetch friends for this trip
      const savedFriends = getFromLocalStorage(STORAGE_KEYS.FRIENDS, [])
        .filter(friend => friend.tripId === parseInt(tripId));

      console.log('Saved Friends:', savedFriends);

      setTrips(savedTrips);
      setTrip(currentTrip);
      setExpenses(savedExpenses);
      setFriends(savedFriends);
      setIsLoading(false);
    } catch (err) {
      console.error('Error in AddExpense useEffect:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [tripId, navigate]);

  const handleAddExpense = (newExpense) => {
    try {
      console.group('Add Expense Handler');
      console.log('New Expense:', newExpense);

      // Validate expense object
      if (!newExpense || !newExpense.tripId) {
        throw new Error('Invalid expense object');
      }

      // Retrieve existing expenses
      const existingExpenses = getFromLocalStorage(STORAGE_KEYS.EXPENSES, []);
      
      // Add new expense
      const updatedExpenses = [...existingExpenses, newExpense];
      
      // Save to local storage
      saveToLocalStorage(STORAGE_KEYS.EXPENSES, updatedExpenses);

      console.log('Updated Expenses:', updatedExpenses);
      console.groupEnd();

      // Show success notification
      enqueueSnackbar('Expense added successfully!', { variant: 'success' });
      
      // Navigate back to trip details
      navigate(`/trips/${newExpense.tripId}`);
    } catch (error) {
      console.error('Error adding expense:', error);
      enqueueSnackbar('Failed to add expense. Please try again.', { variant: 'error' });
      console.groupEnd();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  // No trip found
  if (!trip) {
    return (
      <Container maxWidth="sm">
        <Alert severity="warning">
          No trip found. Please select a valid trip.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mt: 4 
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%', 
            p: 3, 
            borderRadius: 2 
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Debug Info: 
                Trip ID: {tripId}, 
                Parsed Trip ID: {parseInt(tripId)}
              </Typography>
            </Alert>
          )}

          <Typography 
            variant="h5" 
            color="primary" 
            gutterBottom
            sx={{ textAlign: 'center', mb: 3 }}
          >
            Add Expense to {trip ? trip.name : 'Trip'}
          </Typography>

          {trip && (
            <AddExpenseForm 
              onAddExpense={handleAddExpense}
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              tripId={parseInt(tripId)}
              friends={friends}
            />
          )}

          {!trip && (
            <Alert severity="warning">
              No trip details available. Please check your trip configuration.
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ ml: 2 }}
                onClick={() => navigate('/')}
              >
                Go to Trips
              </Button>
            </Alert>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate(`/trips/${tripId}`)}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

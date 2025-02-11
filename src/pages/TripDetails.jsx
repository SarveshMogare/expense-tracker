import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Divider,
  Grid,
  Tabs,
  Tab,
  Paper,
  Alert,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import ExpenseList from '../components/ExpenseList';
import FriendsList from '../components/FriendsList';
import TripChecklist from '../components/TripChecklist';
import TripItinerary from '../components/TripItinerary';
import BudgetTracker from '../components/BudgetTracker';
import { STORAGE_KEYS, saveToLocalStorage, getFromLocalStorage } from '../utils/localStorage';

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const trips = getFromLocalStorage(STORAGE_KEYS.TRIPS, []);
    const foundTrip = trips.find(t => t.id === parseInt(tripId));
    if (!foundTrip) {
      navigate('/');
      return;
    }
    setTrip(foundTrip);

    const allExpenses = getFromLocalStorage(STORAGE_KEYS.EXPENSES, []);
    const tripExpenses = allExpenses.filter(expense => expense.tripId === parseInt(tripId));
    setExpenses(tripExpenses);

    const allFriends = getFromLocalStorage(STORAGE_KEYS.FRIENDS, []);
    const tripFriends = allFriends.filter(friend => friend.tripId === parseInt(tripId));
    setFriends(tripFriends);
  }, [tripId, navigate]);

  const handleDeleteExpense = (expenseId) => {
    try {
      const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
      const allExpenses = getFromLocalStorage(STORAGE_KEYS.EXPENSES, []);
      const filteredExpenses = allExpenses.filter(expense => expense.id !== expenseId);
      
      saveToLocalStorage(STORAGE_KEYS.EXPENSES, filteredExpenses);
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleAddExpense = () => {
    navigate(`/trips/${tripId}/add-expense`);
  };

  const handleAddFriend = (newFriends) => {
    try {
      // If newFriends is an array, use it directly; otherwise, treat it as a single friend
      const friendsToAdd = Array.isArray(newFriends) ? newFriends : [newFriends];
      
      // Get all friends from storage
      const allFriends = getFromLocalStorage(STORAGE_KEYS.FRIENDS, []);
      
      // Filter out old trip friends and add new ones
      const otherFriends = allFriends.filter(friend => friend.tripId !== parseInt(tripId));
      const updatedFriends = [...otherFriends, ...friendsToAdd];
      
      // Save to local storage
      saveToLocalStorage(STORAGE_KEYS.FRIENDS, updatedFriends);
      
      // Update state with only this trip's friends
      setFriends(friendsToAdd);
    } catch (error) {
      console.error('Error updating friends:', error);
    }
  };

  const handleDeleteFriend = (friendId) => {
    try {
      const updatedFriends = friends.filter(friend => friend.id !== friendId);
      const allFriends = getFromLocalStorage(STORAGE_KEYS.FRIENDS, []);
      const filteredFriends = allFriends.filter(friend => friend.id !== friendId);
      
      saveToLocalStorage(STORAGE_KEYS.FRIENDS, filteredFriends);
      setFriends(updatedFriends);
    } catch (error) {
      console.error('Error deleting friend:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  if (!trip) {
    return null;
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FriendsList
                friends={friends}
                tripId={parseInt(tripId)}
                onAddFriend={handleAddFriend}
                onDeleteFriend={handleDeleteFriend}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Expenses</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddExpense}
                >
                  Add Expense
                </Button>
              </Box>

              <ExpenseList
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
                friends={friends}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TripChecklist tripId={tripId} />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TripItinerary 
                tripId={tripId} 
                tripStartDate={trip.startDate}
                tripEndDate={trip.endDate}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {trip.destination}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {format(new Date(trip.startDate), 'MMM dd, yyyy')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Budget Tracker
        </Typography>
        {trip.budget ? (
          <BudgetTracker trip={trip} expenses={expenses} />
        ) : (
          <Alert severity="info">
            No budget set for this trip. Add a budget in trip settings.
          </Alert>
        )}
      </Paper>

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 3 
        }}
      >
        <Tab label="Expenses" />
        <Tab label="Checklist" />
        <Tab label="Itinerary" />
      </Tabs>

      {renderTabContent()}
    </Container>
  );
}

export default TripDetails;

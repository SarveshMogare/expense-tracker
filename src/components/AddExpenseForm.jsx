import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EXPENSE_CATEGORIES = [
  'Food', 
  'Transportation', 
  'Accommodation', 
  'Entertainment', 
  'Shopping', 
  'Miscellaneous'
];

export default function AddExpenseForm({ 
  onAddExpense, 
  tripStartDate, 
  tripEndDate, 
  tripId,
  friends = [] 
}) {
  // Log props for debugging
  useEffect(() => {
    console.log('AddExpenseForm Props:', {
      onAddExpense: !!onAddExpense,
      tripStartDate,
      tripEndDate,
      tripId,
      friends
    });
  }, [onAddExpense, tripStartDate, tripEndDate, tripId, friends]);

  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    date: null,
    category: 'Miscellaneous',
    splitType: 'none',
    splitFriends: [],
    splitAmounts: {} 
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if friends exist and add self to split list by default
    if (friends && friends.length > 0) {
      // Get sorted friends
      const sortedFriends = sortFriendsForSplit(friends);
      
      // Find the friend that represents the current user
      const selfFriend = sortedFriends.find(friend => friend.isSelf);
      
      // If no self friend is marked, use the first friend
      const friendToAdd = selfFriend || sortedFriends[0];
      
      if (friendToAdd) {
        setExpenseData(prev => ({
          ...prev,
          splitFriends: prev.splitFriends.includes(friendToAdd.id) 
            ? prev.splitFriends 
            : [friendToAdd.id, ...prev.splitFriends]
        }));
      }
    }
  }, [friends]);

  const handleSplitTypeChange = (type) => {
    setExpenseData(prev => {
      const newState = {
        ...prev,
        splitType: type,
        splitFriends: type === 'none' ? [] : prev.splitFriends
      };

      // Reset split amounts based on split type
      if (type === 'none') {
        newState.splitAmounts = {};
      } else if (type === 'equal') {
        // Prepare equal split amounts
        const splitCount = newState.splitFriends.length + 1; // Include the current user
        const equalAmount = parseFloat(prev.amount) / splitCount;
        newState.splitAmounts = newState.splitFriends.reduce((acc, friendId) => {
          acc[friendId] = equalAmount;
          return acc;
        }, {});
      }

      return newState;
    });
  };

  const handleFriendSplitToggle = (friendId) => {
    setExpenseData(prev => {
      const currentSplitFriends = prev.splitFriends || [];
      const updatedSplitFriends = currentSplitFriends.includes(friendId)
        ? currentSplitFriends.filter(id => id !== friendId)
        : [...currentSplitFriends, friendId];
      
      const newState = {
        ...prev,
        splitFriends: updatedSplitFriends
      };

      // Reset split amounts when friends change
      if (prev.splitType === 'equal') {
        const splitCount = updatedSplitFriends.length + 1;
        const equalAmount = parseFloat(prev.amount) / splitCount;
        newState.splitAmounts = updatedSplitFriends.reduce((acc, id) => {
          acc[id] = equalAmount;
          return acc;
        }, {});
      } else if (prev.splitType === 'value') {
        // Remove or add friend from split amounts
        const newSplitAmounts = { ...prev.splitAmounts };
        if (currentSplitFriends.includes(friendId)) {
          delete newSplitAmounts[friendId];
        } else {
          newSplitAmounts[friendId] = 0;
        }
        newState.splitAmounts = newSplitAmounts;
      }

      return newState;
    });
  };

  const handleSplitAmountChange = (friendId, amount) => {
    setExpenseData(prev => ({
      ...prev,
      splitAmounts: {
        ...prev.splitAmounts,
        [friendId]: parseFloat(amount) || 0
      }
    }));
  };

  const handleEqualSplit = (totalAmount, friendIds) => {
    // Ensure at least one friend is selected
    if (!friendIds || friendIds.length === 0) {
      return {};
    }

    // Calculate equal split amount
    const splitAmount = Number((totalAmount / friendIds.length).toFixed(2));

    // Create split amounts object
    return friendIds.reduce((acc, friendId) => {
      acc[friendId] = splitAmount;
      return acc;
    }, {});
  };

  const validateSplitAmounts = (splitType, totalAmount, friendIds, splitAmounts) => {
    // If no split or no friends, return valid
    if (splitType === 'none' || !friendIds || friendIds.length === 0) {
      return { isValid: true };
    }

    // For equal split, auto-calculate and validate
    if (splitType === 'equal') {
      const equalSplitAmounts = handleEqualSplit(totalAmount, friendIds);
      return { 
        isValid: true, 
        splitAmounts: equalSplitAmounts 
      };
    }

    // For value split, manually validate
    if (splitType === 'value') {
      // Ensure all selected friends have an amount
      const missingAmountFriends = friendIds.filter(
        friendId => !splitAmounts[friendId]
      );

      if (missingAmountFriends.length > 0) {
        return { 
          isValid: false, 
          error: `Please enter amounts for: ${missingAmountFriends.map(id => 
            friends.find(f => f.id === id)?.name
          ).join(', ')}` 
        };
      }

      // Calculate total of split amounts
      const totalSplitAmount = friendIds.reduce(
        (total, friendId) => total + (splitAmounts[friendId] || 0), 
        0
      );

      // Check if total matches expense amount
      if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
        return { 
          isValid: false, 
          error: `Split amounts (₹${totalSplitAmount.toFixed(2)}) must total the full expense amount (₹${totalAmount.toFixed(2)})` 
        };
      }

      return { isValid: true };
    }

    // Fallback
    return { isValid: false, error: 'Invalid split type' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Comprehensive debugging log
    console.group('Expense Submission Debug');
    console.log('Full Expense Data:', {
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date,
      splitType: expenseData.splitType,
      splitFriends: expenseData.splitFriends,
      splitAmounts: expenseData.splitAmounts,
      tripId: tripId
    });

    // Reset any previous errors
    setError(null);

    // Validation checks with detailed logging
    const validationErrors = [];

    // Description validation
    if (!expenseData.description || expenseData.description.trim() === '') {
      console.warn('Validation Error: Description is required');
      validationErrors.push('Description is required');
    }

    // Amount validation
    const parsedAmount = parseFloat(expenseData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.warn('Validation Error: Invalid amount', { amount: expenseData.amount });
      validationErrors.push('Please enter a valid amount');
    }

    // Date validation
    if (!expenseData.date) {
      console.warn('Validation Error: Date is required');
      validationErrors.push('Date is required');
    }

    // Category validation
    if (!expenseData.category) {
      console.warn('Validation Error: Category is required');
      validationErrors.push('Category is required');
    }

    // Find self friend
    const selfFriend = friends.find(friend => friend.isSelf);

    // Split expense validation
    if (expenseData.splitType !== 'none') {
      const splitValidation = validateSplitAmounts(
        expenseData.splitType, 
        parseFloat(expenseData.amount), 
        expenseData.splitFriends, 
        expenseData.splitAmounts
      );

      if (!splitValidation.isValid) {
        console.warn('Validation Error: Split amounts', splitValidation);
        validationErrors.push(splitValidation.error);
      }
    }

    // Check for validation errors
    if (validationErrors.length > 0) {
      console.error('Submission Blocked - Validation Errors:', validationErrors);
      setError(validationErrors.join(', '));
      console.groupEnd();
      return;
    }

    // Prepare split details
    const splitDetails = expenseData.splitType !== 'none' 
      ? {
          type: expenseData.splitType,
          friends: expenseData.splitFriends,
          splitAmounts: expenseData.splitType === 'equal'
            ? Object.fromEntries(
                expenseData.splitFriends.map(friendId => [
                  friendId, 
                  Number((parsedAmount / expenseData.splitFriends.length).toFixed(2))
                ])
              )
            : expenseData.splitAmounts
        }
      : null;

    // Calculate your personal expense amount
    const personalAmount = splitDetails 
      ? (splitDetails.splitAmounts[selfFriend?.id] || parsedAmount)
      : parsedAmount;

    // Create final expense object
    const newExpense = {
      id: Date.now(), // Unique identifier
      tripId: parseInt(tripId),
      description: expenseData.description,
      amount: personalAmount, // Only your personal amount
      date: expenseData.date.toISOString(),
      category: expenseData.category,
      splitDetails,
      paidBy: selfFriend?.id // Track who paid
    };

    console.log('Final Expense Object:', newExpense);

    try {
      // Call parent function to add expense
      if (typeof onAddExpense !== 'function') {
        throw new Error('onAddExpense is not a valid function');
      }

      onAddExpense(newExpense);
      console.log('Expense added successfully');
      console.groupEnd();
    } catch (error) {
      console.error('Error adding expense:', error);
      setError(error.message);
      console.groupEnd();
    }
  };

  const renderSplitAmountInputs = () => {
    // Only show if split type is not 'none' and friends are selected
    if (expenseData.splitType === 'none' || expenseData.splitFriends.length === 0) {
      return null;
    }

    // Get sorted friends
    const sortedFriends = sortFriendsForSplit(friends)
      .filter(friend => expenseData.splitFriends.includes(friend.id));

    // If equal split, auto-calculate and disable inputs
    if (expenseData.splitType === 'equal') {
      const equalSplitAmounts = handleEqualSplit(
        parseFloat(expenseData.amount), 
        expenseData.splitFriends
      );

      return sortedFriends.map(friend => (
        <Grid item xs={12} key={friend.id}>
          <TextField
            fullWidth
            label={`${friend.name}'s Share`}
            type="number"
            value={equalSplitAmounts[friend.id]}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />
        </Grid>
      ));
    }

    // For 'value' split, allow manual input
    return sortedFriends.map(friend => (
      <Grid item xs={12} key={friend.id}>
        <TextField
          fullWidth
          label={`${friend.name}'s Share`}
          type="number"
          value={expenseData.splitAmounts[friend.id] || ''}
          onChange={(e) => {
            const value = e.target.value === '' 
              ? '' 
              : Number(parseFloat(e.target.value).toFixed(2));
            
            setExpenseData(prev => ({
              ...prev,
              splitAmounts: {
                ...prev.splitAmounts,
                [friend.id]: value
              }
            }));
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">₹</InputAdornment>
            ),
          }}
          error={
            expenseData.splitAmounts[friend.id] === '' || 
            expenseData.splitAmounts[friend.id] === 0
          }
          helperText={
            (expenseData.splitAmounts[friend.id] === '' || 
            expenseData.splitAmounts[friend.id] === 0) 
              ? 'Please enter a valid amount' 
              : ''
          }
        />
      </Grid>
    ));
  };

  const sortFriendsForSplit = (friends) => {
    // If no friends, return empty array
    if (!friends || friends.length === 0) return [];

    // Find self friend
    const selfFriend = friends.find(friend => friend.isSelf);

    // Sort friends with specific priority
    const sortedFriends = [...friends].sort((a, b) => {
      // Self friend always comes first
      if (a.isSelf) return -1;
      if (b.isSelf) return 1;

      // Then sort by name
      return a.name.localeCompare(b.name);
    });

    return sortedFriends;
  };

  const renderFriendSelections = () => {
    // Get sorted friends
    const sortedFriends = sortFriendsForSplit(friends);

    return sortedFriends.map(friend => (
      <FormControlLabel
        key={friend.id}
        control={
          <Checkbox
            checked={expenseData.splitFriends.includes(friend.id)}
            onChange={() => handleFriendSplitToggle(friend.id)}
            color={friend.isSelf ? "primary" : "default"}
          />
        }
        label={
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: friend.isSelf ? 'bold' : 'normal'
            }}
          >
            {friend.name} 
            {friend.isSelf && (
              <Chip 
                label="You" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ ml: 1 }} 
              />
            )}
          </Box>
        }
      />
    ));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 2, 
          p: 3,
          mb: 2 
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom>
          Add New Expense
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              value={expenseData.description}
              onChange={(e) => setExpenseData({
                ...expenseData, 
                description: e.target.value
              })}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={expenseData.amount}
              onChange={(e) => setExpenseData({
                ...expenseData, 
                amount: e.target.value
              })}
              required
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Expense Date"
              value={expenseData.date}
              onChange={(newDate) => setExpenseData({
                ...expenseData, 
                date: newDate
              })}
              renderInput={(params) => <TextField {...params} fullWidth required />}
              minDate={new Date(tripStartDate)}
              maxDate={new Date(tripEndDate)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={expenseData.category}
                onChange={(e) => setExpenseData({
                  ...expenseData, 
                  category: e.target.value
                })}
                label="Category"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Expense Splitting
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={expenseData.splitType === 'none'}
                    onChange={() => handleSplitTypeChange('none')}
                  />
                }
                label="No Split"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={expenseData.splitType === 'equal'}
                    onChange={() => handleSplitTypeChange('equal')}
                  />
                }
                label="Split Equally"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={expenseData.splitType === 'value'}
                    onChange={() => handleSplitTypeChange('value')}
                  />
                }
                label="Split by Value"
              />
            </FormGroup>

            {(expenseData.splitType === 'equal' || expenseData.splitType === 'value') && friends.length > 0 && (
              <Stack direction="column" spacing={2} sx={{ mt: 2, mb: 2 }}>
                {renderFriendSelections()}
                {renderSplitAmountInputs()}
              </Stack>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
            >
              Add Expense
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

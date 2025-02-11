import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Paper, 
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GroupIcon from '@mui/icons-material/Group';

const EXPENSE_CATEGORIES = [
  'Food', 
  'Transportation', 
  'Accommodation', 
  'Entertainment', 
  'Shopping', 
  'Miscellaneous'
];

export default function ExpenseList({ 
  expenses = [], 
  onDeleteExpense, 
  friends = [] 
}) {
  const [groupBy, setGroupBy] = useState('days'); // 'days' or 'categories'
  const [expandedSplitExpenses, setExpandedSplitExpenses] = useState({});
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [splitDetailsOpen, setSplitDetailsOpen] = useState(false);

  // Defensive programming: ensure expenses and friends are arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeFriends = Array.isArray(friends) ? friends : [];

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Check if expense is split
  const isExpenseSplit = (expense) => {
    return expense && expense.splitDetails && expense.splitDetails.type !== 'none';
  };

  const toggleSplitExpenseDetails = (expenseId) => {
    setExpandedSplitExpenses(prev => ({
      ...prev,
      [expenseId]: !prev[expenseId]
    }));
  };

  const handleViewSplitDetails = (expense) => {
    // Validate expense before showing dialog
    if (!expense || !expense.splitDetails) {
      console.error('Invalid expense or missing split details');
      return;
    }

    // Deep clone the expense to avoid any reference issues
    const expenseClone = JSON.parse(JSON.stringify(expense));
    setSelectedExpense(expenseClone);
    setSplitDetailsOpen(true);
  };

  const handleCloseSplitDetails = () => {
    setSplitDetailsOpen(false);
    // Clear selected expense after dialog closes
    setTimeout(() => setSelectedExpense(null), 300);
  };

  const renderSplitDetails = (splitDetails) => {
    // Comprehensive validation
    if (!splitDetails || 
        !splitDetails.friends || 
        !Array.isArray(splitDetails.friends) || 
        !splitDetails.splitAmounts) {
      console.error('Invalid split details:', splitDetails);
      return (
        <Typography color="text.secondary">
          No split details available
        </Typography>
      );
    }

    try {
      // Get friend names and amounts with validation
      const splitFriendDetails = splitDetails.friends
        .map(friendId => {
          if (!friendId) return null;
          
          const friend = safeFriends.find(f => f.id === friendId);
          const amount = splitDetails.splitAmounts[friendId];
          
          if (!friend || typeof amount !== 'number') {
            console.warn('Invalid friend or amount:', { friendId, friend, amount });
            return null;
          }
          
          return {
            name: friend.name,
            amount: amount,
            isSelf: friend.isSelf || false
          };
        })
        .filter(detail => detail !== null) // Remove invalid entries
        .sort((a, b) => b.isSelf - a.isSelf); // Sort with self first

      if (splitFriendDetails.length === 0) {
        console.warn('No valid split details found after processing');
        return (
          <Typography color="text.secondary">
            No valid split details found
          </Typography>
        );
      }

      return (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Split Type: {splitDetails.type ? (splitDetails.type.charAt(0).toUpperCase() + splitDetails.type.slice(1)) : 'Unknown'}
          </Typography>
          
          <Grid container spacing={2}>
            {splitFriendDetails.map((detail, index) => (
              <Grid item xs={12} key={index}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: detail.isSelf ? 'primary.light' : 'grey.100',
                    borderRadius: 2
                  }}
                >
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: detail.isSelf ? 'primary.main' : 'grey.500',
                          width: 32,
                          height: 32
                        }}
                      >
                        {detail.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography>
                        {detail.name} {detail.isSelf && '(You)'}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {formatCurrency(detail.amount)}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Amount: {formatCurrency(splitFriendDetails.reduce((sum, detail) => sum + detail.amount, 0))}
            </Typography>
          </Box>
        </Box>
      );
    } catch (error) {
      console.error('Error rendering split details:', error);
      return (
        <Typography color="error">
          Error displaying split details. Please try again.
        </Typography>
      );
    }
  };

  const renderSplitExpenseDetails = (expense) => {
    // Comprehensive null checks
    if (!expense || !isExpenseSplit(expense)) return null;

    const { splitDetails } = expense;
    
    // Ensure friends and splitDetails are valid
    if (!splitDetails || !splitDetails.friends) {
      console.warn('Invalid split details:', splitDetails);
      return null;
    }

    const splitFriendNames = splitDetails.friends
      .map(friendId => {
        const friend = safeFriends.find(f => f.id === friendId);
        return friend ? friend.name : 'Unknown';
      })
      .filter(Boolean); // Remove any undefined names

    return (
      <Collapse 
        in={expandedSplitExpenses[expense.id]} 
        timeout="auto" 
        unmountOnExit
      >
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'action.hover', 
          borderRadius: 1 
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Split Type: {
                  splitDetails.type === 'equal' 
                    ? 'Equal Split' 
                    : splitDetails.type === 'value' 
                      ? 'Split by Value' 
                      : 'No Split'
                }
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">
                Split Among:
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {splitFriendNames.map(name => (
                    <Chip 
                      key={name} 
                      label={name} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Typography>
            </Grid>
            {(splitDetails.type === 'equal' || splitDetails.type === 'value') && splitDetails.splitAmounts && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Split Details:
                  <Box sx={{ mt: 1 }}>
                    {splitDetails.friends.map(friendId => {
                      const friend = safeFriends.find(f => f.id === friendId);
                      const splitAmount = splitDetails.splitAmounts[friendId] || 0;
                      return (
                        <Box 
                          key={friendId} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mb: 0.5 
                          }}
                        >
                          <Typography variant="body2">
                            {friend ? friend.name : 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {formatCurrency(splitAmount)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Collapse>
    );
  };

  const hasSplitDetails = (expense) => {
    return expense?.splitDetails?.type !== 'none' && 
           expense?.splitDetails?.friends?.length > 0 &&
           expense?.splitDetails?.splitAmounts &&
           Object.keys(expense.splitDetails.splitAmounts).length > 0;
  };

  // Render expense item
  const renderExpenseItem = (expense, index) => {
    // Comprehensive null checks
    if (!expense) return null;

    return (
      <React.Fragment key={expense.id}>
        {index > 0 && <Divider />}
        <ListItem
          secondaryAction={
            <Stack direction="row" spacing={1}>
              {hasSplitDetails(expense) && (
                <Tooltip title="View Split Details">
                  <IconButton 
                    onClick={() => handleViewSplitDetails(expense)}
                    size="small"
                    color="primary"
                  >
                    <GroupIcon />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton 
                edge="end" 
                onClick={() => onDeleteExpense(expense.id)}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          }
        >
          <Stack spacing={0.5} sx={{ width: '100%' }}>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
            >
              <Typography>{expense.description || 'Untitled Expense'}</Typography>
              <Typography fontWeight="medium">
                {formatCurrency(expense.amount || 0)}
              </Typography>
            </Stack>
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center"
            >
              <Chip 
                label={expense.category || 'Uncategorized'} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              {expense.splitDetails?.type && expense.splitDetails.type !== 'none' && (
                <Chip 
                  label={`Split ${expense.splitDetails.type}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
        </ListItem>
      </React.Fragment>
    );
  };

  // Group expenses by date
  const groupExpensesByDate = (expenses) => {
    const groupedExpenses = {};
    
    expenses.forEach(expense => {
      const expenseDate = format(parseISO(expense.date), 'yyyy-MM-dd');
      
      if (!groupedExpenses[expenseDate]) {
        groupedExpenses[expenseDate] = {
          expenses: [],
          total: 0
        };
      }
      
      groupedExpenses[expenseDate].expenses.push(expense);
      groupedExpenses[expenseDate].total += expense.amount || 0;
    });

    // Sort dates in descending order
    return Object.keys(groupedExpenses)
      .sort((a, b) => new Date(b) - new Date(a))
      .reduce((sorted, date) => {
        sorted[date] = groupedExpenses[date];
        return sorted;
      }, {});
  };

  // Render expenses grouped by date
  const renderExpensesByDate = () => {
    const groupedExpenses = groupExpensesByDate(safeExpenses);

    return Object.entries(groupedExpenses).map(([date, { expenses, total }]) => (
      <Box key={date} sx={{ mb: 2 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1,
            fontWeight: 'bold'
          }}
        >
          <Box>
            {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
          </Box>
          <Chip 
            label={formatCurrency(total)} 
            color="primary" 
            variant="outlined" 
            size="small"
          />
        </Typography>
        <List>
          {expenses.map((expense, index) => renderExpenseItem(expense, index))}
        </List>
      </Box>
    ));
  };

  return (
    <Box>
      {/* Grouping control */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Group By</InputLabel>
          <Select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            label="Group By"
          >
            <MenuItem value="days">Days</MenuItem>
            <MenuItem value="categories">Categories</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Render expenses */}
      {groupBy === 'days' 
        ? renderExpensesByDate() 
        : (
          <List>
            {safeExpenses.map((expense, index) => renderExpenseItem(expense, index))}
          </List>
        )
      }

      <Dialog 
        open={splitDetailsOpen} 
        onClose={handleCloseSplitDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedExpense && (
            <>
              <Typography variant="h6">
                Split Details
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedExpense.description} - {formatCurrency(selectedExpense.amount)}
              </Typography>
            </>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedExpense?.splitDetails ? (
            renderSplitDetails(selectedExpense.splitDetails)
          ) : (
            <Typography color="text.secondary">
              No split details available
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSplitDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

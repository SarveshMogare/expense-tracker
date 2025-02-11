import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Card, 
  CardContent, 
  Chip, 
  Tooltip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as MoneyIcon 
} from '@mui/icons-material';
import { getFromLocalStorage } from '../utils/localStorage';

const calculateBudgetStats = (trip, expenses) => {
  if (!trip || !trip.budget) return null;

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const budgetPercentage = (totalExpenses / trip.budget) * 100;
  const remainingBudget = trip.budget - totalExpenses;

  return {
    totalExpenses,
    budgetPercentage: Math.min(budgetPercentage, 100),
    remainingBudget,
    status: budgetPercentage < 50 ? 'good' : 
            budgetPercentage < 75 ? 'warning' : 
            'danger'
  };
};

export default function BudgetTracker({ trip, expenses: propExpenses }) {
  const theme = useTheme();
  const [budgetStats, setBudgetStats] = useState(null);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Prioritize prop expenses, then fetch from localStorage
    const trackedExpenses = propExpenses || 
      (getFromLocalStorage('expenses', [])
        .filter(exp => exp.tripId === trip?.id) || []);

    setExpenses(trackedExpenses);
    setBudgetStats(calculateBudgetStats(trip, trackedExpenses));
  }, [trip, propExpenses]);

  // If no budget set, return informative message
  if (!trip?.budget) {
    return (
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          background: alpha(theme.palette.primary.light, 0.1),
          border: `1px solid ${theme.palette.primary.main}`
        }}
      >
        <CardContent>
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
          >
            <MoneyIcon color="primary" />
            <Typography variant="body1" color="primary">
              No budget set for this trip. Add a budget to start tracking expenses.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Determine color and icon based on budget status
  const getStatusDetails = () => {
    switch (budgetStats?.status) {
      case 'good': return {
        color: theme.palette.success.main, 
        lightColor: theme.palette.success.light,
        icon: <TrendingUpIcon color="success" />,
        text: 'On Track'
      };
      case 'warning': return {
        color: theme.palette.warning.main, 
        lightColor: theme.palette.warning.light,
        icon: <TrendingDownIcon color="warning" />,
        text: 'Caution'
      };
      case 'danger': return {
        color: theme.palette.error.main, 
        lightColor: theme.palette.error.light,
        icon: <TrendingDownIcon color="error" />,
        text: 'Over Budget'
      };
      default: return {
        color: theme.palette.primary.main, 
        lightColor: theme.palette.primary.light,
        icon: null,
        text: 'Unknown'
      };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2,
        background: alpha(statusDetails.lightColor, 0.1),
        border: `1px solid ${statusDetails.color}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 4px 6px ${alpha(statusDetails.color, 0.2)}`
        }
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Budget Header */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <MoneyIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" color="primary">
                Budget Tracker
              </Typography>
            </Stack>
            
            <Chip 
              icon={<MoneyIcon />}
              label={`Budget: ₹${trip.budget.toLocaleString()}`} 
              color="primary" 
              variant="outlined" 
            />
          </Box>

          {budgetStats && (
            <Stack spacing={2}>
              {/* Progress Indicator */}
              <Box display="flex" alignItems="center" gap={2}>
                <Box flex={1}>
                  <Tooltip 
                    title={`Spent: ₹${budgetStats.totalExpenses.toLocaleString()}`}
                    placement="top"
                  >
                    <LinearProgress
                      variant="determinate"
                      value={budgetStats.budgetPercentage}
                      color={
                        budgetStats.status === 'good' ? 'success' :
                        budgetStats.status === 'warning' ? 'warning' :
                        'error'
                      }
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        [`& .MuiLinearProgress-bar`]: {
                          borderRadius: 5
                        }
                      }}
                    />
                  </Tooltip>
                </Box>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                >
                  {`${Math.round(budgetStats.budgetPercentage)}%`}
                </Typography>
              </Box>

              {/* Budget Details */}
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {statusDetails.icon}
                  <Typography 
                    variant="body2" 
                    sx={{ color: statusDetails.color }}
                  >
                    {statusDetails.text}
                  </Typography>
                </Stack>

                <Typography variant="body2" color="textSecondary">
                  Remaining: ₹{budgetStats.remainingBudget.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

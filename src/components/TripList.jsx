import { Grid, Card, CardContent, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function TripList({ trips, onDeleteTrip }) {
  const navigate = useNavigate();

  const handleClick = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  const handleDelete = (e, tripId) => {
    e.stopPropagation();
    onDeleteTrip(tripId);
  };

  return (
    <Grid container spacing={3}>
      {trips.map((trip) => (
        <Grid item xs={12} sm={6} md={4} key={trip.id}>
          <Card 
            onClick={() => handleClick(trip.id)}
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" component="h2" gutterBottom>
                  {trip.destination}
                </Typography>
                <IconButton 
                  onClick={(e) => handleDelete(e, trip.id)}
                  size="small"
                  color="error"
                  sx={{ 
                    marginTop: -1, 
                    marginRight: -1,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.04)'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography color="textSecondary" gutterBottom>
                {format(new Date(trip.startDate), 'MMM dd, yyyy')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Avatar,
  IconButton, 
  TextField, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { saveToLocalStorage, getFromLocalStorage } from '../utils/localStorage';

const RELATIONSHIP_TYPES = [
  'Single',
  'Couple',
  'Family',
  'Friends Group'
];

const STORAGE_KEYS = {
  FRIENDS: 'friends'
};

export default function FriendsList({ 
  friends = [], 
  onAddFriend, 
  onDeleteFriend, 
  tripId 
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newFriend, setNewFriend] = useState({
    name: '',
    relationship: 'Single',
    partnerName: ''
  });

  // Robust friend list processing
  const safeFriends = (() => {
    // If friends is an array of arrays, flatten it
    if (friends.length > 0 && Array.isArray(friends[0])) {
      console.warn('Flattening nested friends array');
      return friends.flat();
    }

    // Filter out invalid friend objects
    return friends.filter(friend => 
      friend && 
      typeof friend === 'object' && 
      friend.name && 
      friend.id
    );
  })();

  const handleMarkAsSelf = (friendId) => {
    // Validate inputs
    if (!friendId) {
      console.error('Invalid friend ID');
      return;
    }

    // Ensure friends is an array and not empty
    if (!Array.isArray(safeFriends) || safeFriends.length === 0) {
      console.error('No friends available to mark as self');
      return;
    }

    // Find the friend to mark as self
    const friendToMark = safeFriends.find(friend => friend.id === friendId);
    
    if (!friendToMark) {
      console.error('Friend not found with ID:', friendId);
      return;
    }

    // Create updated friends list
    const updatedFriends = safeFriends.map(friend => ({
      ...friend,
      isSelf: friend.id === friendId
    }));

    // Validate that exactly one friend is marked as self
    const selfFriends = updatedFriends.filter(friend => friend.isSelf);
    if (selfFriends.length !== 1) {
      console.error('Failed to mark friend as self');
      return;
    }

    try {
      // Call onAddFriend with the updated friends array
      if (typeof onAddFriend === 'function') {
        onAddFriend(updatedFriends);
      } else {
        console.error('onAddFriend is not a function');
      }
    } catch (error) {
      console.error('Error marking friend as self:', error);
      alert('Failed to mark friend. Please try again.');
    }
  };

  const handleAddFriend = () => {
    // Validate input
    const trimmedName = newFriend.name.trim();
    if (!trimmedName) {
      alert('Please enter a name');
      return;
    }

    // Prepare friend object with comprehensive validation
    const friendToAdd = {
      id: Date.now(), // Ensure unique ID
      name: trimmedName,
      relationship: newFriend.relationship || 'Single',
      partnerName: newFriend.relationship !== 'Single' ? (newFriend.partnerName || '') : '',
      tripId: tripId || null,
      isSelf: safeFriends.length === 0 // Auto-mark first friend as self
    };

    // Validate friend object
    const requiredProps = ['id', 'name', 'relationship', 'tripId'];
    const missingProps = requiredProps.filter(prop => !friendToAdd[prop]);
    
    if (missingProps.length > 0) {
      console.error('Cannot add friend - missing properties:', {
        missingProps,
        friendToAdd
      });
      alert('Failed to add friend. Please check your input.');
      return;
    }

    // Create new friends array
    const updatedFriends = [...safeFriends, friendToAdd];

    try {
      // Update local storage
      saveToLocalStorage(STORAGE_KEYS.FRIENDS, updatedFriends);
      
      // Update parent component's state
      if (typeof onAddFriend === 'function') {
        onAddFriend(updatedFriends);
      } else {
        console.error('onAddFriend is not a function');
      }

      // Reset dialog
      setNewFriend({
        name: '',
        relationship: 'Single',
        partnerName: ''
      });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend. Please try again.');
    }
  };

  const renderFriendChip = (friend) => {
    let chipLabel = friend.name;
    if (friend.relationship === 'Couple' && friend.partnerName) {
      chipLabel += ` & ${friend.partnerName}`;
    } else if (friend.relationship === 'Family' && friend.partnerName) {
      chipLabel = `${friend.name}'s Family`;
    }

    return (
      <Chip 
        label={chipLabel} 
        color={
          friend.relationship === 'Couple' ? 'primary' :
          friend.relationship === 'Family' ? 'secondary' :
          'default'
        }
        variant="outlined"
        sx={{ mr: 1, mb: 1 }}
      />
    );
  };

  const renderFriendItem = (friend) => {
    // Detailed logging for debugging
    console.log('Rendering friend:', friend);

    // Comprehensive validation
    if (!friend || typeof friend !== 'object') {
      console.error('Invalid friend object:', friend);
      return null;
    }

    // Check for required properties
    const requiredProps = ['id', 'name'];
    const missingProps = requiredProps.filter(prop => !friend[prop]);
    
    if (missingProps.length > 0) {
      console.error('Friend object missing required properties:', {
        missingProps,
        friend
      });
      return null;
    }

    return (
      <ListItem 
        key={friend.id || 'unknown'}
        secondaryAction={
          <>
            <Tooltip title={friend.isSelf ? "You" : "Mark as You"}>
              <IconButton 
                edge="end" 
                color={friend.isSelf ? "primary" : "default"}
                onClick={() => handleMarkAsSelf(friend.id)}
              >
                {friend.isSelf ? <PersonIcon /> : <PersonOutlineIcon />}
              </IconButton>
            </Tooltip>
            <IconButton 
              edge="end" 
              onClick={() => onDeleteFriend(friend.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </>
        }
      >
        <ListItemAvatar>
          <Avatar 
            sx={{ 
              bgcolor: friend.isSelf ? 'primary.main' : 'grey.500',
              color: 'white'
            }}
          >
            {(friend.name || '?').charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText 
          primary={friend.name || 'Unnamed Friend'} 
          secondary={friend.isSelf ? "You" : null}
        />
      </ListItem>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trip Members
      </Typography>

      {safeFriends.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No trip members added yet
        </Typography>
      ) : (
        <List>
          {safeFriends.map((friend, index) => {
            console.log(`Mapping friend ${index}:`, friend);
            return renderFriendItem(friend);
          })}
        </List>
      )}

      <Button 
        startIcon={<AddIcon />} 
        variant="contained" 
        color="primary" 
        onClick={() => setOpenDialog(true)}
        fullWidth
        sx={{ mt: 2 }}
      >
        Add Trip Member
      </Button>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Trip Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newFriend.name}
            onChange={(e) => setNewFriend({
              ...newFriend, 
              name: e.target.value
            })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Relationship Type</InputLabel>
            <Select
              value={newFriend.relationship}
              label="Relationship Type"
              onChange={(e) => setNewFriend({
                ...newFriend, 
                relationship: e.target.value,
                partnerName: e.target.value === 'Single' ? '' : newFriend.partnerName
              })}
            >
              {RELATIONSHIP_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {newFriend.relationship !== 'Single' && (
            <TextField
              margin="dense"
              label={
                newFriend.relationship === 'Couple' 
                  ? 'Partner Name' 
                  : 'Family Representative Name'
              }
              fullWidth
              value={newFriend.partnerName}
              onChange={(e) => setNewFriend({
                ...newFriend, 
                partnerName: e.target.value
              })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddFriend} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

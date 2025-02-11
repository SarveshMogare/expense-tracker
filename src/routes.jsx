import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import TripDetails from './pages/TripDetails';
import AddExpense from './pages/AddExpense';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trips/:tripId" element={<TripDetails />} />
      <Route path="/trips/:tripId/add-expense" element={<AddExpense />} />
    </Routes>
  );
}

export default AppRoutes;

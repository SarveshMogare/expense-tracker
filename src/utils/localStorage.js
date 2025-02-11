export const STORAGE_KEYS = {
  TRIPS: 'trips',
  EXPENSES: 'expenses',
  FRIENDS: 'friends'
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    // Optionally, implement fallback or error handling
  }
};

export const getFromLocalStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    
    // Extensive logging for debugging
    console.group(`LocalStorage - Get ${key}`);
    console.log('Raw Item:', item);
    
    if (!item) {
      console.warn(`No item found for key: ${key}. Returning default value.`);
      console.groupEnd();
      return defaultValue;
    }

    try {
      const parsedItem = JSON.parse(item);
      
      // Validate parsed item
      if (parsedItem === null || parsedItem === undefined) {
        console.warn(`Parsed item is null or undefined for key: ${key}`);
        console.groupEnd();
        return defaultValue;
      }

      // Additional type checking
      if (!Array.isArray(parsedItem) && defaultValue instanceof Array) {
        console.warn(`Parsed item is not an array for key: ${key}. Type: ${typeof parsedItem}`);
        console.groupEnd();
        return defaultValue;
      }

      console.log('Parsed Item:', parsedItem);
      console.groupEnd();
      return parsedItem;
    } catch (parseError) {
      console.error(`Error parsing localStorage item for key ${key}:`, parseError);
      console.log('Problematic JSON string:', item);
      console.groupEnd();
      return defaultValue;
    }
  } catch (error) {
    console.error('Unexpected error in getFromLocalStorage:', error);
    return defaultValue;
  }
};

export const updateLocalStorageItem = (key, id, updatedItem) => {
  try {
    const items = getFromLocalStorage(key, []);
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
      saveToLocalStorage(key, items);
      return items[index];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating localStorage item:', error);
    return null;
  }
};

export const removeLocalStorageItem = (key, id) => {
  try {
    const items = getFromLocalStorage(key, []);
    const filteredItems = items.filter(item => item.id !== id);
    
    saveToLocalStorage(key, filteredItems);
    return filteredItems;
  } catch (error) {
    console.error('Error removing localStorage item:', error);
    return [];
  }
};

export const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

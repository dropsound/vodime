import { useState } from 'react';

// DODAJ "export" ispred "const"
export const useLocation = () => { 
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const askLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolokacija nije podržana.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        setError("Pristup lokaciji odbijen.");
      }
    );
  };

  return { location, error, askLocation };
};
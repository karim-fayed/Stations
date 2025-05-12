import React, { useEffect, useState, createContext, useContext, ReactNode } from "react";

type Location = { latitude: number; longitude: number } | null;

const UserLocationContext = createContext<Location>(null);

export const UserLocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
  }, []);

  return (
    <UserLocationContext.Provider value={location}>
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = () => useContext(UserLocationContext); 
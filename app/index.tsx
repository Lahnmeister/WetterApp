import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

type weatherData = {
  temperature: number;
}

type permissionStatus = {
  status: 'undetermined' | 'granted' | 'denied';
}

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState<weatherData | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<permissionStatus | null>(null);

  const storage = createAsyncStorage("appDB");

  async function getLocation() {
    if (permissionStatus?.status == 'granted') {
      const jsonValue = await storage.getItem("location");
      if (jsonValue != null) {
        const storedLocation: Location.LocationObject = JSON.parse(jsonValue);
        setLocation(storedLocation);
        //console.log('Location retrieved from AsyncStorage: ' + jsonValue);
        return;
      }
      else { }
    }
    else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus({ status: 'denied' });

        let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
        setPermissionStatus({ status: 'granted' });
        const storeData = async () => {
          try {
            const jsonValue = JSON.stringify(location);
            await storage.setItem("location", jsonValue);
          }
          catch (e) {
            console.log('Error saving location to AsyncStorage: ' + e);
          }
        }
        storeData();
        setLocation(location);
        //console.log(location);
      }
    }
  }

  const getTemperatur = async () => {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + location?.coords.latitude + '&longitude=' + location?.coords.longitude + '&current=temperature_2m')
    const data = await response.json();
    setWeather({ temperature: data.current.temperature_2m });
  }

  useEffect(() => {
    if (location == null) {
      getLocation();
    }
    else {
      getTemperatur();
    }
  }, [weather?.temperature]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <Text>{location ? `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}` : "Standort nicht abgerufen"}</Text> */}
      <Text>{weather ? `Temperatur: ${weather.temperature}°C` : "Keine Wetterdaten verfügbar"}</Text>
    </View>
  );
}
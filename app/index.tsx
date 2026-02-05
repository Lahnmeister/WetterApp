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
    console.log(storage);
    const jsonValue = await storage.getItem("location");
    if (jsonValue !== null) {
      const parsedLocation = JSON.parse(jsonValue);
      setLocation(parsedLocation);
    }
    else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus({ status: 'denied' });
      }
      else {
        let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
        setPermissionStatus({ status: 'granted' });
        const jsonValue = JSON.stringify(location);
        await storage.setItem("location", jsonValue);
        setLocation(location);
        console.log(location);
      }
    }
  }

  const getTemperatur = async () => {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + location?.coords.latitude + '&longitude=' + location?.coords.longitude + '&current=temperature_2m')
    const data = await response.json();
    console.log(data);
    setWeather({ temperature: data.current.temperature_2m });
  }

  useEffect(() => {
    console.log(storage);
    if (storage === null) {
      getLocation();
    }
    else {

    }
    getTemperatur();
    //console.log('Temperatur abgefragt');
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
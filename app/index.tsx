import * as Location from 'expo-location';
import { useState } from "react";
import { Button, Text, View } from "react-native";

type weatherData = {
  temperature: number;
}

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState<weatherData | null>(null);

  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    else {
      let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
      setLocation(location);
      console.log(location);
    }
  }

  const getTemperatur = async () => {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + location?.coords.latitude + '&longitude=' + location?.coords.longitude + '&current=temperature_2m')
    const data = await response.json();
    setWeather({ temperature: data.current.temperature_2m });
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    > <Button title="Standort abrufen" onPress={() => { getLocation(); getTemperatur(); }} />
      {/* <Text>{location ? `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}` : "Standort nicht abgerufen"}</Text> */}
      <Text>{weather ? `Temperatur: ${weather.temperature}°C` : "Keine Wetterdaten verfügbar"}</Text>
    </View>
  );
}
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Button, Fragment } from "react-native";
import io from "socket.io-client";
import uuid from "react-native-uuid";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import Directions from "./Directions";
import { getPixelSize } from "./utils";
import imageMarker from "./assets/uberx.png";

const socketEndpoint = "http://192.168.0.168:3000";

export default function App() {
  const [hasConnection, setConnection] = useState(false);
  const [loop, setLoop] = useState(false);
  const [region, setRegion] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [lastDestination, setLastDetination] = useState({
    latitude: -21.1482538,
    longitude: -48.9738419,
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null);

  const socket = io(socketEndpoint, {
    transports: ["websocket"],
    reconnectionAttempts: 15,
  });

  socket.on("connect", () => {
    setConnection(true);
  });

  socket.on("events", (data) => {
    const dest = JSON.parse(data);
    setDestinations(dest);
    //setLastDetination(Array.from(dest)[0]);
  });

  useEffect(() => {
    if (hasConnection && !loop && region) {
      setLoop(true);
      setInterval(() => {
        socket.emit("events", {
          id: uuid.v4(),
          region,
          register: new Date().toISOString(),
        });
      }, 3000);
    }
  }, [hasConnection, loop, region]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0143,
        longitudeDelta: 0.0134,
      });
    })();
  }, []);

  useEffect(() => {
    console.log(destinations.length);
    if (destinations.length) {
      setLastDetination(destinations[destinations.length - 1]);
      console.log(destinations[0].latitude, destinations[0].longitude);
    }
  }, [destinations]);

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={{ flex: 1 }}
          region={region}
          showsUserLocation
          loadingEnabled
          ref={mapRef}
        >
          {destinations.map((dest, key) => (
            <>
              <Marker
                coordinate={dest}
                anchor={{ x: 0.5, y: 1 }}
                image={null}
              />
              <Directions
                origin={region}
                destination={dest}
                onReady={(result) => {
                  mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: getPixelSize(30),
                      left: getPixelSize(30),
                      top: getPixelSize(30),
                      bottom: getPixelSize(30),
                    },
                  });
                }}
              />
            </>
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

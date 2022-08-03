import MapViewDirections from "react-native-maps-directions";

const Directions = ({ destination, origin, onReady }) => {
  return (
    <MapViewDirections
      destination={destination}
      origin={origin}
      onReady={onReady}
      apikey="[INSERT_YOUR_API_KEY]"
      strokeWidth={3}
      strokeColor="#222"
    />
  );
};

export default Directions;

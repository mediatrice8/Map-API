import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nextStopIndex, setNextStopIndex] = useState(0);
  const [eta, setETA] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      initMap();
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: -1.939826787816454, lng: 30.0445426438232 }, // Initial map center (Nyabugogo)
      zoom: 13,
    });

    if (mapInstance) {
      setMap(mapInstance);
      setDirectionsService(new window.google.maps.DirectionsService());
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer());
      calculateRoute();
    } else {
      console.error('Failed to initialize map');
    }
  };

  const calculateRoute = () => {
    const waypoints = [
      { location: { lat: -1.9355377074007851, lng: 30.060163829002217 }, stopover: true }, // Stop A
      { location: { lat: -1.9358808342336546, lng: 30.08024820994666 }, stopover: true }, // Stop B
      { location: { lat: -1.9489196023037583, lng: 30.092607828989397 }, stopover: true }, // Stop C
      { location: { lat: -1.9592132952818164, lng: 30.106684061788073 }, stopover: true }, // Stop D
      { location: { lat: -1.9487480402200394, lng: 30.126596781356923 }, stopover: true }, // Stop E
      { location: { lat: -1.9365670876910166, lng: 30.13020167024439 }, stopover: true }, // Kimironko
    ];

    const request = {
      origin: { lat: -1.939826787816454, lng: 30.0445426438232 }, // Nyabugogo
      destination: { lat: -1.9365670876910166, lng: 30.13020167024439 }, // Kimironko
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsRenderer.setMap(map);

    directionsService.route(request, (response, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setRoute(response.routes[0]);
        directionsRenderer.setDirections(response);
        startTracking();
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  };

  const startTracking = () => {
    const routeLegs = route.legs;
    let totalDistance = 0;
    for (let i = 0; i < routeLegs.length; i++) {
      totalDistance += routeLegs[i].distance.value;
    }

    let currentDistance = 0;
    let nextStop = routeLegs[nextStopIndex].end_location;
    let nextStopDistance = routeLegs[nextStopIndex].distance.value;

    const timer = setInterval(() => {
      if (currentDistance >= totalDistance) {
        clearInterval(timer);
        setETA(null);
        return;
      }

      const currentSpeed = 30; // Assume constant average speed of 30 km/h
      const timeToNextStop = (nextStopDistance - currentDistance) / currentSpeed;
      setETA(timeToNextStop);

      currentDistance += currentSpeed * 1000 / 3600; // Convert speed to meters per second
      if (currentDistance >= nextStopDistance) {
        nextStopIndex++;
        if (nextStopIndex < routeLegs.length) {
          nextStop = routeLegs[nextStopIndex].end_location;
          nextStopDistance = routeLegs[nextStopIndex].distance.value;
        } else {
          clearInterval(timer);
          setETA(null);
          return;
        }
      }

      setCurrentLocation({ lat: nextStop.lat(), lng: nextStop.lng() });
    }, 1000);
  };

return (
  <div className="App">
    <header className="header">
      <h1>Route Tracker</h1>
    </header>
    <div id="map" style={{ height: '400px', width: '100%' }}></div>
    <div>

      <h2>Starting Point: {route ? route.legs[0].start_address : 'Loading...'}</h2>
        <h2>Next Stop ETA: {route ? route.legs[nextStopIndex].end_address : 'Loading...'}</h2>
        <h2>Distance to Next Stop: {route ? route.legs[nextStopIndex].distance.text : 'Loading...'}</h2>
        <h2>Estimated Time to Next Stop: {eta !== null ? Math.round(eta) + ' seconds' : 'N/A'}</h2>
        <h2>Ending Point: {route ? route.legs[route.legs.length - 1].end_address : 'Loading...'}</h2>
    </div>
    <footer className="footer">
      <p>© 2024 Route Tracker App</p>
    </footer>
  </div>
);
}

export default App;

import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [location, setLocation] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const baseUrl = "http://localhost:8080/api/weather";

  const fetchWeather = async () => {
    try {
      setError("");
      const response = await axios.get(
        `${baseUrl}/current?location=${location}`
      );
      setCurrentWeather(response.data);
      const forecastResponse = await axios.get(
        `${baseUrl}/forecast?location=${location}`
      );
      setForecast(forecastResponse.data);
    } catch (err) {
      setError(err.response?.data || "Failed to fetch weather");
    }
  };

  const fetchCurrentLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = `${position.coords.latitude},${position.coords.longitude}`;
        setLocation(loc);
        try {
          setError("");
          const response = await axios.get(
            `${baseUrl}/current?location=${loc}`
          );
          setCurrentWeather(response.data);
          const forecastResponse = await axios.get(
            `${baseUrl}/forecast?location=${loc}`
          );
          setForecast(forecastResponse.data);
        } catch (err) {
          setError(err.response?.data || "Failed to fetch weather");
        }
      },
      () => setError("Failed to get current location")
    );
  };

  const saveWeather = async () => {
    try {
      setError("");
      const dto = { location, startDate, endDate };
      await axios.post(baseUrl, dto);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data || "Failed to save weather");
    }
  };

  const fetchHistory = async () => {
    try {
      setError("");
      const response = await axios.get(baseUrl);
      setHistory(response.data);
    } catch (err) {
      setError(err.response?.data || "Failed to fetch history");
    }
  };

  const updateWeather = async (id) => {
    try {
      setError("");
      const dto = { location, startDate, endDate };
      await axios.put(`${baseUrl}/${id}`, dto);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data || "Failed to update weather");
    }
  };

  const deleteWeather = async (id) => {
    try {
      setError("");
      await axios.delete(`${baseUrl}/${id}`);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data || "Failed to delete weather");
    }
  };

  const exportCSV = async () => {
    try {
      setError("");
      const response = await axios.get(`${baseUrl}/export`);
      alert(response.data);
    } catch (err) {
      setError(err.response?.data || "Failed to export");
    }
  };
  const fetchYoutubeVideo = async () => {
    try {
      setError("");
      const response = await axios.get(`${baseUrl}/video?location=${location}`);
      setVideoUrl(response.data);
    } catch (err) {
      setError(err.response?.data || "Failed to fetch YouTube video");
    }
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location (city, zip, coords)"
      />
      <button onClick={fetchWeather}>Get Weather</button>
      <button onClick={fetchCurrentLocationWeather}>
        Use Current Location
      </button>
      <button onClick={fetchYoutubeVideo}>Get YouTube Video</button>
      {error && <p className="error">{error}</p>}

      {currentWeather && (
        <div className="weather">
          <h2>{currentWeather.location}</h2>
          <img
            src={`http://openweathermap.org/img/wn/${currentWeather.weatherIcon}@2x.png`}
            alt="weather icon"
          />
          <p>Temperature: {currentWeather.temperature}°C</p>
          <p>Humidity: {currentWeather.humidity}%</p>
          <p>Wind Speed: {currentWeather.windSpeed} m/s</p>
          <p>{currentWeather.weatherDescription}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-list">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <p>{day.requestDate.split("T")[0]}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${day.weatherIcon}@2x.png`}
                  alt="weather icon"
                />
                <p>{day.temperature}°C</p>
                <p>{day.weatherDescription}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {videoUrl && (
        <div className="youtube-video">
          <h2>Weather-related YouTube Video</h2>
          <iframe
            width="560"
            height="315"
            src={videoUrl.replace("watch?v=", "embed/")}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <h2>Save Weather Data</h2>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button onClick={saveWeather}>Save</button>
      <button onClick={fetchHistory}>View History</button>
      <button onClick={exportCSV}>Export to CSV</button>

      {history.length > 0 && (
        <div className="history">
          <h2>Weather History</h2>
          {history.map((item) => (
            <div key={item.id}>
              <p>
                {item.location} - {item.temperature}°C ({item.startDate} to{" "}
                {item.endDate})
              </p>
              <button onClick={() => updateWeather(item.id)}>Update</button>
              <button onClick={() => deleteWeather(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

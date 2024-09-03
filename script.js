// DOM
const searchInput = document.querySelector(".search-input");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector(
  ".hourly-weather .weather-list"
);
const locationButton = document.querySelector(".location-button");

// API KEY
const API_KEY = "89d61dacab224ce9b9e111712243008";

// Weather codes for mapping to our icons
const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1009],
  mist: [1030, 1135, 1147],
  rain: [
    1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246,
    1273, 1276,
  ],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [
    1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222,
    1225, 1237, 1294, 1252, 1255, 1258, 1261, 1279, 1282,
  ],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

// Function to get hourly forecast
const displayHourlyForecast = (hourlyData) => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentHour + 24 * 60 * 60 * 1000;

  //   Filter hourly data to only include next 24 hours
  const next24HrsData = hourlyData.filter(({ time }) => {
    const foreCastTime = new Date(time).getTime();
    return foreCastTime >= currentHour && foreCastTime <= next24Hours;
  });

  //   Generates HTML for each hourly forecast and displays it.
  hourlyWeatherDiv.innerHTML = next24HrsData
    .map((item) => {
      const temperature = Math.floor(item.temp_c);
      const time = item.time.split(" ")[1].substring(0, 5);
      const weathericons = Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(item.condition.code)
      );

      return `<li class="weather-item">
              <p class="time">${time}</p>
              <img src="Images/${weathericons}.svg" alt="" class="weather-icon" />
              <p class="temperature">${temperature}°</p>
            </li>`;
    })
    .join("");
};

// Function to get Weather Details
const getWeatherDetails = async (API_URL) => {
  document.body.classList.remove("show-no-result");
  try {
    // Featch Response
    const response = await fetch(API_URL);
    const data = await response.json();

    // Extract details
    const temperature = Math.floor(data.current.temp_c);
    const description = data.current.condition.text;
    // const icons = data.current.condition.icon; //Image quality bad
    const weathericons = Object.keys(weatherCodes).find((icon) =>
      weatherCodes[icon].includes(data.current.condition.code)
    );

    // Update detials
    currentWeatherDiv.querySelector(
      ".temperature"
    ).innerHTML = `${temperature}<span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = description;
    // currentWeatherDiv.querySelector("img").src = icons; //Image quality bas
    currentWeatherDiv.querySelector(
      ".weather-icon"
    ).src = `Images/${weathericons}.svg`;

    // Combined Hourly data from today and tomorrow
    const combinedHourlyData = [
      ...data.forecast.forecastday[0].hour,
      ...data.forecast.forecastday[1].hour,
    ];

    // Function called
    displayHourlyForecast(combinedHourlyData);

    searchInput.value = data.location.name;
  } catch (error) {
    document.body.classList.add("show-no-result");
  }
};

// Weather Request for specific City
const setUpWeatherRequest = (cityName) => {
  const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
  getWeatherDetails(API_URL);
};

// Search Bar Script
searchInput.addEventListener("keyup", (e) => {
  const cityName = searchInput.value.trim();

  if (e.key == "Enter" && cityName) {
    setUpWeatherRequest(cityName);
  }
});

// Location Button
locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
      getWeatherDetails(API_URL);
    },
    (error) => {
      alert("Location access denied. Please Enable your location in settings.");
    }
  );
});

// Default Search
setUpWeatherRequest("Roorkee");

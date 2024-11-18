import "./styles.css";

const submitButton = document.querySelector('button');
const errorDiv = document.querySelector('#errorMessage');


function createURL(city){
    const startUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
    const endURL = "?key=NZDRZTWW5P8RT2J6TLLWDJ56A";
    return startUrl + city.toLowerCase() + endURL;
}

function processWeatherData(weatherData){
    if (!weatherData) return null;

    const current = weatherData.currentConditions;
    return {
        location: {
            city: weatherData.address,
            timezone: weatherData.timezone,
        },
        current: {
            temp: current.temp,
            conditions: current.conditions,
            icon: current.icon,
            precipprob: current.precipprob,
            windSpeed: current.windspeed,
        },
        //next 5 days forecast
        forecast: weatherData.days.slice(0, 5).map(day => ({
            datetime: day.datetime,
            tempmax: day.tempmax,
            tempmin: day.tempmin,
            conditions: day.conditions,
            icon: day.icon,
        })),

        lastUpdated: current.datetime,
    };
}


async function getData(city){
    try {
        if (!city) {
            throw new Error("City parameter is required");
        }
        const response = await fetch(createURL(city), {mode: "cors"});
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const weather = await response.json();
        const processedData = processWeatherData(weather);
        console.log('Processed weather data:', processedData);
        //display data on the page
        if (processedData) {
            displayWeatherData(processedData);
        }
        return processedData;
    } catch (error) {
        showError(error.message);
        return null;
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearError(){
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

function displayWeatherData(data) {
    const cityNameDiv = document.querySelector('#cityName');
    const tempDiv = document.querySelector('#temperature');
    const conditionsDiv = document.querySelector('#conditions');
    const windSpeedDiv = document.querySelector('#windSpeed');
    const precipDiv = document.querySelector('#precipitation');
    const forecastContainer = document.querySelector('#forecastItems');
    const forecastTemplate = document.querySelector('.forecast-item.template');
  
    // Update current weather
    cityNameDiv.textContent = `Weather in ${data.location.city}`;
    tempDiv.textContent = `Temperature: ${data.current.temp}°C`;
    conditionsDiv.textContent = `Conditions: ${data.current.conditions}`;
    windSpeedDiv.textContent = `Wind Speed: ${data.current.windSpeed} km/h`;
    precipDiv.textContent = `Precipitation: ${data.current.precipprob}%`;
  
    // Clear previous forecast items
    forecastContainer.innerHTML = '';
  
    // Populate 5-day forecast
    data.forecast.forEach(day => {
      const forecastItem = forecastTemplate.cloneNode(true);
      forecastItem.classList.remove('template');
      forecastItem.style.display = ''; // Make it visible
  
      forecastItem.querySelector('.forecast-date').textContent = day.datetime;
      forecastItem.querySelector('.forecast-max-temp').textContent = `Max Temp: ${day.tempmax}°C`;
      forecastItem.querySelector('.forecast-min-temp').textContent = `Min Temp: ${day.tempmin}°C`;
      forecastItem.querySelector('.forecast-conditions').textContent = `Conditions: ${day.conditions}`;
  
      forecastContainer.appendChild(forecastItem);
    });
  
    // Show the weather container (if hidden initially)
    document.getElementById('weatherContainer').style.display = 'block';
  }

submitButton.addEventListener('click', async (e) => {
    e.preventDefault();
    clearError();
    const cityInput = document.querySelector('input[name="city"]');
    const city = cityInput.value.trim();
    
    if (city) {
        await getData(city);
    } else {
        showError('Please enter a city name');
    }
});


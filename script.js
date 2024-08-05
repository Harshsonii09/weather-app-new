
const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezoneEl = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');


const API_KEY = '49cc8c821cd2aff9af04c9f98c36eb74'; 
const DEFAULT_LOCATION = { lat: 22.5726, lon: 88.3639 }; 


setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`;
    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);


function getWeatherData(latitude, longitude) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => showWeatherData(data))
        .catch(error => {
            console.error('Error fetching weather data:', error);
            currentWeatherItemsEl.innerHTML = '<p>Error fetching weather data. Please try again later.</p>';
        });
}


function showWeatherData(data) {
    console.log('Weather Data:', data); 

    const { timezone, lat, lon, current, daily } = data;
    const { humidity, pressure, sunrise, sunset, wind_speed } = current;

    timezoneEl.textContent = timezone;
    countryEl.textContent = `${lat.toFixed(2)}°N ${lon.toFixed(2)}°E`;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${wind_speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${moment(sunrise * 1000).format('HH:mm a')}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${moment(sunset * 1000).format('HH:mm a')}</div>
        </div>
    `;

    const forecastItems = daily.map((day, idx) => {
        if (idx === 0) {
            currentTempEl.innerHTML = `
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
                <div class="other">
                    <div class="day">${moment(day.dt * 1000).format('dddd')}</div>
                    <div class="temp">Night - ${day.temp.night.toFixed(1)}&#176;C</div>
                    <div class="temp">Day - ${day.temp.day.toFixed(1)}&#176;C</div>
                </div>
            `;
        } else {
            return `
                <div class="weather-forecast-item">
                    <div class="day">${moment(day.dt * 1000).format('ddd')}</div>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                    <div class="temp">Night - ${day.temp.night.toFixed(1)}&#176;C</div>
                    <div class="temp">Day - ${day.temp.day.toFixed(1)}&#176;C</div>
                </div>
            `;
        }
    }).join('');

    weatherForecastEl.innerHTML = forecastItems;
}


navigator.geolocation.getCurrentPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherData(latitude, longitude);
    },
    (error) => {
        console.error('Error accessing geolocation:', error);
        getWeatherData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
        currentWeatherItemsEl.innerHTML = '<p>Using default location. Enable location services for local weather data.</p>';
    }
);

// Get the input data
const inputData = $input.all()[0].json;
const xmlString = inputData.data;

// Helper function to extract XML values using regex
function extractValue(xml, tagName) {
    const regex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : 'N/A';
}

// Helper to safely round numeric strings with default decimals
function toRoundedNumber(value, decimals = 1) {
    const num = parseFloat(value);
    return isNaN(num) ? 'N/A' : Number(num.toFixed(decimals));
}

// Extract nested values (e.g., condition/text inside current)
function extractNestedValue(xml, parentTag, childTag) {
    const parentRegex = new RegExp(`<${parentTag}>(.*?)<\/${parentTag}>`, 'is');
    const parentMatch = xml.match(parentRegex);
    if (!parentMatch) return 'N/A';

    const parentContent = parentMatch[1];
    return extractValue(parentContent, childTag);
}

// Extract location data
const locationRegex = /<location>(.*?)<\/location>/is;
const locationMatch = xmlString.match(locationRegex);
const locationXml = locationMatch ? locationMatch[1] : '';

const locationName = extractValue(locationXml, 'name');
const region = extractValue(locationXml, 'region');
const country = extractValue(locationXml, 'country');
const lat = extractValue(locationXml, 'lat');
const lon = extractValue(locationXml, 'lon');
const tz_id = extractValue(locationXml, 'tz_id');
const localtime_epoch = extractValue(locationXml, 'localtime_epoch');
const localtime = extractValue(locationXml, 'localtime');

// Extract current weather data with metric units
const currentRegex = /<current>(.*?)<\/current>/is;
const currentMatch = xmlString.match(currentRegex);
const currentXml = currentMatch ? currentMatch[1] : '';

const last_updated = extractValue(currentXml, 'last_updated');
const temp_c = extractValue(currentXml, 'temp_c');
const is_day = extractValue(currentXml, 'is_day');
const currentCondition = extractNestedValue(currentXml, 'condition', 'text');
const currentConditionIcon = extractNestedValue(currentXml, 'condition', 'icon');
const currentConditionCode = extractNestedValue(currentXml, 'condition', 'code');
const wind_kph = extractValue(currentXml, 'wind_kph');
const wind_dir = extractValue(currentXml, 'wind_dir');
const pressure_mb = extractValue(currentXml, 'pressure_mb');
const precip_mm = extractValue(currentXml, 'precip_mm');
const humidity = extractValue(currentXml, 'humidity');
const cloud = extractValue(currentXml, 'cloud');
const feelslike_c = extractValue(currentXml, 'feelslike_c');
const heatindex_c = extractValue(currentXml, 'heatindex_c');
const vis_km = extractValue(currentXml, 'vis_km');
const uv = extractValue(currentXml, 'uv');

// Extract current air quality
const currentAqRegex = /<air_quality>(.*?)<\/air_quality>/is;
const currentAqMatch = currentXml.match(currentAqRegex);
const currentAqXml = currentAqMatch ? currentAqMatch[1] : '';

const current_co = toRoundedNumber(extractValue(currentAqXml, 'co'));
const current_no2 = toRoundedNumber(extractValue(currentAqXml, 'no2'));
const current_o3 = toRoundedNumber(extractValue(currentAqXml, 'o3'));
const current_so2 = toRoundedNumber(extractValue(currentAqXml, 'so2'));
const current_pm2_5 = toRoundedNumber(extractValue(currentAqXml, 'pm2_5'));
const current_pm10 = toRoundedNumber(extractValue(currentAqXml, 'pm10'));
const current_us_epa_index = extractValue(currentAqXml, 'us-epa-index');
const current_gb_defra_index = extractValue(currentAqXml, 'gb-defra-index');

// Extract all forecast days
const forecastdayRegex = /<forecastday>(.*?)<\/forecastday>/gis;
const forecastdayMatches = [...xmlString.matchAll(forecastdayRegex)];

// Build comprehensive forecast data array
const forecastDays = forecastdayMatches.map(match => {
    const forecastdayXml = match[1];
    const date = extractValue(forecastdayXml, 'date');

    // Extract day forecast
    const dayRegex = /<day>(.*?)<\/day>/is;
    const dayMatch = forecastdayXml.match(dayRegex);
    const dayXml = dayMatch ? dayMatch[1] : '';

    // Extract day air quality
    const dayAqRegex = /<air_quality>(.*?)<\/air_quality>/is;
    const dayAqMatch = dayXml.match(dayAqRegex);
    const dayAqXml = dayAqMatch ? dayAqMatch[1] : '';

    // Extract hourly forecast
    const hourRegex = /<hour>(.*?)<\/hour>/gis;
    const hourMatches = [...forecastdayXml.matchAll(hourRegex)];

    const hourlyForecast = hourMatches.map(hourMatch => {
        const hourXml = hourMatch[1];

        // Extract hour air quality
        const hourAqRegex = /<air_quality>(.*?)<\/air_quality>/is;
        const hourAqMatch = hourXml.match(hourAqRegex);
        const hourAqXml = hourAqMatch ? hourAqMatch[1] : '';

        return {
            time: extractValue(hourXml, 'time'),
            temp_c: extractValue(hourXml, 'temp_c'),
            is_day: extractValue(hourXml, 'is_day'),
            condition: extractNestedValue(hourXml, 'condition', 'text'),
            condition_icon: extractNestedValue(hourXml, 'condition', 'icon'),
            wind_kph: extractValue(hourXml, 'wind_kph'),
            pressure_mb: extractValue(hourXml, 'pressure_mb'),
            precip_mm: extractValue(hourXml, 'precip_mm'),
            snow_cm: extractValue(hourXml, 'snow_cm'),
            humidity: extractValue(hourXml, 'humidity'),
            feelslike_c: extractValue(hourXml, 'feelslike_c'),
            will_it_rain: extractValue(hourXml, 'will_it_rain'),
            chance_of_rain: extractValue(hourXml, 'chance_of_rain'),
            will_it_snow: extractValue(hourXml, 'will_it_snow'),
            chance_of_snow: extractValue(hourXml, 'chance_of_snow'),
            air_quality: {
                co: toRoundedNumber(extractValue(hourAqXml, 'co')),
                no2: toRoundedNumber(extractValue(hourAqXml, 'no2')),
                o3: toRoundedNumber(extractValue(hourAqXml, 'o3')),
                so2: toRoundedNumber(extractValue(hourAqXml, 'so2')),
                pm2_5: toRoundedNumber(extractValue(hourAqXml, 'pm2_5')),
                pm10: toRoundedNumber(extractValue(hourAqXml, 'pm10')),
                us_epa_index: extractValue(hourAqXml, 'us-epa-index'),
                gb_defra_index: extractValue(hourAqXml, 'gb-defra-index')
            }
        };
    });

    return {
        date: date,
        maxtemp_c: extractValue(dayXml, 'maxtemp_c'),
        mintemp_c: extractValue(dayXml, 'mintemp_c'),
        avgtemp_c: extractValue(dayXml, 'avgtemp_c'),
        maxwind_kph: extractValue(dayXml, 'maxwind_kph'),
        totalprecip_mm: extractValue(dayXml, 'totalprecip_mm'),
        totalsnow_cm: extractValue(dayXml, 'totalsnow_cm'),
        avgvis_km: extractValue(dayXml, 'avgvis_km'),
        daily_will_it_rain: extractValue(dayXml, 'daily_will_it_rain'),
        daily_chance_of_rain: extractValue(dayXml, 'daily_chance_of_rain'),
        daily_will_it_snow: extractValue(dayXml, 'daily_will_it_snow'),
        daily_chance_of_snow: extractValue(dayXml, 'daily_chance_of_snow'),
        condition: extractNestedValue(dayXml, 'condition', 'text'),
        condition_icon: extractNestedValue(dayXml, 'condition', 'icon'),
        condition_code: extractNestedValue(dayXml, 'condition', 'code'),
        uv: extractValue(dayXml, 'uv'),
        air_quality: {
            co: toRoundedNumber(extractValue(dayAqXml, 'co')),
            no2: toRoundedNumber(extractValue(dayAqXml, 'no2')),
            o3: toRoundedNumber(extractValue(dayAqXml, 'o3')),
            so2: toRoundedNumber(extractValue(dayAqXml, 'so2')),
            pm2_5: toRoundedNumber(extractValue(dayAqXml, 'pm2_5')),
            pm10: toRoundedNumber(extractValue(dayAqXml, 'pm10')),
            us_epa_index: extractValue(dayAqXml, 'us-epa-index'),
            gb_defra_index: extractValue(dayAqXml, 'gb-defra-index')
        },
        hourly: hourlyForecast
    };
});

// Helper function to get air quality description
function getAQIDescription(usEpaIndex) {
    const index = parseInt(usEpaIndex);
    if (index === 1) return { level: 'Good', color: '#00e400', emoji: '✅' };
    if (index === 2) return { level: 'Moderate', color: '#ffff00', emoji: '⚠️' };
    if (index === 3) return { level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', emoji: '⚠️' };
    if (index === 4) return { level: 'Unhealthy', color: '#ff0000', emoji: '❌' };
    if (index === 5) return { level: 'Very Unhealthy', color: '#8f3f97', emoji: '❌' };
    if (index === 6) return { level: 'Hazardous', color: '#7e0023', emoji: '☠️' };
    if (index === undefined) return { level: 'Unknown', color: '#999999', emoji: '❓' };
}

const currentAQI = getAQIDescription(current_us_epa_index);

// Generate forecast rows HTML with ALL data
const forecastRowsHTML = forecastDays.map((day, index) => {
    const backgrounds = ['#e8ffcc', '#d4edda', '#cfe2ff'];
    const bgColor = backgrounds[index] || '#f8f9fa';

    const dayAQI = getAQIDescription(day.air_quality.us_epa_index);

    // Generate hourly forecast summary (every 1 hours)
    const hourlyHTML = day.hourly
        .filter((hour, idx) => idx % 1 === 0) // Every 1 hour - change this value to adjust frequency
        .map(hour => {
            const hourAQI = getAQIDescription(hour.air_quality.us_epa_index);
            return `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 8px; font-size: 13px;">${hour.time.split(' ')[1]}</td>
          <td style="padding: 8px; font-size: 13px; font-weight: 600;">${hour.temp_c}°C</td>
          <td style="padding: 8px; font-size: 13px;">${hour.condition}</td>
          <td style="padding: 8px; font-size: 13px;">${hour.chance_of_rain}%</td>
          <td style="padding: 8px; font-size: 13px; background-color: ${hourAQI.color}; color: #000000;">${hourAQI.emoji} ${hourAQI.level}</td>
        </tr>
      `;
        }).join('');

    return `
    <tr>
      <td style="padding: 20px; background-color: ${bgColor}; ${index < forecastDays.length - 1 ? 'border-bottom: 2px solid #e0e0e0;' : ''}">
        <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #333333;">
          ${index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.date} // Label days for specific forecast sections
        </h3>
        
        <!-- Daily Summary -->
        <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <td style="font-weight: 600; color: #666666; width: 40%;">Condition</td>
            <td style="color: #000000;">${day.condition}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">High / Low / Avg</td>
            <td style="color: #000000; font-size: 16px;">
              <span style="color: #d32f2f; font-weight: 600;">${day.maxtemp_c}°C</span> / 
              <span style="color: #1976d2; font-weight: 600;">${day.mintemp_c}°C</span> / 
              <span style="font-weight: 600;">${day.avgtemp_c}°C</span>
            </td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">Rain Chance</td>
            <td style="color: #000000;">${day.daily_chance_of_rain}% ${day.daily_will_it_rain === '1' ? '🌧️' : ''}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">Precipitation / Snow</td>
            <td style="color: #000000;">${day.totalprecip_mm} mm / ${day.totalsnow_cm} cm</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">Max Wind</td>
            <td style="color: #000000;">${day.maxwind_kph} km/h</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">Avg Visibility</td>
            <td style="color: #000000;">${day.avgvis_km} km</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">UV Index</td>
            <td style="color: #000000;">${day.uv}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">Air Quality</td>
            <td style="color: #000000; background-color: ${dayAQI.color}; padding: 4px 8px; border-radius: 4px;">
              ${dayAQI.emoji} ${dayAQI.level} (EPA: ${day.air_quality.us_epa_index})
            </td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #666666;">PM2.5 / PM10</td>
            <td style="color: #000000;">${day.air_quality.pm2_5} / ${day.air_quality.pm10} µg/m³</td>
          </tr>
        </table>
        
        <!-- Hourly Forecast -->
        <details style="margin-top: 15px;">
          <summary style="cursor: pointer; font-weight: 600; color: #1976d2; font-size: 16px; margin-bottom: 10px;">
            📊 Hourly Forecast (Every 1 Hour)
          </summary>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px; font-size: 13px; border: 1px solid #e0e0e0;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="padding: 8px; text-align: left;">Time</th>
                <th style="padding: 8px; text-align: left;">Temp</th>
                <th style="padding: 8px; text-align: left;">Condition</th>
                <th style="padding: 8px; text-align: left;">Rain</th>
                <th style="padding: 8px; text-align: left;">AQI</th>
              </tr>
            </thead>
            <tbody>
              ${hourlyHTML}
            </tbody>
          </table>
        </details>
      </td>
    </tr>
  `;
}).join('');

// Build HTML email content
const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">☁️ ${locationName}${region !== 'N/A' && region ? ', ' + region : ''}</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.95;">${country}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.85;">📍 ${lat}°, ${lon}° | ⏰ ${localtime} (${tz_id})</p>
            </td>
          </tr>
          
          <!-- Current Weather -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-left: 5px solid #667eea;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #333333;">🌡️ Current Weather</h2>
              <p style="margin: 0 0 15px 0; color: #666; font-size: 13px;">Last Updated: ${last_updated}</p>
              
              <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="font-weight: 600; color: #666666; width: 40%;">Condition</td>
                  <td style="color: #000000; font-size: 18px; font-weight: 600;">${currentCondition} ${is_day === '1' ? '☀️' : '🌙'}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #666666;">Temperature</td>
                  <td style="color: #000000; font-size: 28px; font-weight: 700;">${temp_c}°C</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #666666;">Feels Like / Heat Index</td>
                  <td style="color: #000000; font-size: 16px;">${feelslike_c}°C / ${heatindex_c}°C</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #666666;">Humidity / Cloud</td>
                  <td style="color: #000000;">${humidity}% / ${cloud}%</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #666666;">Wind</td>
                  <td style="color: #000000;">💨 ${wind_kph} km/h ${wind_dir}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #666666;">Pressure</td>
                  <td style="color: #000000;">${pressure_mb} mb</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #666666;">Visibility / UV</td>
                  <td style="color: #000000;">${vis_km} km / UV ${uv}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #666666;">Precipitation</td>
                  <td style="color: #000000;">${precip_mm} mm</td>
                </tr>
              </table>
              
              <!-- Current Air Quality -->
              <h3 style="margin: 25px 0 15px 0; font-size: 18px; color: #333333;">🌫️ Current Air Quality</h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="background-color: ${currentAQI.color}; border-radius: 6px;">
                <tr>
                  <td style="font-weight: 600; color: #000000; width: 40%;">Overall Status</td>
                  <td style="color: #000000; font-size: 18px; font-weight: 700;">${currentAQI.emoji} ${currentAQI.level}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #000000;">EPA Index / DEFRA Index</td>
                  <td style="color: #000000;">${current_us_epa_index} / ${current_gb_defra_index}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #000000;">PM2.5 / PM10</td>
                  <td style="color: #000000;">${current_pm2_5} / ${current_pm10} µg/m³</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #000000;">CO / NO₂</td>
                  <td style="color: #000000;">${current_co} / ${current_no2} µg/m³</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #000000;">O₃ / SO₂</td>
                  <td style="color: #000000;">${current_o3} / ${current_so2} µg/m³</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Forecast Section Header -->
          <tr>
            <td style="padding: 25px 30px 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h2 style="margin: 0; font-size: 26px; color: #ffffff; text-align: center;">📅 3-Day Detailed Forecast</h2>
            </td>
          </tr>
          
          <!-- Forecast Days -->
          ${forecastRowsHTML}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #2c3e50; text-align: center; color: #ecf0f1; font-size: 12px;">
              <p style="margin: 0;">Weather data provided by <strong>WeatherAPI.com</strong></p>
              <p style="margin: 8px 0 0 0; opacity: 0.8;">Report generated at ${new Date(localtime).toISOString()}</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Return data for Gmail node
return [{
    json: {
        subject: `🌤️ ${locationName} Weather: ${temp_c}°C ${currentCondition} | AQI: ${currentAQI.level} | 3-Day Forecast`, //Adjust this section if need different email subjevt
        htmlBody: htmlContent,
        recipient: 'john@doe.com, john2@doe.com' // Adjust recipient email addresses
    }
}];
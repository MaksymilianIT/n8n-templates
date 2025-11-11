# n8n Weather Forecast Email Workflow - Setup Guide

## Overview
Automated workflow that fetches weather data from WeatherAPI.com and sends a comprehensive daily email at 07:00 AM with current conditions, air quality, and 3-day forecast with hourly breakdowns.

## Prerequisites
- n8n instance (self-hosted or cloud)
- WeatherAPI.com account (free tier sufficient)
- Google Cloud Console project with Gmail API enabled
- Gmail account for sending emails

## Setup Steps

### 1. WeatherAPI Configuration
1. Register at [WeatherAPI.com](https://www.weatherapi.com)
2. Copy your API key from the dashboard
3. In the **HTTP Request** node, replace:
   - `[YourWeatherAPIkeyHere]` with your actual API key
   - `[YourCityLocationHere]` with your target location (e.g., `London`, `New York`, `51.5074,-0.1278`)

### 2. Gmail API Setup (Critical)
**For self-hosted instances:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis)
2. Create a new project or select existing
3. Enable **Gmail API only** (minimal permissions = no Google verification needed)
4. Configure OAuth consent screen:
   - User Type: External (if not Google Workspace)
   - Add test users (your email addresses)
   - Scopes: `https://www.googleapis.com/auth/gmail.send`
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URIs: `https://your-n8n-instance/rest/oauth2-credential/callback`
7. Copy Client ID and Client Secret

**In n8n:**
1. Create new Gmail OAuth2 credential
2. Paste Client ID and Client Secret
3. Complete OAuth flow
4. Replace credential ID in **Send a message with forecast** node

**Reference:** [Nate Herk's Gmail API Tutorial](https://youtu.be/3Ai1EPznlAc?si=ri-HFHRPym07oZZX)

### 3. Email Recipients
In **Parse XML from JSON** node, scroll to bottom of JavaScript code and modify:
```javascript
recipient: 'john@doe.com, john2@doe.com'
```
Replace with your actual recipient email address(es), comma-separated.

### 4. Schedule Configuration
The **Schedule Trigger** is set to `00 07 * * *` (07:00 AM daily).

To modify:
- Use [Crontab Guru](https://crontab.guru/) for custom schedules
- Or switch to different trigger type (Interval, Webhook, etc.)

### 5. Error Handling (Optional but Recommended)
The workflow references error workflow ID `MyTRLONCCgCr7pRm`. Either:
- Create a separate error handling workflow and update the ID
- Remove the `errorWorkflow` setting if not needed

## Post-Setup

1. **Test manually** before activating:
   - Click "Execute Workflow" button
   - Verify email arrives with correct data
   - Check all formatting renders properly

2. **Activate the workflow** when ready

3. **Monitor executions** for first few days to catch any API rate limits or credential expiration

## Common Issues

| Problem | Solution |
|---------|----------|
| "Unauthorized" from Gmail | Re-authenticate OAuth2 credential |
| No weather data | Verify API key and location parameter |
| Malformed email | Check recipient email format in JS code |
| Google verification required | Use Gmail API only with minimal scopes (self-hosted) |
| OAuth expires weekly | Indicates overly broad API scopes - reduce to gmail.send only |

## Data Included in Email
- Current weather (temp, feels-like, wind, humidity, pressure, visibility, UV)
- Current air quality (EPA/DEFRA indexes, PM2.5, PM10, CO, NO₂, O₃, SO₂)
- 3-day forecast with daily summaries
- Hourly breakdown (every hour) with conditions and AQI
- Location metadata (coordinates, timezone)

## Notes
- Free WeatherAPI tier: 1M calls/month (more than sufficient for daily emails)
- XML format used instead of JSON (workflow specifically parses XML)
- Air quality data uses US EPA and UK DEFRA indexing systems
- HTML email uses inline CSS for maximum compatibility
- Workflow is currently set to `active: false` - remember to activate it
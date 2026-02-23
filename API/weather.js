export default async function handler(req, res) {
  try {
    const latitude = 45.6609;
    const longitude = 18.4186;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    const data = await response.json();

    if (!data.current_weather) {
      return res.status(500).json({ error: "Weather data not available" });
    }

    return res.status(200).json({
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      weathercode: data.current_weather.weathercode
    });

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

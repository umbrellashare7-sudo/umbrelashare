export async function getWeather(locationName: string) {
  // Static campus coords (you can swap later)
  const lat = 19.076; // Mumbai example
  const lon = 72.8777;

  // Open-Meteo free endpoint
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain&hourly=precipitation_probability`;

  const res = await fetch(url);
  const data = await res.json();

  // Safely extract data
  const temp = data?.current?.temperature_2m ?? 0;
  const rainNow = data?.current?.rain ?? 0;

  // Hourly rain chances list
  const rainChance =
    data?.hourly?.precipitation_probability?.[0] ??
    Math.min(Math.round(rainNow * 100), 100);

  return {
    temperature: temp,
    summary: rainChance > 50 ? "Rain expected" : "Clear skies",
    rainChance,
    isRainy: rainChance > 50,
    advice:
      rainChance > 50
        ? "High chance of rain — carry an umbrella."
        : "Low rain risk — you're good!",
  };
}

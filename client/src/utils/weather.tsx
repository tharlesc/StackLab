import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Snowflake,
  Wind,
  CloudFog
} from 'lucide-react-native';

export const getWeatherIcon = (weather: string, size = 22, color?: string): React.ReactNode => {
  const defaultColor = color || '#64748B';
  color = defaultColor;
  const key = weather.toLowerCase().trim();
  if (key.includes('ensolarado') || key.includes('sol') || key.includes('limpo')) return <Sun size={size} color={color} />;
  if (key.includes('parcialmente nublado') || key.includes('parcial')) return <CloudSun size={size} color={color} />;
  if (key.includes('nublado') || key.includes('nuvens') || key.includes('encoberto')) return <Cloud size={size} color={color} />;
  if (key.includes('chuva') || key.includes('chuvoso')) return <CloudRain size={size} color={color} />;
  if (key.includes('tempestade') || key.includes('trovoada') || key.includes('raio')) return <CloudLightning size={size} color={color} />;
  if (key.includes('garoa') || key.includes('chuvisco')) return <CloudDrizzle size={size} color={color} />;
  if (key.includes('neve') || key.includes('nevando')) return <Snowflake size={size} color={color} />;
  if (key.includes('vento') || key.includes('ventania')) return <Wind size={size} color={color} />;
  if (key.includes('neblina') || key.includes('névoa') || key.includes('cerração')) return <CloudFog size={size} color={color} />;
  return <CloudSun size={size} color={color} />;
};

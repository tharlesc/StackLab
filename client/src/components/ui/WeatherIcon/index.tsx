import React from 'react';
import { useTheme } from 'styled-components/native';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Snowflake,
  Wind,
  CloudFog,
} from 'lucide-react-native';

export interface WeatherIconProps {
  weather: string;
  size?: number;
  color?: string;
}

export const getWeatherIcon = (weather: string, size = 20, color?: string): React.ReactElement => {
  const key = weather.toLowerCase().trim();
  // Ordenado por especificidade/severidade (ex.: "tempestade com chuva" -> tempestade)
  if (key.includes('tempestade') || key.includes('trovoada') || key.includes('raio')) {
    return <CloudLightning size={size} color={color} />;
  }
  if (key.includes('neve') || key.includes('nevando')) {
    return <Snowflake size={size} color={color} />;
  }
  if (key.includes('garoa') || key.includes('chuvisco')) {
    return <CloudDrizzle size={size} color={color} />;
  }
  if (key.includes('chuva') || key.includes('chuvoso')) {
    return <CloudRain size={size} color={color} />;
  }
  if (key.includes('neblina') || key.includes('névoa') || key.includes('cerração')) {
    return <CloudFog size={size} color={color} />;
  }
  if (key.includes('vento') || key.includes('ventania')) {
    return <Wind size={size} color={color} />;
  }
  if (key.includes('parcialmente nublado') || key.includes('parcial')) {
    return <CloudSun size={size} color={color} />;
  }
  if (key.includes('nublado') || key.includes('nuvens') || key.includes('encoberto')) {
    return <Cloud size={size} color={color} />;
  }
  if (key.includes('ensolarado') || key.includes('sol') || key.includes('limpo')) {
    return <Sun size={size} color={color} />;
  }
  return <CloudSun size={size} color={color} />;
};

export const WeatherIcon = ({ weather, size, color }: WeatherIconProps) => {
  const theme = useTheme();
  return getWeatherIcon(weather, size ?? theme.icon.size.md, color ?? theme.colors.text.secondary);
};

export default WeatherIcon;

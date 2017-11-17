import colors from '../constants/colors';
import moment from 'moment';


export const getRouteColor = (routeIndex) => colors[routeIndex % colors.length];

export const pprintSeconds = (seconds) => {
  const d = moment.duration(seconds, 'seconds');
  const hours = Math.floor(d.asHours());
  const mins = Math.floor(d.asMinutes()) - hours * 60;

  return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

import Svg, { Circle, Path, Rect } from 'react-native-svg';

function HomeIcon({ color, size, strokeWidth }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.75 10.5 12 3.75l8.25 6.75"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
      <Path
        d="M6.75 9.75V20.25H17.25V9.75"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
    </Svg>
  );
}

function CalendarIcon({ color, size, strokeWidth }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect
        x={3.75}
        y={5.25}
        width={16.5}
        height={15}
        rx={2.25}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Path
        d="M7.5 3.75V6.75M16.5 3.75V6.75M3.75 9.75H20.25"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
      />
      <Rect x={7.5} y={12.25} width={3} height={3} rx={0.75} fill={color} />
    </Svg>
  );
}

function UsersIcon({ color, size, strokeWidth }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle
        cx={9}
        cy={8.25}
        r={2.75}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={16.25}
        cy={9.25}
        r={2.25}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Path
        d="M4.5 18.75C4.5 15.85 6.84 13.5 9.75 13.5H11.25C14.16 13.5 16.5 15.85 16.5 18.75"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
      />
      <Path
        d="M15 14.25C16.94 14.25 19.2 15.5 19.5 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
      />
    </Svg>
  );
}

function BriefcaseIcon({ color, size, strokeWidth }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect
        x={3.75}
        y={7.5}
        width={16.5}
        height={11.25}
        rx={2.25}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Path
        d="M9 7.5V6.75C9 5.51 10.01 4.5 11.25 4.5H12.75C13.99 4.5 15 5.51 15 6.75V7.5M3.75 12H20.25"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
    </Svg>
  );
}

function MessageCircleIcon({ color, size, strokeWidth }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.5C7.44 4.5 3.75 7.85 3.75 12C3.75 14.02 4.62 15.85 6.05 17.21L5.25 20.25L8.8 19.12C9.79 19.42 10.87 19.58 12 19.58C16.56 19.58 20.25 16.23 20.25 12.08C20.25 7.92 16.56 4.5 12 4.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
    </Svg>
  );
}

function BellIcon({ color, size, strokeWidth }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.75 9.75C6.75 6.85 9.1 4.5 12 4.5C14.9 4.5 17.25 6.85 17.25 9.75V13.12C17.25 13.84 17.51 14.54 17.98 15.09L19.12 16.41C19.68 17.06 19.22 18.08 18.36 18.08H5.64C4.78 18.08 4.32 17.06 4.88 16.41L6.02 15.09C6.49 14.54 6.75 13.84 6.75 13.12V9.75Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
      <Path
        d="M10.12 19.5C10.5 20.18 11.2 20.63 12 20.63C12.8 20.63 13.5 20.18 13.88 19.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
      />
    </Svg>
  );
}

function MenuIcon({ color, size }) {
  const dots = [
    [7, 9],
    [12, 9],
    [17, 9],
    [7, 15],
    [12, 15],
    [17, 15],
  ];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {dots.map(([cx, cy]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.5} fill={color} />
      ))}
    </Svg>
  );
}

const ICONS = {
  home: HomeIcon,
  calendar: CalendarIcon,
  users: UsersIcon,
  briefcase: BriefcaseIcon,
  'message-circle': MessageCircleIcon,
  bell: BellIcon,
  menu: MenuIcon,
};

export default function TabIcon({ name, color, size = 22 }) {
  const Icon = ICONS[name];

  if (!Icon) {
    return null;
  }

  return <Icon color={color} size={size} strokeWidth={1.8} />;
}


try {
  const Lucide = require('lucide-react');
  const icons = [
  'CloudRain', 
  'Thermometer', 
  'Droplets', 
  'TrendingDown', 
  'TrendingUp', 
  'AlertTriangle', 
  'Calendar', 
  'Sun', 
  'Snowflake', 
  'Wind', 
  'Sprout', 
  'Tractor', 
  'Layers', 
  'Info'
  ];
  
  console.log('Checking Lucide icons:');
  icons.forEach(icon => {
    if (!Lucide[icon]) {
      console.error(`Missing icon: ${icon}`);
    } else {
        // console.log(`Found: ${icon}`);
    }
  });
} catch (e) {
  console.error('Error loading lucide-react', e.message);
}

try {
  const Recharts = require('recharts');
  const components = [
  'LineChart',
  'Line',
  'BarChart',
  'Bar',
  'XAxis',
  'YAxis',
  'CartesianGrid',
  'Tooltip',
  'Legend',
  'ResponsiveContainer',
  'ComposedChart',
  'Area'
  ];

  console.log('Checking Recharts components:');
  components.forEach(comp => {
    if (!Recharts[comp]) {
      console.error(`Missing component: ${comp}`);
    } else {
        // console.log(`Found: ${comp}`);
    }
  });
} catch (e) {
  console.error('Error loading recharts', e.message);
}

import {
  onCLS, onFCP, onINP, onLCP, onTTFB
} from 'web-vitals';

type ReportHandler = (metric: {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
  navigationType?: string;
}) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;

import { useAlertGenerator } from '@/hooks/useAlertGenerator';

/**
 * Background component that monitors for alert conditions
 * and creates notifications when issues are detected
 */
export const AlertMonitor = () => {
  // This hook runs the alert checks automatically
  useAlertGenerator();
  
  // This component doesn't render anything visible
  return null;
};

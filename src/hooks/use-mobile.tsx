import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Default to false for SSR and initial client render to match server output.
  // The actual value will be determined on the client after hydration.
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Set hasMounted to true after the component mounts.
    setHasMounted(true);

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Set initial value after mount
    onChange(); 
    
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array ensures this runs once on mount

  // Return the server-consistent value (false) until mounted, then the actual client value.
  // This helps prevent hydration mismatches for components that conditionally render based on isMobile.
  if (!hasMounted) {
    return false; 
  }
  return isMobile;
}

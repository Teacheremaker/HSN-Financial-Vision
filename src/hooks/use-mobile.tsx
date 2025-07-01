import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false) // Default to desktop

  React.useEffect(() => {
    // This check runs only on the client, after hydration
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkIsMobile() // Initial check
    window.addEventListener("resize", checkIsMobile) // Add listener for changes

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", checkIsMobile)
  }, []) // Empty dependency array ensures this runs once on mount

  return isMobile
}

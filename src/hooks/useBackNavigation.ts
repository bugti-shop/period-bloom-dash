import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Hook to handle back navigation with fallback to home page
 * Useful when a page is accessed directly without navigation history
 */
export const useBackNavigation = () => {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback to home page
      navigate('/');
    }
  }, [navigate]);

  return goBack;
};
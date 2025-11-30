import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';

export const useMobileBackButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = App.addListener('backButton', () => {
      navigate(-1);
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, [navigate]);
};

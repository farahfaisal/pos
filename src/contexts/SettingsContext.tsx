import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Settings } from '../types/Settings';

interface SettingsContextType {
  settings: Settings | null;
  updateSettings: (category: keyof Settings, value: any) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  updateSettings: async () => {},
  isLoading: true,
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase configuration missing, using default settings');
        setSettings({});
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) {
        console.warn('Settings table not found or accessible, using default settings:', error);
        setSettings({});
        setIsLoading(false);
        return;
      }

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Settings);

      setSettings(settingsMap);
    } catch (error) {
      console.warn('Error loading settings, using defaults:', error);
      setSettings({});
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (category: keyof Settings, value: any) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value })
        .eq('key', category);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, [category]: value } : null);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
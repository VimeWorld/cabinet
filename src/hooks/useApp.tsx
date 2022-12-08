import { createContext, useContext } from 'react';

interface FetchAuthOptionsType {
  success?: () => void;
  error?: (error: any) => void;
}

interface AppContextContainerType {
  app: AppContextInterface;
  updateApp: (changes: AppContextInterface) => void;
  fetchAuth: (options?: FetchAuthOptionsType) => Promise<void>;
  logout: () => Promise<void>;
}

interface AppContextInterface {
  savedTheme: 'light' | 'dark' | null;
  theme: string;
  skinModified: number;
  user?: UserInterface;
}

interface UserInterface {
  id: number;
  username: string;
  email: string;
  cash: number;
  reg_time: string;
  mfa: 'disabled' | 'needed' | 'completed';
  account_deleted: boolean;
  client_country: string;
}

export const AppContext = createContext<AppContextContainerType>(null!);

export default () => useContext(AppContext);

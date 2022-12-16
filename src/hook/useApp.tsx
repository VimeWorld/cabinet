import { createContext, useContext } from "react"

interface FetchAuthOptionsType {
    success?: () => void;
    error?: (error?: Error) => void;
}

interface AppContextContainerType {
    app: AppContextType;
    updateApp: (changes: AppContextType) => void;
    fetchAuth: (options?: FetchAuthOptionsType) => Promise<void>;
    logout: () => Promise<void>;
}

interface AppContextType {
    savedTheme: 'light' | 'dark' | null,
    theme: string,
    skinModified: number;
    user?: UserType;
}

interface UserType {
    id: number;
    username: string;
    email: string;
    cash: number;
    reg_time: string;
    mfa: 'disabled' | 'needed' | 'completed';
    account_deleted: boolean;
    client_country: string;
}

export const AppContext = createContext<AppContextContainerType>(null!)

export default () => useContext(AppContext)

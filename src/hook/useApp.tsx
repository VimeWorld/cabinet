import { createContext, useContext } from "react";

interface FetchAuthOptionsType {
    success?: () => void;
    error?: (error: any) => void;
}

interface AppContextContainerType {
    app: AppContextType;
    updateApp: (changes: AppContextType) => void;
    fetchAuth: (options?: FetchAuthOptionsType) => Promise<void>;
    logout: () => Promise<void>;
}

interface AppContextType {
    token?: string;
    tuuid?: string;
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

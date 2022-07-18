import { createContext, useContext } from "react";

interface AppContextContainerType {
    app: AppContextType;
    updateApp: (changes: AppContextType) => void;
    logout: () => Promise<void>;
}

interface AppContextType {
    token?: string;
    tuuid?: string;
    user?: UserType;
}

interface UserType {
    id: number;
    username: string;
    email: string;
    cash: number;
    reg_time: string;
    mfa_needed: boolean;
    account_deleted: boolean;
}

export const AppContext = createContext<AppContextContainerType>(null!)

export default () => useContext(AppContext)

import axios from "axios";
import React, { createContext, useState } from "react";


export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const AppContext = createContext({ backendUrl })

const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '')

    const value = {
        backendUrl,
        currency,
        aToken,
        setAToken,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider

// Admin Auth Context
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};
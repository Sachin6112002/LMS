import axios from "axios";
import { createContext, useState } from "react";


export const AppContext = createContext()

const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
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
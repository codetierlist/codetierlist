import { createContext } from "react"

/** defines a user pre-integration */
export declare type NotTheRealUserType = {
    role: string,
    name: string,
}

export const UserContext = createContext<NotTheRealUserType>({
    role: "admin",
    name: "John Doe",
});

import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuthContextProvider } from '../contexts/AuthContext'

export default function PrivateRoute({component: Component, ...rest}){
    const { currentUser } = useAuthContextProvider();

    const role = currentUser.RoleId != undefined ? currentUser.RoleId : 0;
console.log(role,rest.Roles)
    return (
        <Route
        {...rest}
        render={props=>{
            return rest.Roles.includes(role) ? <Component {...props} /> : <Redirect to="/unauthorized" />
        }}
        >
                
        </Route>
    )
}
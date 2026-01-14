import React from 'react'
import Header from './AdminHeader'
import { Outlet } from 'react-router-dom'


export default function AdminMainLayout() {
    return (
        <div>
            <Header />
            <Outlet />

        </div>
    )
}
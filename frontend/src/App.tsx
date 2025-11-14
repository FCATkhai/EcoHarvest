import './App.css'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router'

import { router } from './router/index.tsx'
function App() {
    return (
        <>
            <Toaster />
            <RouterProvider router={router} />
        </>
    )
}

export default App

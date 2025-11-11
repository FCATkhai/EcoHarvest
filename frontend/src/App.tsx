import { useState } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'

import { CardDemo } from './cardemo'

// test auth client
import { authClient } from './lib/auth-client'

const signUpUser = async (email: string, password: string, name: string) => {
    const { data, error } = await authClient.signUp.email({
        email,
        password,
        name
    })
    console.log('User signed up:', data)
    if (error) {
        console.error('Error signing up user:', error)
    }
}

const SignUpSubmit = async () => {
    await signUpUser('nva@gmail.com', '123', 'Test User')
}

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <Button variant='default' onClick={SignUpSubmit}>
                Test Button
            </Button>
            <CardDemo />

            <h1>Vite + React</h1>
            <div className='card'>
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
        </>
    )
}

export default App

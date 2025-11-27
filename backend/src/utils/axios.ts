import axios from 'axios'

const axiosAIInstance = axios.create({
    baseURL: process.env.AI_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

export default axiosAIInstance

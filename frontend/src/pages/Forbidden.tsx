import React from 'react'
import { Link } from 'react-router'

const Forbidden: React.FC = () => {
    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <div className='text-center'>
                <h1 className='text-6xl font-bold text-gray-800 mb-4'>403</h1>
                <p className='text-2xl font-semibold text-gray-600 mb-2'>Access Forbidden</p>
                <p className='text-gray-500 mb-8'>Bạn không có quyền truy cập vào tài nguyên này.</p>
                <Link
                    to='/'
                    className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition'
                >
                    Quay lại trang chủ
                </Link>
            </div>
        </div>
    )
}

export default Forbidden

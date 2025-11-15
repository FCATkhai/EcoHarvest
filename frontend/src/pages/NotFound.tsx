import { useNavigate } from 'react-router'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
            <div className='text-center'>
                <h1 className='text-6xl font-bold text-gray-800 mb-4'>404</h1>
                <p className='text-2xl font-semibold text-gray-600 mb-8'>Page Not Found</p>
                <p className='text-gray-500 mb-8'>Xin lỗi, trang bạn đang tìm kiếm không tồn tại.</p>
                <button
                    onClick={() => navigate('/')}
                    className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
                >
                    Quay lại trang chủ
                </button>
            </div>
        </div>
    )
}

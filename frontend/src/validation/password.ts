import z from 'zod'

export const passwordSchema = z
    .string()
    .min(1, { message: 'Mật khẩu là bắt buộc' })
    .min(3, { message: 'Mật khẩu phải có ít nhất 3 ký tự' })
// .regex(/[^A-Za-z0-9]/, {
//     message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'
// })

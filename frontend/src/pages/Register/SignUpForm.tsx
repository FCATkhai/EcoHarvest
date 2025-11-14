import { LoadingButton } from '@/components/LoadingButton'
import { PasswordInput } from '@/components/PasswordInput'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { passwordSchema } from '@/validation/password'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import useAuthStore from '@/store/useAuthStore'
import AppPath from '@/constants/AppPath'

const signUpSchema = z
    .object({
        name: z.string().min(1, { message: 'Tên là bắt buộc' }),
        email: z.email({ message: 'Xin hãy nhập email hợp lệ' }),
        password: passwordSchema,
        passwordConfirmation: z.string().min(1, { message: 'Xin hãy xác nhận mật khẩu' })
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: 'Mật khẩu không khớp',
        path: ['passwordConfirmation']
    })

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUpForm() {
    const [error, setError] = useState<string | null>(null)
    const signUp = useAuthStore((state) => state.signUp)

    const navigate = useNavigate()

    const form = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: ''
        }
    })

    async function onSubmit({ email, password, name }: SignUpValues) {
        setError(null)

        try {
            await signUp({ name, email, password })
            toast.success('Đăng ký thành công')
            navigate(AppPath.home)
        } catch (error) {
            setError((error as Error).message || 'Something went wrong')
        }
    }

    const loading = form.formState.isSubmitting

    return (
        <Card className='w-full max-w-md'>
            <CardHeader>
                <CardTitle className='text-lg md:text-xl'>Đăng ký</CardTitle>
                <CardDescription className='text-xs md:text-sm'>
                    Nhập thông tin của bạn để tạo tài khoản
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Tên của bạn' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type='email' placeholder='your@email.com' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <PasswordInput autoComplete='new-password' placeholder='Mật khẩu' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='passwordConfirmation'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Xác nhận mật khẩu</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            autoComplete='new-password'
                                            placeholder='Xác nhận mật khẩu'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div role='alert' className='text-sm text-red-600'>
                                {error}
                            </div>
                        )}

                        <LoadingButton type='submit' className='w-full' loading={loading}>
                            Tạo tài khoản
                        </LoadingButton>
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                <div className='flex w-full justify-center border-t pt-4'>
                    <p className='text-muted-foreground text-center text-xs'>
                        Đã có tài khoản?{' '}
                        <Link to={AppPath.signIn} className='underline'>
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}

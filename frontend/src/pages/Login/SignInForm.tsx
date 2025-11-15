import { LoadingButton } from '@/components/LoadingButton'
import { PasswordInput } from '@/components/PasswordInput'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { passwordSchema } from '@/validation/password'
import useAuthStore from '@/store/useAuthStore'
import AppPath from '@/constants/AppPath'
import { USER_ROLES } from '@/constants/userRoles'

const signInSchema = z.object({
    email: z.email({ message: 'Xin hãy nhập email hợp lệ' }),
    password: passwordSchema
    // rememberMe: z.boolean().optional()
})

type SignInValues = z.infer<typeof signInSchema>

export function SignInForm() {
    const user = useAuthStore((state) => state.user)
    const singIn = useAuthStore((state) => state.signIn)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const form = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: ''
            // rememberMe: false
        }
    })

    async function onSubmit({ email, password }: SignInValues) {
        setError(null)
        setLoading(true)

        try {
            await singIn(email, password)
            if (user && user.role === USER_ROLES.ADMIN) {
                console.log('Redirecting to admin dashboard')
                navigate(AppPath.admin)
                return
            }
            toast.success('Đăng nhập thành công')
            navigate(AppPath.home)
        } catch (err) {
            setError((err as Error).message || 'Something went wrong')
        }

        setLoading(false)
    }

    async function handleSocialSignIn(provider: 'google' | 'github') {
        setError(null)
        setLoading(true)

        const { error } = await authClient.signIn.social({
            provider
            // callbackURL: redirect ?? '/dashboard'
        })

        setLoading(false)

        if (error) {
            setError(error.message || 'Something went wrong')
        }
    }

    return (
        <Card className='w-full max-w-md'>
            <CardHeader>
                <CardTitle className='text-lg md:text-xl'>Đăng nhập</CardTitle>
                <CardDescription className='text-xs md:text-sm'>
                    Nhập email của bạn bên dưới để đăng nhập vào tài khoản
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                                    <div className='flex items-center'>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <Link to='/forgot-password' className='ml-auto inline-block text-sm underline'>
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <PasswordInput
                                            autoComplete='current-password'
                                            placeholder='Password'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {
                            // remember me checkbox
                            /* <FormField
                            control={form.control}
                            name='rememberMe'
                            render={({ field }) => (
                                <FormItem className='flex items-center gap-2'>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Remember me</FormLabel>
                                </FormItem>
                            )}
                        /> */
                        }

                        {error && (
                            <div role='alert' className='text-sm text-red-600'>
                                {error}
                            </div>
                        )}

                        <LoadingButton type='submit' className='w-full' loading={loading}>
                            Đăng nhập
                        </LoadingButton>

                        {/* <div className='flex w-full flex-col items-center justify-between gap-2'>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-full gap-2'
                                disabled={loading}
                                onClick={() => handleSocialSignIn('google')}
                            >
                                <GoogleIcon width='0.98em' height='1em' />
                                Sign in with Google
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                className='w-full gap-2'
                                disabled={loading}
                                onClick={() => handleSocialSignIn('github')}
                            >
                                <GitHubIcon />
                                Sign in with Github
                            </Button>
                        </div> */}
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                <div className='flex w-full justify-center border-t pt-4'>
                    <p className='text-muted-foreground text-center text-xs'>
                        Chưa có tài khoản?{' '}
                        <Link to={AppPath.signUp} className='underline'>
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}

import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AuthLayout from '@/components/layout/auth-layout'

const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
    const navigate = useNavigate()
    const { signup, error: authError } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
    })

    const onSubmit = async (data: SignupValues) => {
        try {
            await signup(data.email, data.password, data.name)
            navigate('/dashboard')
        } catch {
            // Error handled by auth context
        }
    }

    return (
        <AuthLayout>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-neutral-500">
                    Enter your email below to create your account
                </p>
            </div>

            <div className="grid gap-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Input
                                id="name"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={isSubmitting}
                                label="Name"
                                error={errors.name?.message}
                                {...register('name')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isSubmitting}
                                label="Email"
                                error={errors.email?.message}
                                {...register('email')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min. 8 characters"
                                disabled={isSubmitting}
                                label="Password"
                                error={errors.password?.message}
                                {...register('password')}
                            />
                        </div>

                        {authError && (
                            <div className="p-3 rounded-md bg-red-50 border border-red-100">
                                <p className="text-sm text-red-600">{authError}</p>
                            </div>
                        )}

                        <Button disabled={isSubmitting} loading={isSubmitting}>
                            Create Account
                        </Button>
                    </div>
                </form>

                <p className="px-8 text-center text-sm text-neutral-500">
                    <Link to="/login" className="hover:text-brand underline underline-offset-4">
                        Already have an account? Sign In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}

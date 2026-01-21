import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/layout/auth-layout";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch {
      // Error handled by auth context
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-2 mb-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Login to your account
        </h1>
        <p className="text-sm text-neutral-500">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
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
                {...register("email")}
              />
            </div>
            <div className="grid gap-2">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoCapitalize="none"
                autoComplete="current-password"
                disabled={isSubmitting}
                label="Password"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {authError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            <Button disabled={isSubmitting} loading={isSubmitting}>
              Sign In with Email
            </Button>
          </div>
        </form>

        <p className="px-8 text-center text-sm text-neutral-500">
          <Link
            to="/signup"
            className="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

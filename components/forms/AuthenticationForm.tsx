"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from "@/validation/authentication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, register } from "@/store/thunks/fetchAuthentication";
import type { RootState } from "@/store";

export default function AuthenticationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authError = useAppSelector((state: RootState) => state.auth.error);
  const authIsLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");

  const form = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    }
  });

  // Update form when mode changes from URL
  useEffect(() => {
    const newMode = searchParams.get("mode") === "signup" ? false : true;
    if (newMode !== isLogin) {
      setIsLogin(newMode);
      form.reset({
        email: "",
        password: "",
        username: "",
        confirmPassword: "",
      });
    }
  }, [searchParams, isLogin, form]);

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
      // Validate with correct schema
      const schema = isLogin ? loginSchema : signupSchema;
      const validationResult = schema.safeParse(data);
      
      if (!validationResult.success) {
        // Set form errors
        const errors = validationResult.error.flatten().fieldErrors;
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, {
            type: "validation",
            message: errors[key as keyof typeof errors]?.[0],
          });
        });
        return;
      }

      if (isLogin) {
        const result = await dispatch(login(data as LoginFormData));
        // console.log('result', result);
      } else {
        const result = await dispatch(register(data as SignupFormData));
      }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    form.reset({
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    });
  };

  return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="mb-6 text-center">
          <CardTitle className="mb-2 text-2xl font-bold">
            {isLogin ? "Добре дошли отново" : "Създаване на акаунт"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Влезте в акаунта си, за да продължите"
              : "Попълнете данните по-долу, за да създадете акаунт"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Global error message */}
              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имейл</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Въведете вашия имейл"
                        {...field}
                        autoCapitalize="none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username Field */}
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Потребителско име (Незадължително)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Въведете потребителско име"
                          {...field}
                          value={field.value || ""}
                          autoCapitalize="none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Парола</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Въведете вашата парола"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Потвърди парола</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Потвърдете вашата парола"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="mt-4 w-full"
                disabled={authIsLoading}
              >
                {authIsLoading
                  ? "Обработване..."
                  : isLogin
                    ? "Влизане"
                    : "Регистрация"}
              </Button>
            </form>
          </Form>

          {/* Toggle Form Type */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Нямате акаунт? " : "Вече имате акаунт? "}
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={toggleForm}
            >
              {isLogin ? "Регистрация" : "Влизане"}
            </Button>
          </div>
        </CardContent>
      </Card>
  );
}


"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Eye, EyeClosed, Lock } from "lucide-react";
import api from "@/lib/api";
import { RootState } from "@/store/store";

const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required."),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmNewPassword: z
            .string()
            .min(6, "Confirmation password must be at least 6 characters"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        path: ["confirmNewPassword"],
        message: "Passwords must match",
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

const ChangePassword: React.FC = () => {
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const router = useRouter();

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isChanging, setIsChanging] = useState(false)

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    if (!currentUserData) {
        router.push("/user/auth/login");
        return null;
    }

    const onSubmit = async (data: PasswordFormData) => {
        setSuccessMessage("");
        setErrorMessage("");

        setIsChanging(true)
        try {
            const response = await api.post(
                "/api/v1/users/change-password",
                {
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                    confirmNewPassword: data.confirmNewPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setSuccessMessage(response.data.message || "Password changed successfully!");
            form.reset();
            router.push('/settings')
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setIsChanging(false)
        }
    };

    const inputClasses = "h-11 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all duration-200 pr-11";

    const renderPasswordField = (
        name: "oldPassword" | "newPassword" | "confirmNewPassword",
        label: string,
        placeholder: string,
        show: boolean,
        toggle: () => void
    ) => (
        <FormField
            name={name}
            control={form.control}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </FormLabel>
                    <div className="relative">
                        <FormControl>
                            <Input
                                className={inputClasses}
                                type={show ? "text" : "password"}
                                placeholder={placeholder}
                                {...field}
                            />
                        </FormControl>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            onClick={toggle}
                        >
                            {show ? (
                                <EyeClosed className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                </FormItem>
            )}
        />
    );

    return (
        <div className="flex items-center justify-center h-auto px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#1a3d4d]/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-400/10 dark:to-blue-500/10 mb-4">
                            <Lock className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Change Password
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                            Update your password to keep your account secure
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {renderPasswordField("oldPassword", "Current Password", "Enter your current password", showOldPassword, () => setShowOldPassword(!showOldPassword))}
                            {renderPasswordField("newPassword", "New Password", "Enter your new password", showNewPassword, () => setShowNewPassword(!showNewPassword))}
                            {renderPasswordField("confirmNewPassword", "Confirm New Password", "Confirm your new password", showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}

                            {/* Feedback Messages */}
                            {errorMessage && (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                                </div>
                            )}
                            {successMessage && (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
                                    <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isChanging}
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30"
                            >
                                {isChanging ? "Changing..." : "Change Password"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};


export default ChangePassword;

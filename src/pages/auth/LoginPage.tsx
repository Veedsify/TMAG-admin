import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuthStore } from "../../stores/adminAuthStore";
import { adminApi } from "../../api/api";
import { setAuthCookie } from "../../api/axios";
import { queryKeys } from "../../api";
import { AxiosError } from "axios";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const login = useAdminAuthStore((s) => s.login);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await adminApi.login({ email, password });
            const { token, exp, user } = response.data.data;
            setAuthCookie(token, exp);
            queryClient.setQueryData(queryKeys.currentUser, user);
            login({
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions || [],
            });
            navigate("/admin/dashboard");
        } catch (err) {
            if (err instanceof AxiosError)
                if (err.response?.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError("Invalid credentials or access denied");
                }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            <div className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-md">
                    <Link to="/admin" className="inline-block mb-8">
                        <span className="text-xl font-serif font-medium tracking-tight text-heading">
                            TMAG
                        </span>
                        <span className="block text-[10px] text-muted uppercase tracking-widest mt-1">
                            Admin
                        </span>
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                        Admin sign in
                    </h1>
                    <p className="text-sm text-body mb-8">
                        Access the admin dashboard to manage the platform.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                placeholder="admin@example.com"
                                className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="text-xs text-muted text-center mt-8 flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        Only SuperAdmin and Administrator accounts can access this portal.
                    </p>
                </div>
            </div>
        </div>
    );
}

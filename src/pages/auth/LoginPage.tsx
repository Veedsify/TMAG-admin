import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAdminAuthStore, PREVIEW_ADMIN } from "../../stores/adminAuthStore";

export default function LoginPage() {
    const [email, setEmail] = useState(PREVIEW_ADMIN?.email ?? "");
    const [password, setPassword] = useState("admin123");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const login = useAdminAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }
        if (PREVIEW_ADMIN) {
            login(PREVIEW_ADMIN);
            navigate("/admin/dashboard");
        } else {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
            {/* Background texture */}
            <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #3d2c1e 1px, transparent 0)", backgroundSize: "32px 32px" }} />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-heading">TMAG Admin</h1>
                    <p className="text-sm text-muted mt-1">Sign in to the administration panel</p>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-2xl border border-border-light p-6 lg:p-8 space-y-5">
                    {error && (
                        <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-heading mb-1.5">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                placeholder="admin@tmag.com"
                                className="w-full px-4 py-2.5 bg-background-primary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-heading mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-2.5 bg-background-primary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 pr-10"
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
                            className="w-full py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors duration-150"
                        >
                            Sign in
                        </button>
                    </form>

                    <p className="text-center text-xs text-muted">
                        Protected area. Unauthorized access is prohibited.
                    </p>
                </div>

                {/* Preview hint */}
                <div className="mt-4 bg-white/60 rounded-xl border border-border-light/50 p-4 text-center">
                    <p className="text-xs text-muted">
                        <span className="font-medium text-heading">Preview Mode</span> — Using mock admin credentials. Click "Sign in" to continue.
                    </p>
                </div>
            </div>
        </div>
    );
}

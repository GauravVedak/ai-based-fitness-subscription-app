import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SignInPageProps {
	onSwitchToSignUp: () => void;
	onSuccess: () => void;
}

export function SignInPage({ onSwitchToSignUp, onSuccess }: SignInPageProps) {
	const { login, loginWithSocial } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			toast.error("Please fill in all fields");
			return;
		}

		setIsLoading(true);
		try {
			const res = await login(email, password);
			if (res.ok) {
				toast.success("Welcome back!");
				onSuccess();
			} else {
				toast.error(res.message || "Invalid credentials");
			}
		} catch (error) {
			toast.error("Invalid credentials");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSocialLogin = async (provider: string) => {
		setIsLoading(true);
		try {
			const res = await loginWithSocial(provider);
			if (res.ok) {
				toast.success(`Signed in with ${provider}`);
				onSuccess();
			} else {
				toast.error(res.message || `Failed to sign in with ${provider}`);
			}
		} catch (error) {
			toast.error(`Failed to sign in with ${provider}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-12">
			<Card className="w-full max-w-md p-8 shadow-lg">
				<div className="text-center mb-8">
					<h2 className="mb-2">Welcome back</h2>
					<p className="text-gray-600">Sign in to continue to Vital Box</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
							className="rounded-lg"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoading}
								className="rounded-lg pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg"
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign In"
						)}
					</Button>
				</form>

				{/* Social login buttons removed — not configured */}

				<div className="mt-6 text-center">
					<p className="text-gray-600">
						Don't have an account?{" "}
						<button
							onClick={onSwitchToSignUp}
							className="text-emerald-600 hover:text-emerald-700 transition-colors"
						>
							Sign Up
						</button>
					</p>
				</div>
			</Card>
		</div>
	);
}

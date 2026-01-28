import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

interface SignUpPageProps {
	onSwitchToSignIn: () => void;
	onSuccess: (redirectTo?: string) => void;
}

export function SignUpPage({ onSwitchToSignIn, onSuccess }: SignUpPageProps) {
	const { signup, loginWithSocial } = useAuth();
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!fullName || !email || !password || !confirmPassword) {
			toast.error("Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}

		if (password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		setIsLoading(true);
		try {
			// Redirect to Auth0 signup
			await signup(fullName, email, password);
		} catch (error) {
			toast.error("Failed to create account");
			setIsLoading(false);
		}
	};

	const handleSocialSignup = async (provider: string) => {
		setIsLoading(true);
		try {
			await loginWithSocial(provider);
		} catch (error) {
			toast.error(`Failed to sign up with ${provider}`);
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-12">
			<Card className="w-full max-w-md p-8 shadow-lg">
				<div className="text-center mb-8">
					<h2 className="mb-2">Create your account ✨</h2>
					<p className="text-gray-600">
						Join Vital Box and start your fitness journey
					</p>
				</div>

				{/* Auth0 Universal Signup Button */}
				<a
					href="/auth/login?screen_hint=signup"
					className="w-full mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
				>
					<Shield className="w-5 h-5" />
					Sign up with Auth0
				</a>

				<div className="relative my-6">
					<Separator />
					<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-500 text-sm">
						Or sign up with email
					</span>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="fullName">Full Name</Label>
						<Input
							id="fullName"
							type="text"
							placeholder="John Doe"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							disabled={isLoading}
							className="rounded-lg"
						/>
					</div>

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

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<div className="relative">
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								disabled={isLoading}
								className="rounded-lg pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
							>
								{showConfirmPassword ? (
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
								Creating account...
							</>
						) : (
							"Create Account"
						)}
					</Button>
				</form>

				{/* Social login buttons removed — not configured */}

				<div className="mt-6 text-center">
					<p className="text-gray-600">
						Already have an account?{" "}
						<a
							href="/auth/login"
							className="text-emerald-600 hover:text-emerald-700 transition-colors"
						>
							Sign In
						</a>
					</p>
				</div>
			</Card>
		</div>
	);
}

import { createContext, useContext, useState, ReactNode } from "react";

interface FitnessMetrics {
  bmi?: number;
  height?: number;
  weight?: number;
  unit?: "metric" | "imperial";
  goals?: string[];
  lastCalculated?: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  fitnessMetrics?: FitnessMetrics;
}

interface AuthResult {
  ok: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithSocial: (provider: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateFitnessMetrics: (metrics: FitnessMetrics) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, message: data.message || data.error || "Invalid credentials" };
    } catch (err) {
      return { ok: false, message: String(err) };
    }
  };

  const loginWithSocial = async (provider: string): Promise<AuthResult> => {
    return { ok: false, message: "Social login not configured" };
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, message: data.message || data.error };
    } catch (err) {
      return { ok: false, message: String(err) };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateFitnessMetrics = (metrics: FitnessMetrics) => {
    if (user) {
      setUser({
        ...user,
        fitnessMetrics: {
          ...user.fitnessMetrics,
          ...metrics,
          lastCalculated: new Date(),
        },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithSocial, signup, logout, updateFitnessMetrics }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

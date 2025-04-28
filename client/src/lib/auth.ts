import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { AuthState, AuthUser } from "@/lib/types";

// Mock Google OAuth client for the prototype
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        }
      }
    };
  }
}

let googleAuthInitialized = false;

export function useAuth(): AuthState & {
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  initGoogleAuth: () => void;
} {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null
  });

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: data.user
        });
      } else {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
      }
    } catch (error) {
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credential: string) => {
    try {
      // In a real app, you would decode the credential and get more info
      // For now, let's use a more predictable mock data for development
      const mockGoogleProfile = {
        email: "test@example.com",
        name: "Test User",
        googleId: "google-test-123",
        avatarUrl: "https://ui-avatars.com/api/?name=Test+User&background=random"
      };
      
      // Add a retry mechanism for development
      let retries = 3;
      let res;
      
      while (retries > 0) {
        res = await apiRequest('POST', '/api/auth/google', mockGoogleProfile);
        if (res.ok) break;
        retries--;
        // Small delay between retries
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (res && res.ok) {
        const data = await res.json();
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: data.user
        });
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${data.user.displayName || data.user.email}!`,
        });
      } else {
        throw new Error("Authentication failed after multiple attempts");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Could not authenticate with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Could not log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const initGoogleAuth = useCallback(() => {
    if (googleAuthInitialized || !window.google) return;
    
    window.google.accounts.id.initialize({
      client_id: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      callback: async (response: { credential: string }) => {
        // In a real implementation, we would validate the token server-side
        // For this prototype, we'll just simulate a success
        if (response.credential) {
          await login(response.credential);
        }
      },
    });
    
    googleAuthInitialized = true;
  }, [login]);

  return {
    ...authState,
    login,
    logout,
    initGoogleAuth
  };
}

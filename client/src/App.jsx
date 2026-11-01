import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* Global Toast Notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#0f172a",
                            color: "#f8fafc",
                            fontSize: "13px",
                            fontWeight: 500,
                            borderRadius: "12px",
                            padding: "12px 16px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        },
                        success: {
                            iconTheme: {
                                primary: "#10b981",
                                secondary: "#ffffff",
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: "#ef4444",
                                secondary: "#ffffff",
                            },
                        },
                    }}
                />

                {/* Application Routing */}
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

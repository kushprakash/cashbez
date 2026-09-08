import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notify } from "../components/Toast";
import { storeTokenAndUserData } from "../services/tokenManager";

const AutoLogin = () => {
    // Logic for auto-login (e.g., checking cookies, tokens, etc.)

    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState("Initializing...");


    useEffect(() => {
        // Prefer token/tenant from context (injected by loader.js), fallback to query params for legacy
        const params = new URLSearchParams(location.search);
        console.log("Query Params:", params.toString());
        const token = params.get("token");
        if (token) handleProcess(token);
    }, [location]);

    const handleProcess = async (token) => {
        setStatus("Processing your secure login...");
        try {
            // Decode base64 token
            const decodedString = atob(token);
            // Parse JSON data
            const userData = JSON.parse(decodedString);

            const { mid, mkey, outletId } = userData;

            if (!mid || !mkey) {
                throw new Error("Invalid token data");
            }

            console.log("User Data:", userData);

            // Store the token and user data
            storeTokenAndUserData({
                mid,
                mkey,
                outletId: outletId || "", // Handle empty outletId
                token
            });

            if (outletId !== undefined && outletId !== null) {
                // Redirect to outlet selection if outletId is provided
                setStatus("Login successful!");
                navigate(`/aeps`);
                return;
            }

            setStatus("Redirecting to Register...");
            navigate("/register");
        } catch (err) {
            console.error(err);
            setStatus("Unexpected error occurred.");
            notify.error("Please try again later.");
        }
    }

    return (
        <div>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body text-center">
                                <h2 className="card-title mb-4">Loading...</h2>
                                <p>{status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoLogin;
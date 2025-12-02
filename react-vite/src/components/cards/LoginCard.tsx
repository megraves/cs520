import LabeledButton from "../buttons/LabeledButton";
import { Form, Input } from "@heroui/react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const LoginCard = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [showResetForm, setShowResetForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        console.log("Submitting signup with:", { email, password });

        if (authError) {
            console.error(authError);
            setError(authError);
            setLoading(false);
            return;
        }

        const user = authData.user;
        if (!user) {
            setError(new Error("No user returned from login."));
            setLoading(false);
            return;
        }

        const { error: historyError } = await supabase
        .from("user_sign_in_history")
        .insert([
          { id: user.id, email: user.email, sign_in_at: new Date().toISOString() }
        ]);

        if (historyError) {
            console.error("Failed to log sign-in:", historyError);
            // Optional: you could show a warning, but do not block login
        }
        
        navigate("/home");

    };

    const validatePassword = (pass: string) => {
        // Set password requirements based on regex
        // Has at least one uppercase
        // Has at least one number
        // Has at least 8 characters
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        const valid = strongPasswordRegex.test(pass)
        if (pass == "") {
            return null;
        }
        if (pass.includes(" ")) {
            return "No spaces allowed."
        }
        if (!valid) {
            return "Password must have: at least 8 characters, at least one uppercase, at least one number";
        }
        return null;
    }

    const handlePasswordReset = async () => {
        setResetLoading(true);
        setResetMessage('');

        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
            setResetMessage('Error sending reset email: ' + error.message);
        } else {
            setResetMessage('Check your email for the reset link!');
        }

        setResetLoading(false);
    };


    return (
        <div className="max-w-sm w-full mx-auto rounded-2xl overflow-hidden p-6 sm:max-w-md md:max-w-lg lg:max-w-xl">
            <Form className="w-full justify-center items-center space-y-7" onSubmit={onSubmit}>
                <div className="flex w-full flex-col flex-wrap gap-7">
                    <h1 className="text-xl font-semibold">Log In</h1>

                    <Input
                        isRequired
                        label="Email"
                        name="email"
                        placeholder="example@campusquest.com"
                        type="email"
                        value={email}
                        onValueChange={setEmail}
                        className="bg-white rounded-md p-1"
                    />

                    <Input
                        isRequired
                        errorMessage={validatePassword(password)}
                        isInvalid={validatePassword(password) !== null}
                        label="Password"
                        labelPlacement="outside"
                        name="password"
                        placeholder="************"
                        type="password"
                        value={password}
                        onValueChange={setPassword}
                        className="bg-white rounded-md p-1"
                    />

                    {error && (
                        <p className="text-red-600 text-sm">
                            {error.message.includes("Invalid login credentials")
                                ? "Invalid email or password. Please try again."
                                : "Something went wrong. Please try again later."}
                        </p>
                    )}

                    <LabeledButton
                        type="submit"
                        ariaLabel="Submit login form"
                        label={loading ? "Logging in..." : "Log In"}
                        loading={loading}
                    /> 
                </div>

                <div>
                    Forgot Password? 
                    {!showResetForm ? (
                        <button
                        onClick={() => setShowResetForm(true)}
                        className="underline decoration-sky-500 text-sky-500"
                        >
                        Reset Here
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="border rounded-md p-1"
                        />
                        <button
                            onClick={handlePasswordReset}
                            disabled={resetLoading}
                            className="bg-sky-500 text-white rounded-md py-1"
                        >
                            {resetLoading ? 'Sending...' : 'Send Reset Email'}
                        </button>
                        {resetMessage && <p className="text-sm mt-1">{resetMessage}</p>}
                        </div>
                )}
                </div>
                <div> 
                    Don't have an account? 
                    <a 
                        href="http://localhost:5173/" 
                        className="underline decoration-sky-500 text-sky-500"
                    > 
                        Sign up 
                    </a>
                </div>
            </Form>  
        </div>
    );
};

export default LoginCard;
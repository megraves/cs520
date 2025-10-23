import LabeledButton from "../buttons/LabeledButton";
import { Form, Input } from "@heroui/react";
import { useState } from "react";

import{supabase} from '../../lib/supabaseClient';

const SigninCard = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        // TODO: auth??
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSubmitted(null);

        console.log("Submitting signup with:", { username, email, password });

        const passwordError = validatePassword(password);
        if (passwordError){
            setError(passwordError);
            setLoading(false);
            return;
        }

        const {data, error:signUpError} = await supabase.auth.signUp(
        {
            email,
            password,
            options: {
                data: { username },
            },
        });

        console.log("Supabase signUp response:", { data, error: signUpError });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            // Sign up successful! Maybe redirect or show a message.
            setUsername('');
            setEmail('');
            setPassword('');
            setLoading(false);
            setSubmitted('Check your email for a confirmation link!'); // Supabase sends confirmation emails by default.
        }
    }

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

    return (
        <div className="max-w-sm w-full mx-auto rounded-2xl p-6 sm:max-w-md md:max-w-lg lg:max-w-xl">
            <Form
                className="w-full justify-center items-center space-y-7"
                onReset={() => setSubmitted(null)}
                onSubmit={onSubmit}
            >
                <div className="flex w-full flex-col flex-wrap gap-7">
                    <h1 className="text-xl font-semibold">Sign Up</h1>

                    <Input
                        isRequired
                        label="Username"
                        labelPlacement="outside"
                        name="username"
                        placeholder="KingArthur"
                        value={username}
                        onValueChange={setUsername}
                        className="bg-white rounded-md p-1"
                    />

                    <Input
                        isRequired
                        label="Email"
                        labelPlacement="outside"
                        name="email"
                        placeholder="kingarthur@campusquest.com"
                        type="email"
                        variant="bordered"
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
                    <LabeledButton
                        type="submit" 
                        ariaLabel="Submit" 
                        disabled={loading} 
                        label={loading ? "Signing up..." : "Sign Up"}
                    /> 
                    {error && <p className="text-red-600">{error}</p>}
                    {submitted && <p className="text-green-600">{submitted}</p>}
                </div>
                <div> 
                    Already have an account? 
                    <a 
                        href="http://localhost:5173/login" 
                        className="underline decoration-sky-500 text-sky-500"
                    > 
                        Log in 
                    </a>
                </div>
            </Form>  
        </div>
    );
};

export default SigninCard;
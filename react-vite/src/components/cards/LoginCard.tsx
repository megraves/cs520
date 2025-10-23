import LabeledButton from "../buttons/LabeledButton";
import { Form, Input } from "@heroui/react";
import { useState } from "react";
// import { supabase } from "../../lib/supabaseClient";

const LoginCard = () => {
    // const [errors, setErrors] = useState<Error | null>(null);
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const onSubmit = async () => {
        // TODO: auth??
        // 
        // const { data, error } = await supabase.auth.signInWithPassword({
        //     email: email,
        //     password: password
        // });

        // if (error != null) {
        //     //TODO: enhance logic (i.e. user/pass dne, some other error)
        //     console.log("could not sign in, an error has occurred");
        // }

        //return {submitted, data};
        return submitted;
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
        <div className="max-w-sm w-full mx-auto rounded-2xl overflow-hidden p-6 sm:max-w-md md:max-w-lg lg:max-w-xl">
            <Form
            className="w-full justify-center items-center space-y-7"
            onReset={() => setSubmitted(null)}
            onSubmit={onSubmit}

            >
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
                <LabeledButton onClick={onSubmit} ariaLabel="Submit"></LabeledButton> 
            </div>
            <div> Don't have an account? <a href="http://localhost:5173/" className="underline decoration-sky-500 text-sky-500"> Sign up </a></div>
        </Form>  
        </div>
    );
};

export default LoginCard;
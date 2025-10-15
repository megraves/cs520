import SubmitButton from "../buttons/SubmitButton";
import { Form, Input } from "@heroui/react";
import { useState } from "react";

const LoginCard = () => {
    // const [errors, setErrors] = useState<Error | null>(null);
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [password, setPassword] = useState('');

    const onSubmit = () => {
        // TODO: auth??
        console.log("submitted");
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
                labelPlacement="outside"
                name="email"
                placeholder="example@campusquest.com"
                type="email"
                variant="bordered"
                />

                <Input
                isRequired
                errorMessage={validatePassword(password)}
                isInvalid={validatePassword(password) !== null}
                label="Password"
                labelPlacement="outside"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onValueChange={setPassword}
                />
                <SubmitButton onClick={onSubmit} ariaLabel="Submit"></SubmitButton> 
            </div>
            <div> Don't have an account? <a href="http://localhost:5173/" className="underline decoration-sky-500 text-sky-500"> Sign up </a></div>
        </Form>  
        </div>
    );
};

export default LoginCard;
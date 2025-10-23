import LabeledButton from "../buttons/LabeledButton";
import { Form, Input } from "@heroui/react";
import { useState } from "react";

const SigninCard = () => {
    // const [errors, setErrors] = useState<Error | null>(null);
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [password, setPassword] = useState('');

    const onSubmit = () => {
        // TODO: auth??
        console.log("submitted");
        return submitted;
    }

    const validatePassword = (pass: string) => {
        return pass;
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
            <div> Already have an account? <a href="http://localhost:5173/login" className="underline decoration-sky-500 text-sky-500"> Log in </a></div>
        </Form>  
        </div>
    );
};

export default SigninCard;
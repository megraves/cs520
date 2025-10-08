//import SubmitButton from "@buttons/SubmitButton";
import { Form, Input } from "@heroui/react";
import { useState } from "react";

const LoginCard = () => {
    // const [errors, setErrors] = useState<Error | null>(null);
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [password, setPassword] = useState('');

    const onSubmit = () => {
        // TODO: auth??
        setSubmitted("submitted");
        return submitted;
    }

    const validatePassword = (pass: string) => {
        return pass;
    }

    return (
        <Form
            className="w-full justify-center items-center space-y-4"
            onReset={() => setSubmitted(null)}
            onSubmit={onSubmit}
        >
            <div className="flex flex-col gap-4 max-w-md">
                <Input
                isRequired
                label="Name"
                labelPlacement="outside"
                name="name"
                placeholder="Enter your name"
                />

                <Input
                isRequired
                label="Email"
                labelPlacement="outside"
                name="email"
                placeholder="Enter your email"
                type="email"
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
            </div>
        </Form>
    );
};

export default LoginCard;
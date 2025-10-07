import SubmitButton from "@buttons/SubmitButton";

const handleClick = () => {
    // TODO: Set up AUTH process upon log-in submission
}

const SigninCard = () => {
    return (
        <SubmitButton onClick={handleClick} ariaLabel="Submit"/>
    );
};

export default SigninCard;
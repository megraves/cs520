import { Button }  from "@heroui/button";

type Props = {
    onClick: () => void,
    //onHover: () => void,
    ariaLabel: string
};

const SubmitButton = ({onClick, ariaLabel}: Props) => {
    return (
        <Button
            aria-label={ariaLabel}
            onPress={onClick}
            className="bg-red-800 text-white rounded-md px-6 py-3 text-base sm:text-lg md:text-xl hover:bg-red-900 transition-colors w-full sm:w-auto"
            //onHover={onHover}
            radius="lg"
        >
            Submit
        </Button>
    );
};

export default SubmitButton;
import { Button } from "@heroui/button";

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
            //onHover={onHover}
            radius="full"
        >
            <i className="fa-solid">Submit</i>
        </Button>
    );
};

export default SubmitButton;
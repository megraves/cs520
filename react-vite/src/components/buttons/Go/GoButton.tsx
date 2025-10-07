import { Button } from "@heroui/button"; // look at ui framework (not called nextui anymore)

// What should happen when the button is clicked vs hovered
type Props = {
    onClick: () => void,
    onHover: () => void,
    ariaLabel: string
};

const GoButton = ({onClick, onHover, ariaLabel}: Props) => {
    return (
        <Button // Add tailwind for CSS
            aria-label={ariaLabel}
            variant="light"
            radius="full"
            onHover={onHover}
            onPress={onClick}
        >
            <i className="fa-solid"></i>
        </Button>
    )
};

export default GoButton;
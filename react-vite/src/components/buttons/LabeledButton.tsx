import { Button }  from "@heroui/button";

type Props = {
    onClick?: () => void;
    ariaLabel: string;
    label?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
};

export default function LabeledButton({
    onClick,
    ariaLabel,
    label,
    type = "button",
    disabled = false,
    loading = false,
}: Props) {
    return (
        <Button
            aria-label={ariaLabel}
            onPress={onClick}
            isDisabled={disabled || loading}
            isLoading={loading}
            type={type}
            className="bg-red-800 text-white rounded-md px-6 py-3 text-base sm:text-lg md:text-xl 
                       hover:bg-red-900 transition-colors w-full sm:w-auto"
            radius="lg"
        >
            {label || ariaLabel}
        </Button>
    );
};
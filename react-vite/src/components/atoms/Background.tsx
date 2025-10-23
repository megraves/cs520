type Props = {
    className?: string,
    children: React.ReactNode
};

export default function Background({className, children}: Props) {

    return (
        <div className={`w-full min-h-screen bg-neutral-300 ${className}`}>
            {children}
        </div>
    );
};


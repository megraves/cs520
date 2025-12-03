import * as classes from "../cards/card-classes";

type Props = {
    title: string,
    children?: React.ReactNode,
    button?: React.ReactNode,
    className?: string,
    icon?: React.ReactNode

}

export default function ResponsiveCard({title, children, button, className, icon}: Props) {

    return(
        <div className={`flex flex-col px-5 py-4 max-h-full max-w-1/2 ${classes.base}`}>
            <div className="flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row items-center gap-5">
                    {icon}
                    <h2 className={classes.title}>{title}</h2>
                </div>
                {button && <div>{button}</div>}
            </div>
            <div>
                <div className={`grow mt-4 ${className}`}>{children}</div>
            </div>
        </div>
    );
}
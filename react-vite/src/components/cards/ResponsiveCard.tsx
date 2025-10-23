import * as classes from "../cards/card-classes";

type Props = {
    title: string,
    children?: React.ReactNode,
    button?: React.ReactNode,
    className?: string,

}

export default function ResponsiveCard({title, children, button, className}: Props) {

    return(
        <div className={`flex flex-col px-5 py-4 max-h-full max-w-1/2 ${classes.base}`}>
            <h2 className={classes.title}>{title}</h2>
            <div className={`grow mt-4 ${className}`}>{children}</div>
            {button ?? null}
        </div>
    );
}
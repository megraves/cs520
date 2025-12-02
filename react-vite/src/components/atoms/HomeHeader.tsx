import type { ReactNode } from "react";
import IconButton from "../buttons/IconButton";
import { useNavigate } from "react-router-dom";

type Props = {
    children?: ReactNode
}

export default function HomeHeader({children}: Props) {
    const navigate = useNavigate();

    const goToProfile = () => {
        navigate("/profile");
    }

    return (
        <div className="bg-white mt-0 ml-0 flex flex-row justify-between p-5 w-full">
            <div className="flex flex-row items-center gap-5">
                <IconButton icon="fa-regular fa-circle-user fa-5x fa-" onAction={goToProfile}></IconButton>
                <h1 className="text-red-800 text-5xl font-bold">Campus Quest</h1>
            </div>
            <div className="flex flex-row items-center gap-5">
                {children}
            </div>
        </div>  
    );
}
import IconButton from "../buttons/IconButton";
import { useNavigate } from "react-router-dom";

export default function HomeHeader() {
    const navigate = useNavigate();

    const goToProfile = () => {
        navigate("/profile");
    }

    return (
        <div className="bg-white mt-0 ml-0 flex flex-row justify-left items-center p-5 w-2/3 gap-5">
            <IconButton icon="fa-regular fa-circle-user fa-5x fa-" onAction={goToProfile}></IconButton>
            <h1 className="text-red-800 text-5xl font-bold">Campus Quest</h1>
        </div>  
    );
}
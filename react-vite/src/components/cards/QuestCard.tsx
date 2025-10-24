import LabeledButton from "../buttons/LabeledButton";
import * as classes from "./card-classes";
import { useNavigate } from "react-router-dom";

type Props = {
    title: string,
    location: string,
    isVirtual?: boolean,
    questId: string,
    creator: string | null;
}

export default function QuestCard({title, location, questId, creator}: Props) {

    const navigate = useNavigate();

    const startQuest = () => {
        console.log("Go! clicked", questId);
        navigate(`/go-mode/${questId}`);
    };

    const originBadge = creator
    ? { text: "User Created", cls: "bg-blue-100 text-blue-700" }
    : { text: "Official", cls: "bg-gray-100 text-gray-700" };

    return(
        <div className="bg-white shadow rounded-xl p-3 flex flex-col gap-5">
            <h1 className={`${classes.title}`}>{title}</h1>
            <h2 className={`${classes.subtitle}`}>{location}</h2>
            <span className={`text-xs px-2 py-1 rounded ${originBadge.cls}`}>
                {originBadge.text}
            </span>
            <LabeledButton ariaLabel="Go!" onClick={startQuest}></LabeledButton>
        </div>
    );
}
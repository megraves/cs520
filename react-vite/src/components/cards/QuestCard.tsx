import LabeledButton from "../buttons/LabeledButton";
import * as classes from "./card-classes";
import { useNavigate } from "react-router-dom";

type Props = {
    title: string,
    location: string,
    isVirtual?: boolean,
    questId: string,
}

export default function QuestCard({title, location, questId}: Props) {

    const navigate = useNavigate();

    const startQuest = () => {
        console.log("Go! clicked", questId);
        navigate(`/go-mode/${questId}`);
    }

    return(
        <div className="bg-white shadow rounded-xl p-3 flex flex-col gap-5">
            <h1 className={`${classes.title}`}>{title}</h1>
            <h2 className={`${classes.subtitle}`}>{location}</h2>
            <LabeledButton ariaLabel="Go!" onClick={startQuest}></LabeledButton>
        </div>
    );
}
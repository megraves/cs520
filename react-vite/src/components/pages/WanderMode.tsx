import HomeHeader from "../atoms/HomeHeader";
import Background from "../atoms/Background";
import QuestCard from "../cards/QuestCard";

export default function HomePage() {
    return (
        <Background>
            <HomeHeader></HomeHeader>
            <div className="flex flex-row w-1/2"> 
                <div className="bg-white rounded-xl w-2/3 h-screen m-20 p-5 flex flex-col gap-5">
                    <QuestCard title="Example Card" location="123 Pleasant St"></QuestCard>
                    <QuestCard title="test" location="something"></QuestCard>
                </div>
            </div>     
        </Background>
    );
};


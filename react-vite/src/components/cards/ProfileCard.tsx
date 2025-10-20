import IconButton from "../buttons/IconButton";
import ResponsiveCard from "./ResponsiveCard";
import * as classes from "./card-classes";

export default function ProfileCard() {

    const editProfile = () => {
        //TODO:
        //action for edit profile button
    }

    return (
        <div className="bg-white rounded-lg shadow ml-30 mr-30 mb-30 p-15 w-4/5 h-screen justify-center">
            <div className="flex flex-row items-center flex-wrap justify-center gap-20">
                <ResponsiveCard 
                    title="Username" 
                    className="flex flex-row justify-center p-5" 
                    button={IconButton({icon: "fa-pen-to-square fa-lg", onAction: editProfile})} //does this work?? does it make sense??
                >
                    <div>
                        <i className="fa-regular fa-circle-user fa-2xl"/>
                        
                    </div>
                </ResponsiveCard>
                <ResponsiveCard title="Inventory" className="flex flex-row flex-wrap gap-5">
                    <div>Add image chest</div>
                    <div>Add image grail</div>
                    Add labels with counts (useState)
                </ResponsiveCard>
                <ResponsiveCard title="Leaderboard">
                    <hr className={classes.divider}></hr>
                </ResponsiveCard>
            </div>
        </div>
    );
}
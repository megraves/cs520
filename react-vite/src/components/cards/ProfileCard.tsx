import IconButton from "../buttons/IconButton";
import ResponsiveCard from "./ResponsiveCard";
import * as classes from "./card-classes";

import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProfileCard() {
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState("");
    const [editing, setEditing] = useState(false);

    // Fetch current user on mount
    useEffect(() => {
        const fetchUser = async () => {
        const {data: { user }, error} = await supabase.auth.getUser();
        console.log("Fetched user:", user, "Error:", error);

        if (user) {
            setUser(user);
            setDisplayName(user.user_metadata?.full_name || "");
        }
        };

        fetchUser();
    }, []);

    // Edit profile button toggles editing mode
    const editProfile = () => {
        console.log("Edit clicked!");
        setEditing(!editing);
    };

    // Save updated profile to Supabase
    const updateProfile = async () => {
        if (!user) return;

        const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
        });

        if (error) {
        console.error("Failed to update profile:", error.message);
        return;
        }

        setEditing(false);
        alert("Profile updated!");
    };


    return (
        <div className="bg-white rounded-lg shadow ml-30 mr-30 mb-30 p-15 w-4/5 h-screen justify-center">
            <div className="flex flex-row items-center flex-wrap justify-center gap-20">
                <ResponsiveCard 
                    title="Username" 
                    className="flex flex-row justify-center p-5" 
                    button={
                        <IconButton
                            icon="fa-solid fa-pen" 
                            onAction={editProfile}
                        />
                    }
                >
                    <div>
                        <i className="fa-regular fa-circle-user fa-2xl"/>
                        {editing ? (
                            <div className="flex flex-row gap-2 items-center">
                                <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="border rounded p-1"
                                />
                                <button
                                onClick={updateProfile}
                                className="bg-blue-500 text-white px-2 py-1 rounded"
                                >
                                Save
                                </button>
                            </div>
                            ) : (
                            <span>{displayName || "Guest"}</span>
                            )}
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
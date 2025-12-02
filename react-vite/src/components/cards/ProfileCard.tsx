import IconButton from "../buttons/IconButton";
import ResponsiveCard from "./ResponsiveCard";
import * as classes from "./card-classes";

import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProfileCard() {
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState("");
    const [editing, setEditing] = useState(false);
    const [users, setUsers] = useState<{ 
        user_id: string; 
        name: string; 
        points: number;
    }[]>([]);

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
    
    useEffect(() => {
    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
        .from("leaderboard")
        .select("user_id, display_name, total_points")
        .order("total_points", { ascending: false });

        if (error) console.error("Leaderboard error:", error);
        else
        setUsers(
            (data || []).map((u) => ({
            user_id: u.user_id,
            name: u.display_name,
            points: u.total_points,
            }))
        );
    };

    fetchLeaderboard();
    }, []);



    // Edit profile button toggles editing mode
    const editProfile = () => {
        console.log("Edit clicked!");
        setEditing(!editing);
    };

    // Save updated profile to Supabase
    const updateProfile = async () => {
        if (!user) return;

        // 1. Update Auth metadata
        const { error: authError } = await supabase.auth.updateUser({
            data: { full_name: displayName },
        });

        if (authError) {
            console.error("Failed to update profile:", authError.message);
            return;
        }

        // 2. Update the leaderboard table
        const { error: leaderboardError } = await supabase
            .from("leaderboard")
            .update({ display_name: displayName }) // only update the name
            .eq("user_id", user.id); // match the row for this user

        if (leaderboardError) {
            console.error("Failed to update leaderboard:", leaderboardError.message);
            return;
        }

        setUsers((prevUsers) =>
            prevUsers.map((u) =>
                u.user_id === user.id ? { ...u, name: displayName } : u
            )
        );

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
                    <div className={classes.leaderboardContainer}>
                        {users.map((user, index) => (
                        <div key={user.user_id} className={classes.row}>
                            <span className={classes.rank}>{index + 1}.</span>
                            <span className={classes.name}>{user.name}</span>
                            <span className={classes.points}>{user.points} pts</span>
                        </div>
                        ))}
                    </div>
                </ResponsiveCard>
            </div>
        </div>
    );
}
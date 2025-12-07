// A card that shows a treasure chest upon check-in, can only claim once per event
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import LabeledButton from "../buttons/LabeledButton";
import * as classes from "../cards/card-classes";

// Based on the GoMode isChecked in bool, we can choose to display this card
type Props = {
    type: "chest" | "grail";
}

// Display claimable treasure
//  Prerequisites: 
//  (1): The user must be checked-in for this to show
//  (2): The user has not already claimed the treasure
// Must check event_checkins table for can claim
export default function TreasureCard({type}: Props) {
    
    const {questId} = useParams<{ questId: string }>();
    const [canClaim, setCanClaim] = useState<boolean | null>(null);

    const onClaim = async () => {

        const userId = await fetchUserId();
        // Update database
        const { error } = await supabase
            .from("event_checkins")
            .update({claimedTreasure: true})
            .eq("event_id", questId)
            .eq("user_id", userId);
        
        if (error) {
            console.log(`DB Error updating claimed treasure: ${error}`);
        }

        setCanClaim(false);

        // Update treasure count depending on type
        updateTreasureCount(userId);
    };

    const updateTreasureCount = async (userId: string) => {
        
        const newCount = await increment_column(userId);

        if (type == "chest") {
            const {error} = await supabase
            .from('leaderboard')
            .update({chest_count: newCount})
            .eq('user_id', userId);

            if (error) {
                console.log(`Error occurred updating chest_count: ${error}`);
            }
        } else {
            const {error} = await supabase
            .from('leaderboard')
            .update({grail_count: newCount})
            .eq('user_id', userId);

            if (error) {
                console.log(`Error occurred updating grail_count: ${error}`);
            }
        }
        
    };

    const increment_column = async (userId: string) => {

        if (type == "chest") {
            const { data , error } = await supabase
            .from("leaderboard")
            .select(`chest_count`)
            .eq("user_id", userId)
            .single();

            if (error) {
            console.log(`Error fetching chest count: ${error}`);
            } else {
                return data.chest_count + 1
            }
        } else {
            const { data , error } = await supabase
            .from("leaderboard")
            .select(`grail_count`)
            .eq("user_id", userId)
            .single();

            if (error) {
            console.log(`Error fetching grail count: ${error}`);
            } else {
                return data.grail_count + 1
            }
        }

    };

    // Get the current user's id
    const fetchUserId = async () => {
        const {data: { user }, error} = await supabase.auth.getUser();
          console.log("Fetched user:", user, "Error:", error);
    
          if (error) {
              console.log("Error fetching userid");
              return "";
          }
          else {
            return user ? user.id : "";
          }
    };

    useEffect(() => {
        const fetchCanClaim = async () => {

            const userId = await fetchUserId();

            const { data, error } = await supabase
            .from("event_checkins")
            .select("claimedTreasure")
            .eq("event_id", questId)
            .eq("user_id", userId)
            .single();

            if (error) {
                // Will happen if user is not checked in
                console.log(`Error checking if treasure claimed: ${error}`);
            } else{
                // Data is "has claimed", so if it is false, we can claim
                setCanClaim(!data.claimedTreasure);
            }
        };

        fetchCanClaim();
    }, [questId]);

    return(
        <div className="bg-white shadow p-5 rounded-xl flex flex-col items-center">
            <h1 className={classes.title}>Congratulations, you found treasure!</h1>
            {type == "chest" ? (
                <img className="w-50 h-50 object-scale-down" src="https://media.istockphoto.com/id/1224791834/vector/vector-illustration-of-many-gold-coins.jpg?s=612x612&w=0&k=20&c=MXx_vY0z-OW3mgdbXaPlfu01EG1zharaUE-XbtaxKDc=" alt="Treasure Clipart"></img>
            ) : (
                <img className="w-35 h-50 object-scale-down" src="https://media.istockphoto.com/id/153540835/vector/cartoon-illustration-of-golden-cup-on-white-surfaces.jpg?s=612x612&w=0&k=20&c=qNzZ2hWo1dA0sD-jJ99CHtRMco6gvnMStBBVuTs-BIo=" alt="Holy Grail Clipart"></img>
            )}
            <LabeledButton
                ariaLabel={canClaim ? "Claim" : "Claimed!"}
                onClick={onClaim}
                disabled={!canClaim}
                className={canClaim ? "sm:w-full" : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 sm:w-full"}
            />
        </div>
    );

}
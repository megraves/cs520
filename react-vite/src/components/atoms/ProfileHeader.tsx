import IconButton from "../buttons/IconButton";
import LabeledButton from "../buttons/LabeledButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type Props = {
  className?: string;
};

export default function ProfileHeader({ className }: Props) {
  const navigate = useNavigate();

  const returnToHome = () => {
      navigate('/home');
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (!error) {
        console.log("User signed out successfully.")
        navigate('/login');
      } else {
        console.error("Trouble logging out, try again");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={`mt-0 p-10 w-full flex flex-col md:flex-row justify-between ${className}`}>
        <IconButton icon="fa-solid fa-arrow-left fa-xl" onAction={returnToHome}></IconButton>
        <LabeledButton ariaLabel="Logout" onClick={logout}></LabeledButton>
    </div>
  );
}
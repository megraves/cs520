import IconButton from "../buttons/IconButton";
import LabeledButton from "../buttons/LabeledButton";
import { useNavigate } from "react-router-dom";
//import { supabase } from "../../lib/supabaseClient";

type Props = {
  className?: string;
};

export default function ProfileHeader({ className }: Props) {
  const navigate = useNavigate();

  const returnToHome = () => {
      navigate('/home');
  };

  const logout = () => {
    //TODO:
    //end auth session
    // navigate to login page
    // const {error} = await supabase.auth.signOut();

    // if (error != null) {
    //   navigate('/login');

    // } else {
    //   console.log("trouble logging out, try again");

    // }
  };

  return (
    <div className={`mt-0 p-10 w-full flex flex-col md:flex-row justify-between ${className}`}>
        <IconButton icon="fa-solid fa-arrow-left fa-xl" onAction={returnToHome}></IconButton>
        <LabeledButton ariaLabel="Logout" onClick={logout}></LabeledButton>
    </div>
  );
}
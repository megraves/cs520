import Background from "../atoms/Background"; // optional, same as your login page
import ResetPasswordCard from "../cards/ResetPasswordCard";

const ResetPasswordPage = () => {
  return (
    <Background>
      <div className="flex flex-col justify-center items-center h-screen">
        <ResetPasswordCard />
      </div>
    </Background>
  );
};

export default ResetPasswordPage;


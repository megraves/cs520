import IconButton from "../buttons/IconButton";
import { useNavigate } from "react-router-dom";

type Props = {
  className?: string;
};

export default function GoHeader({ className }: Props) {
  const navigate = useNavigate();

  const returnToHome = () => {
      navigate(-1)
  };

  return (
    <div className={`mt-0 p-10 w-full flex flex-col md:flex-row justify-between ${className}`}>
        <IconButton icon="fa-solid fa-arrow-left fa-xl" onAction={returnToHome}></IconButton>
    </div>
  );
}
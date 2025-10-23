import ProfileCard from "../cards/ProfileCard";
import ProfileHeader from "../atoms/ProfileHeader";
import Background from "../atoms/Background";

const Profile = () => {
    return (
        <Background className="flex flex-col flex-wrap items-center">
            <ProfileHeader></ProfileHeader>
            <ProfileCard></ProfileCard>
        </Background>
    );
};

export default Profile;
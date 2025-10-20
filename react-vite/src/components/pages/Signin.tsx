import SigninCard from "../cards/SigninCard";

const Signin = () => {
    return (
        <div className="w-full min-h-screen bg-neutral-300">
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <img src="https://www.umass.edu/sites/default/files/2023-03/UMass_Seal_Medium_PMS_202_0.png" alt="UMass Crest Logo" className="w-50 h-50"></img>
                    <h1 className="text-red-800 text-5xl font-bold">Campus Quest</h1>
                    <h1 className="text-red-800 text-2xl font-bold">discovering the treasures of UMass Amherst</h1>
                </div>
                <SigninCard></SigninCard>
            </div>
        </div>
    );
};

export default Signin
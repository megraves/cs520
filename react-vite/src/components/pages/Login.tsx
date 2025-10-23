// import { useState } from 'react';
// import { supabase } from '@lib/supabaseClient';
// import { useNavigate } from 'react-router-dom';
import Background from "../atoms/Background";
import LoginCard from "../cards/LoginCard";

function Login() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const navigate = useNavigate()

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const { error } = await supabase.auth.signInWithPassword({ email, password })
//     if (error) setError(error.message)
//     else navigate('/')
//   }

  return (
    <Background>
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="flex flex-col items-center gap-4">
                <img src="https://www.umass.edu/sites/default/files/2023-03/UMass_Seal_Medium_PMS_202_0.png" alt="UMass Crest Logo" className="w-50 h-50"></img>
                <h1 className="text-red-800 text-5xl font-bold">Campus Quest</h1>
                <h1 className="text-red-800 text-2xl font-bold">discovering the treasures of UMass Amherst</h1>
            </div>
            <LoginCard></LoginCard>
        </div>
    </Background>
  )
}

export default Login;

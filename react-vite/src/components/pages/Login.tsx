// import { useState } from 'react';
// import { supabase } from '@lib/supabaseClient';
// import { useNavigate } from 'react-router-dom';
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
    <div className="w-full min-h-screen bg-neutral-300">
      <div className="flex justify-center items-center h-screen">
        <LoginCard></LoginCard>
      </div>
    </div>
  )
}

export default Login;

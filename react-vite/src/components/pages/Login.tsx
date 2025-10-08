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
    <LoginCard></LoginCard>
  )
}

export default Login;

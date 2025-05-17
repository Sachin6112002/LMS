import axios from 'axios'
import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { setAToken } = useContext(AppContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
    if (data.success) {
      setAToken(data.token)
      localStorage.setItem('aToken', data.token)
    } else {
      toast.error(data.message)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <form onSubmit={onSubmitHandler} className='bg-white p-8 rounded shadow-md w-80'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Admin Login</h2>
        <input type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' className='w-full mb-4 p-2 border rounded' required />
        <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' className='w-full mb-6 p-2 border rounded' required />
        <button type='submit' className='w-full bg-primary text-white py-2 rounded'>Login</button>
      </form>
    </div>
  )
}

export default Login
"use client"
import { useForm } from "react-hook-form";
import Link from "next/link";
import useLogin from "../../../../hooks/useLogin";
const Login = () => {
	const { login, loading } = useLogin();
	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm();
	const onSubmit = (data) => {
		login(data.username, data.password);
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen px-4'>
			<div className='w-full max-w-md p-6 rounded-lg shadow-md bg-gray-800 bg-opacity-90'>
				<h1 className='text-3xl font-semibold text-center text-white'>
					Login<span className='text-blue-500'> ChatApp</span>
				</h1>

				<form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
					<div>
						<label className='block text-white text-sm font-medium mb-1'>Username</label>
						<input
							type='text'
							{...register("username", { required: "Username is required" })}
							placeholder='Enter username'
							className='w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
						/>
						{errors.username && <p className='text-red-500 text-sm'>{errors.username.message}</p>}
					</div>

					<div className='mt-3'>
						<label className='block text-white text-sm font-medium mb-1'>Password</label>
						<input
							type='password'
							{...register("password", { required: "Password is required" })}
							placeholder='Enter Password'
							className='w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
						/>
						{errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
					</div>

					<Link
						href="/signup"
						className='text-sm hover:underline text-blue-400 hover:text-blue-500 mt-2 inline-block'
					>
						Don't have an account?
					</Link>

					<div className='mt-4'>
						<button 
							type='submit'
							disabled={loading}
							className='w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'>
							{loading ? "Loading..." : "Login"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;

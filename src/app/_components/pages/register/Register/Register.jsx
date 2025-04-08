"use client"
import { useForm } from "react-hook-form";
import Link from "next/link";
import useSignup from "../../../../../hooks/useSignup";
const Register = () => {
	const { signup, loading } = useSignup();
	const {
		handleSubmit,
		register,
		watch,
		formState: { errors },
	} = useForm();

	const onSubmit = (data) => {
		console.log("Form submitted", data);
		signup(data);
	};

	const password = watch("password", "");

	return (
		<div className='flex flex-col items-center justify-center min-h-screen px-4'>
			<div className='w-full max-w-md p-6 rounded-lg shadow-md bg-gray-800 bg-opacity-90'>
				<h1 className='text-3xl font-semibold text-center text-white'>
					Register<span className='text-blue-500'> ChatApp</span>
				</h1>

				<form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
					<div>
						<label className='block text-white text-sm font-medium mb-1'>Name</label>
						<input
							type='text'
							{...register("fullName", { required: "Name is required" })}
							placeholder='Enter your name'
							className='w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
						/>
						{errors.fullName && <p className='text-red-500 text-sm'>{errors.fullName.message}</p>}
					</div>

					<div className='mt-3'>
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

					<div className='mt-3'>
						<label className='block text-white text-sm font-medium mb-1'>Confirm Password</label>
						<input
							type='password'
							{...register("confirm_password", {
								required: "Confirm Password is required",
								validate: (value) => value === password || "Passwords do not match",
							})}
							placeholder='Confirm Password'
							className='w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
						/>
						{errors.confirm_password && <p className='text-red-500 text-sm'>{errors.confirm_password.message}</p>}
					</div>

					{/* Gender Selection */}
					<div className='mt-3'>
						<label className='block text-white text-sm font-medium mb-1'>Gender</label>
						<div className='flex items-center gap-4'>
							<label className='flex items-center text-white'>
								<input
									type='radio'
									value='male'
									{...register("gender", { required: "Gender is required" })}
									className='mr-2'
								/>
								Male
							</label>
							<label className='flex items-center text-white'>
								<input
									type='radio'
									value='female'
									{...register("gender", { required: "Gender is required" })}
									className='mr-2'
								/>
								Female
							</label>
						</div>
						{errors.gender && <p className='text-red-500 text-sm'>{errors.gender.message}</p>}
					</div>

					<Link
						href="/login"
						className='text-sm hover:underline text-blue-400 hover:text-blue-500 mt-2 inline-block'
					>
						Already have an account?
					</Link>

					<div className='mt-4'>
						<button 
							type='submit'
							disabled={loading}
							className='w-full px-4 py-2 bg-blue-500 text-white cursor-pointer font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'>
							{loading ? "Loading..." : "Sign Up"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Register;

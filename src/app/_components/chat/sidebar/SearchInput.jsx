"use client"
import { Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { setSelectedConversation } from "../../../../redux/conversationSlice";
import { useDispatch } from "react-redux";
import useGetConversations from "../../../../hooks/useGetConversations.js";

const SearchInput = () => {
	const [search, setSearch] = useState("");

	const { conversations } = useGetConversations();
    const dispatch = useDispatch()
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!search) return;
		if (search.length < 3) {
			return toast.error("Search term must be at least 3 characters long");
		}

		const conversation = conversations.find((c) =>
			c?.fullName?.toLowerCase()?.includes(search?.toLowerCase())
		);

		if (conversation) {
			dispatch(setSelectedConversation(conversation));
			setSearch("");
		} else toast.error("No such user found!");
	};

	return (
		<form className='flex items-center gap-2 rounded-full bg-gray-100 p-2 text-slate-800 text-sm' onSubmit={handleSubmit}>
			<input
				type='text'
				placeholder='Search…'
				className='input-sm md:input outline-none w-full pl-3'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<button type='submit' className='btn md:btn-md btn-sm btn-circle text-slate-400 mr-2'>
				<Search className='w-4 h-4 md:w-6 md:h-6 outline-none' />
			</button>
		</form>
	);
};
export default SearchInput;

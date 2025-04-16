'use client';
import { Suspense } from "react";
import dynamic from "next/dynamic";
import SearchInput from "./SearchInput";
const Conversations = dynamic(() => import('./Conversations'), {
	suspense: true,
	ssr: false, // Important if it's client-only
  });
const Sidebar = () => {
	return (
		<div className='border-r border-slate-300 p-1 md:p-4 flex flex-col w-44 md:w-1/4'>
			<SearchInput />
			<div className='divider px-3' />
			<Suspense fallback={<div className='flex-1 flex items-center justify-center'>Loading...</div>}>
				<Conversations />
			</Suspense>
		</div>
	);
};
export default Sidebar;

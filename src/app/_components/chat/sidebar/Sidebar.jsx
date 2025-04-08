import Conversations from "./Conversations";
import SearchInput from "./SearchInput";

const Sidebar = () => {
	return (
		<div className='border-r border-slate-300 p-1 md:p-4 flex flex-col w-44 md:w-1/3'>
			<SearchInput />
			<div className='divider px-3' />
			<Conversations />
		</div>
	);
};
export default Sidebar;

import Sidebar from "./sidebar/Sidebar";
import MessageContainer from "./messages/MessageContainer";
export default function ChatComponent() {

  return (
    <div className='flex h-[80vh] border-1 border-slate-400 w-full md:max-w-screen-lg md:h-[650px] rounded-lg overflow-hidden bg-white bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
    <Sidebar />
    <MessageContainer />
  </div>
  );
}

import Sidebar from "./sidebar/Sidebar";
import MessageContainer from "./messages/MessageContainer";
import NotificationNavbar from "./messages/NotificationNavbar";
export default function ChatComponent() {
  return (
    <div className="w-full h-full border-1 overflow-hidden border-slate-400 backdrop-filter backdrop-blur-lg rounded-lg">
      <NotificationNavbar />
      <div className="flex h-[calc(100vh-66px)] bg-white bg-clip-padding bg-opacity-0">
        <Sidebar />
        <MessageContainer />
      </div>
    </div>
  );
}

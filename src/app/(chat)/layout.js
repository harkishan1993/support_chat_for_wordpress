
export const metadata = {
  title: "login - chat app",
  description: "chat app",
};
export default function RootLayout({ children }) {
  return (


        <div className="flex justify-between items-center flex-col h-screen">
          {children}
        </div>


  );
}
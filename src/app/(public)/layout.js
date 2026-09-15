import Navbar from "./components/Navbar";

export default function PublicLayout({ children }) {
  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <Navbar />
      {children}
    </div>
  );
}
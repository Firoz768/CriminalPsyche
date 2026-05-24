import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] relative z-[100]"> 
      {/* Absolute dark overlay to completely hide global navbar/footer behind the z-[100] layer */}
      <div className="fixed inset-0 bg-[#0a0a0a] -z-10"></div>
      
      <AdminSidebar />
      
      <div className="flex-1 ml-0 md:ml-[240px] bg-[#0a0a0a] min-h-screen relative z-10">
        {children}
      </div>
    </div>
  );
}

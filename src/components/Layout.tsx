import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabase';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Layers,
    Tag,
    Settings,
    LogOut,
    ShieldCheck // Icon for the Logo
} from 'lucide-react';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Analytics', icon: LayoutDashboard, path: '/' },
        { label: 'Orders', icon: ShoppingBag, path: '/orders' },
        { label: 'Products', icon: Package, path: '/products' },
        { label: 'Categories', icon: Layers, path: '/categories' },
        { label: 'Sub-Categories', icon: Tag, path: '/sub-categories' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-gunmetal font-sans text-bright-snow">

            {/* SIDEBAR 
        - Default width: w-20 (Icons only)
        - Hover width: w-64 (Expanded)
        - group: Allows children to react when the parent is hovered
      */}
            <aside className="fixed left-0 top-0 h-full z-30 bg-gunmetal border-r border-pale-slate/10 transition-all duration-300 ease-in-out w-20 hover:w-64 group shadow-2xl overflow-hidden flex flex-col">

                {/* LOGO AREA */}
                <div className="h-20 flex items-center px-6 border-b border-pale-slate/10 whitespace-nowrap overflow-hidden bg-gunmetal">
                    {/* Icon always visible */}
                    <div className="min-w-[2rem] flex items-center justify-center text-pale-slate">
                        <ShieldCheck size={28} />
                    </div>

                    {/* Text visible only on hover */}
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <h1 className="text-xl font-bold tracking-tight text-bright-snow">
                            Admin<span className="font-light text-slate-grey">Panel</span>
                        </h1>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                  relative flex items-center h-12 px-6 transition-all duration-200
                  ${isActive
                                        ? 'text-bright-snow bg-white/5 border-l-4 border-pale-slate shadow-[inset_10px_0_20px_-10px_rgba(255,255,255,0.1)]'
                                        : 'text-pale-slate/60 hover:text-bright-snow hover:bg-white/5 border-l-4 border-transparent'
                                    }
                `}
                            >
                                {/* Icon (Centered when collapsed) */}
                                <div className="min-w-[2rem] flex items-center justify-center">
                                    <Icon size={22} className={isActive ? 'text-pale-slate' : ''} />
                                </div>

                                {/* Label (Slides in on hover) */}
                                <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                    {item.label}
                                </span>

                                {/* Floating Tooltip (Visible ONLY when collapsed to help UX) */}
                                {/* We hide this tooltip when the sidebar is expanded (group-hover:hidden) so it doesn't clutter */}
                                <div className="absolute left-16 bg-pale-slate text-gunmetal text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:hidden hover:opacity-100 pointer-events-none transition-opacity ml-2 z-50 whitespace-nowrap">
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* LOGOUT BUTTON */}
                <div className="p-4 border-t border-pale-slate/10 bg-gunmetal">
                    <button
                        onClick={handleLogout}
                        className="flex items-center h-10 w-full rounded-xl text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors whitespace-nowrap overflow-hidden"
                    >
                        <div className="min-w-[2rem] flex items-center justify-center px-2">
                            <LogOut size={20} />
                        </div>
                        <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Sign Out
                        </span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA 
        - ml-20: Always keep a margin equal to the collapsed sidebar width (5rem / 80px)
        - This prevents the page from jumping when the sidebar expands.
        - The sidebar expands *over* the empty space on the right, floating above content if needed.
      */}
            <main className="flex-1 ml-20 p-8 min-h-screen bg-gunmetal relative transition-all duration-300">

                {/* Ambient Glow Background - Removed or made subtle grey */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-iron-grey/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}
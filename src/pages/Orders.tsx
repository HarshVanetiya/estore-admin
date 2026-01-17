import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Loader from '../components/Loader';
import {
    ShoppingBag,
    Calendar,
    User,
    ChevronLeft,
    ChevronRight,
    Search,
    Eye
} from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        setLoading(true);

        // Calculate range for pagination (0-7, 8-15, etc.)
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) console.error('Error fetching orders:', error);
        else {
            setOrders(data || []);
            setTotalOrders(count || 0);
        }
        setLoading(false);
    };

    // Helper: Status Badge Colors
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
            case 'shipped': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
            default: return 'bg-pale-slate/20 text-pale-slate border-pale-slate/30';
        }
    };

    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-bright-snow tracking-tight flex items-center gap-3">
                        <ShoppingBag className="text-platinum fill-pale-slate" />
                        Orders
                    </h2>
                    <p className="text-pale-slate mt-1 text-sm">Manage and track customer purchases.</p>
                </div>

                {/* Search Bar (Visual only for now) */}
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 text-pale-slate group-focus-within:text-bright-snow transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search order ID..."
                        className="pl-10 pr-4 py-2 bg-gunmetal/40 border border-pale-slate/20 rounded-xl text-bright-snow placeholder-pale-slate/40 focus:outline-none focus:border-pale-slate/60 focus:bg-gunmetal/60 transition-all w-64"
                    />
                </div>
            </div>

            {/* ORDERS TABLE CARD */}
            <div className="glass-card rounded-2xl overflow-hidden border border-pale-slate/10 relative min-h-[400px]">

                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gunmetal/20 backdrop-blur-sm z-10">
                        <Loader size="md" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-pale-slate opacity-60">
                        <ShoppingBag size={48} className="mb-4" />
                        <p>No orders found yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gunmetal/40 text-pale-slate/70 text-xs uppercase tracking-widest font-bold">
                                    <th className="p-5">Order ID</th>
                                    <th className="p-5">Customer</th>
                                    <th className="p-5">Date</th>
                                    <th className="p-5">Total</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pale-slate/5 text-sm">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-pale-slate/5 transition-colors group">

                                        {/* ID */}
                                        <td className="p-5 font-mono text-pale-slate group-hover:text-bright-snow transition-colors">
                                            <span className="opacity-50">#</span>{order.id.slice(0, 8)}
                                        </td>

                                        {/* Customer Info */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-iron-grey/50 flex items-center justify-center text-bright-snow font-bold text-xs border border-pale-slate/20">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-bright-snow font-medium">
                                                        {/* Access JSONB field safely */}
                                                        {order.shipping_address?.fullName || "Guest User"}
                                                    </p>
                                                    <p className="text-xs text-pale-slate/60">
                                                        {order.shipping_address?.email || "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="p-5 text-pale-slate">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="opacity-50" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="p-5 text-bright-snow font-bold tracking-wide">
                                            <div className="flex items-center gap-1">
                                                <span className="text-pale-slate/50 text-xs">₹</span>
                                                {order.total_amount?.toLocaleString()}
                                            </div>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wider shadow-sm`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-5 text-right">
                                            <button className="p-2 hover:bg-bright-snow hover:text-gunmetal rounded-lg transition-all text-pale-slate" title="View Details">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PAGINATION FOOTER */}
                <div className="p-4 border-t border-pale-slate/10 bg-gunmetal/20 flex items-center justify-between">
                    <span className="text-xs text-pale-slate">
                        Showing <span className="text-bright-snow font-bold">{orders.length}</span> of <span className="text-bright-snow font-bold">{totalOrders}</span> orders
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg bg-gunmetal/40 border border-pale-slate/10 text-bright-snow hover:bg-iron-grey disabled:opacity-30 disabled:hover:bg-gunmetal/40 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span className="text-sm font-mono text-pale-slate px-2">
                            Page {page} / {totalPages || 1}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-gunmetal/40 border border-pale-slate/10 text-bright-snow hover:bg-iron-grey disabled:opacity-30 disabled:hover:bg-gunmetal/40 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
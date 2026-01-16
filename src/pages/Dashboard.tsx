import {
    BarChart3,
    TrendingUp,
    CalendarDays,
    AlertTriangle,
    ShoppingCart,
    UserX
} from 'lucide-react';

export default function Dashboard() {

    const upcomingFeatures = [
        {
            title: "Money Makers (Pareto)",
            desc: "Identify the top 20% of products driving 80% of revenue.",
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10"
        },
        {
            title: "Sales Heatmap",
            desc: "Calendar view showing peak sales days and times for marketing.",
            icon: CalendarDays,
            color: "text-honey",
            bg: "bg-honey/10"
        },
        {
            title: "Low Stock Radar",
            desc: "Alerts for fast-moving items about to run out of stock.",
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-400/10"
        },
        {
            title: "Average Order Value (AOV)",
            desc: "Track customer spending habits to optimize bundle pricing.",
            icon: ShoppingCart,
            color: "text-air-force-blue",
            bg: "bg-air-force-blue/10"
        },
        {
            title: "Abandoned Cart Rate",
            desc: "Monitor lost potential sales and checkout drop-off points.",
            icon: UserX,
            color: "text-purple-400",
            bg: "bg-purple-400/10"
        }
    ];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-beige tracking-tight">Analytics Roadmap</h2>
                    <p className="text-ash-grey mt-2">Planned modules for store intelligence.</p>
                </div>
                <div className="px-4 py-2 bg-ink-black/50 border border-ash-grey/20 rounded-full text-xs font-mono text-ash-grey">
                    v1.0 • Data Collection Phase
                </div>
            </div>

            {/* Hero Placeholder */}
            <div className="glass-card p-8 rounded-3xl border-dashed border-2 border-ash-grey/20 flex items-center gap-6 mb-10">
                <div className="p-5 bg-dark-teal/40 rounded-2xl animate-pulse hidden md:block">
                    <BarChart3 size={40} className="text-air-force-blue" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-beige mb-2">Analytics Module Pending</h3>
                    <p className="text-ash-grey text-sm leading-relaxed max-w-2xl">
                        We are currently in the "Data Collection Phase." Once enough orders are processed,
                        this dashboard will populate with Revenue, Sales Trends, and Product Performance charts.
                    </p>
                </div>
            </div>

            {/* Future Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingFeatures.map((feature, idx) => (
                    <div
                        key={idx}
                        className="glass-card p-6 rounded-2xl border border-ash-grey/5 hover:border-ash-grey/20 transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                            <feature.icon size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-beige mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            {feature.title}
                        </h4>
                        <p className="text-sm text-ash-grey/60 group-hover:text-ash-grey/80 transition-colors">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>

        </div>
    );
}
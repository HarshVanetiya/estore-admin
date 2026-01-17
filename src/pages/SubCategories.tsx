import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Tag, Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

export default function SubCategories() {
    const [data, setData] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]); // For the Dropdown
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', category_id: '' });

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'error' as 'error' | 'success' | 'confirm',
        onConfirm: undefined as (() => void) | undefined
    });

    const showModal = (title: string, message: string, type: 'error' | 'success' | 'confirm' = 'error', onConfirm?: () => void) => {
        setModal({ isOpen: true, title, message, type, onConfirm });
    };

    // Pagination & Search
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 8;

    useEffect(() => { fetchParents(); }, []);
    useEffect(() => { fetchSubCategories(); }, [page, search]);

    // 1. Fetch Parent Categories (for the dropdown)
    const fetchParents = async () => {
        const { data } = await supabase.from('categories').select('id, name').order('name');
        setCategories(data || []);
    };

    // 2. Fetch Sub-Categories (with parent name)
    const fetchSubCategories = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('sub_categories')
                .select('*, categories(name)', { count: 'exact' }) // Join to get Parent Name
                .order('created_at', { ascending: false });

            if (search) query = query.ilike('name', `%${search}%`);

            const from = (page - 1) * itemsPerPage;
            query = query.range(from, from + itemsPerPage - 1);

            const { data, count, error } = await query;
            if (error) throw error;
            setData(data || []);
            setTotalCount(count || 0);
        } catch (err: any) { console.error(err); }
        finally { setLoading(false); }
    };

    // 3. Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                const { error } = await supabase.from('sub_categories').update(formData).eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('sub_categories').insert([formData]);
                if (error) throw error;
            }
            setIsDrawerOpen(false);
            fetchSubCategories();
        } catch (err: any) { showModal('Error', err.message, 'error'); }
        finally { setSaving(false); }
    };

    // 4. Delete
    const handleDelete = (id: string) => {
        showModal(
            'Delete Sub-Category',
            'Are you sure? This action defaults to permanent.',
            'confirm',
            async () => {
                const { error } = await supabase.from('sub_categories').delete().eq('id', id);
                if (error) showModal('Error', error.message, 'error');
                else fetchSubCategories();
            }
        );
    };

    const openDrawer = (item?: any) => {
        if (item) {
            setFormData({ name: item.name, slug: item.slug, category_id: item.category_id });
            setEditingId(item.id);
        } else {
            setFormData({ name: '', slug: '', category_id: '' });
            setEditingId(null);
        }
        setIsDrawerOpen(true);
    };

    const handleNameChange = (val: string) => {
        if (!editingId) {
            const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            setFormData({ ...formData, name: val, slug });
        } else {
            setFormData({ ...formData, name: val });
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-bright-snow flex items-center gap-3">
                        <Tag className="text-platinum fill-pale-slate" /> Sub-Categories
                    </h2>
                    <p className="text-pale-slate text-sm">Organize specifics (e.g. 'Smartphones' under 'Electronics')</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                        className="p-2 bg-gunmetal/40 border border-pale-slate/20 rounded-xl text-bright-snow focus:outline-none"
                    />
                    <button onClick={() => openDrawer()} className="px-4 py-2 bg-bright-snow text-gunmetal rounded-xl font-bold hover:bg-white flex gap-2">
                        <Plus size={20} /> New
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-pale-slate/10">
                {loading ? <div className="p-12 flex justify-center"><Loader /></div> : (
                    <table className="w-full text-left text-sm text-bright-snow">
                        <thead className="bg-gunmetal/40 text-pale-slate uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Parent Category</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pale-slate/5">
                            {data.map(item => (
                                <tr key={item.id} onClick={() => openDrawer(item)} className="hover:bg-pale-slate/5 cursor-pointer group">
                                    <td className="p-4 font-bold">{item.name}</td>
                                    <td className="p-4 text-pale-slate">
                                        <span className="bg-iron-grey/40 px-2 py-1 rounded text-xs border border-pale-slate/20">
                                            {item.categories?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-pale-slate/70">{item.slug}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 hover:bg-red-500/20 text-pale-slate hover:text-red-400 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Footer */}
            {totalCount > 0 && (
                <div className="mt-6 p-4 border border-pale-slate/10 bg-gunmetal/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-pale-slate">
                        Showing <span className="text-bright-snow font-bold">{data.length}</span> of <span className="text-bright-snow font-bold">{totalCount}</span>
                    </span>
                    <div className="flex gap-2 items-center">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg bg-gunmetal/40 border border-pale-slate/10 text-bright-snow hover:bg-iron-grey disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-mono text-pale-slate px-2">
                            {page} / {Math.ceil(totalCount / itemsPerPage) || 1}
                        </span>
                        <button
                            disabled={page >= Math.ceil(totalCount / itemsPerPage)}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-gunmetal/40 border border-pale-slate/10 text-bright-snow hover:bg-iron-grey disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Drawer */}
            {isDrawerOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
                    <div className="fixed top-0 right-0 h-full w-[400px] bg-gunmetal border-l border-pale-slate/20 z-50 p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-bright-snow mb-6">{editingId ? 'Edit' : 'New'} Sub-Category</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="text-xs font-bold text-pale-slate uppercase">Parent Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full p-3 mt-1 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow focus:border-pale-slate/50 outline-none"
                                    required
                                >
                                    <option value="">Select Parent...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-pale-slate uppercase">Name</label>
                                <input
                                    type="text" value={formData.name} onChange={e => handleNameChange(e.target.value)}
                                    className="w-full p-3 mt-1 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow focus:border-pale-slate/50 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-pale-slate uppercase">Slug</label>
                                <input
                                    type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full p-3 mt-1 bg-gunmetal border border-pale-slate/20 rounded-xl text-pale-slate font-mono text-sm focus:border-pale-slate/50 outline-none"
                                    required
                                />
                            </div>

                            <button disabled={saving} className="w-full py-3 bg-bright-snow text-gunmetal rounded-xl font-bold hover:bg-white mt-4 flex justify-center gap-2">
                                {saving && <Loader2 className="animate-spin" />} Save
                            </button>
                        </form>
                    </div>
                </>
            )}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
            />
        </div>
    );
}
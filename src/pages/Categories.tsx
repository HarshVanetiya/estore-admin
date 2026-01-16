import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import {
    Layers,
    Plus,
    Trash2,
    Search,
    X,
    Edit3,
    ChevronLeft,
    ChevronRight,
    Save,
    Loader2
} from 'lucide-react';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import ImageUpload from '../components/ImageUpload';

export default function Categories() {
    // --- STATE ---
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Search & Pagination
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 8;

    // Drawer (Slide-Over) State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null); // null = Create Mode

    // Form State
    const [formData, setFormData] = useState({ name: '', slug: '', image_url: '' });

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

    // --- EFFECTS ---
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, search]);

    // --- ACTIONS ---

    // 1. Fetch Data
    const fetchCategories = async () => {
        setLoading(true);
        try {
            // FIX: Changed 'category' to 'categories'
            let query = supabase
                .from('categories')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;
            setCategories(data || []);
            setTotalCount(count || 0);

        } catch (error: any) {
            console.error('Error fetching categories:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Form Submit (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // FIX: Changed 'category' to 'categories'
            if (editingId) {
                // UPDATE Existing
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: formData.name,
                        slug: formData.slug,
                        image_url: formData.image_url
                    })
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                // INSERT New
                const { error } = await supabase
                    .from('categories')
                    .insert([{
                        name: formData.name,
                        slug: formData.slug,
                        image_url: formData.image_url
                    }]);
                if (error) throw error;
            }

            closeDrawer();
            fetchCategories();
        } catch (error: any) {
            showModal('Error Saving', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // 3. Delete
    const handleDelete = (id: string) => {
        showModal(
            'Delete Category?',
            'Are you sure you want to delete this category? This cannot be undone.',
            'confirm',
            async () => {
                try {
                    const { error } = await supabase.from('categories').delete().eq('id', id);
                    if (error) throw error;
                    fetchCategories();
                    showModal('Success', 'Category deleted successfully', 'success');
                } catch (error: any) {
                    showModal('Error Deleting', error.message, 'error');
                }
            }
        );
    };

    // --- HELPERS ---

    const openCreateDrawer = () => {
        setFormData({ name: '', slug: '', image_url: '' });
        setEditingId(null);
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (category: any) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            image_url: category.image_url || ''
        });
        setEditingId(category.id);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setEditingId(null);
    };

    const handleNameChange = (val: string) => {
        if (!editingId) {
            const autoSlug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            setFormData({ ...formData, name: val, slug: autoSlug });
        } else {
            setFormData({ ...formData, name: val });
        }
    };

    return (
        <div className="relative min-h-screen">

            {/* --- MAIN CONTENT --- */}
            <div className="space-y-6">

                {/* Header & Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-beige tracking-tight flex items-center gap-3">
                            <Layers className="text-dark-teal fill-ash-grey" />
                            Categories
                        </h2>
                        <p className="text-ash-grey mt-1 text-sm">Manage product groups.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-3 top-2.5 text-ash-grey group-focus-within:text-beige transition-colors" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search categories..."
                                className="w-full pl-10 pr-4 py-2 bg-ink-black/40 border border-ash-grey/20 rounded-xl text-beige placeholder-ash-grey/40 focus:outline-none focus:border-ash-grey/60 focus:bg-ink-black/60 transition-all"
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={openCreateDrawer}
                            className="px-4 py-2 bg-beige text-dark-teal rounded-xl font-bold hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-beige/10"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">New Category</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="glass-card rounded-2xl overflow-hidden border border-ash-grey/10 min-h-[400px] flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader size="md" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-ash-grey opacity-60">
                            <Layers size={48} className="mb-4" />
                            <p>No categories found.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-ink-black/40 text-ash-grey/70 text-xs uppercase tracking-widest font-bold border-b border-ash-grey/10">
                                        <th className="p-4 pl-6">Name</th>
                                        <th className="p-4">Slug</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ash-grey/5 text-sm">
                                    {categories.map((cat) => (
                                        <tr
                                            key={cat.id}
                                            className="hover:bg-ash-grey/5 transition-colors group cursor-pointer"
                                            onClick={() => openEditDrawer(cat)}
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-ink-black/50 border border-ash-grey/20 overflow-hidden flex-shrink-0">
                                                        {cat.image_url ? (
                                                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-ash-grey/40">
                                                                <Layers size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-beige">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-ash-grey">{cat.slug || '-'}</td>
                                            <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditDrawer(cat)}
                                                        className="p-2 text-ash-grey hover:text-beige hover:bg-ink-black/40 rounded-lg transition-all"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-2 text-ash-grey hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Footer */}
                    {totalCount > 0 && (
                        <div className="p-4 border-t border-ash-grey/10 bg-ink-black/20 flex items-center justify-between">
                            <span className="text-xs text-ash-grey">
                                Showing <span className="text-beige font-bold">{categories.length}</span> of <span className="text-beige font-bold">{totalCount}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="p-2 rounded-lg bg-ink-black/40 border border-ash-grey/10 text-beige hover:bg-dark-teal disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm font-mono text-ash-grey px-2 my-auto">
                                    {page} / {Math.ceil(totalCount / itemsPerPage) || 1}
                                </span>
                                <button
                                    disabled={page >= Math.ceil(totalCount / itemsPerPage)}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 rounded-lg bg-ink-black/40 border border-ash-grey/10 text-beige hover:bg-dark-teal disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SLIDE-OVER DRAWER --- */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeDrawer}
            />

            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-ink-black border-l border-ash-grey/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col">

                    <div className="p-6 border-b border-ash-grey/10 flex items-center justify-between bg-dark-teal/10">
                        <h3 className="text-xl font-bold text-beige flex items-center gap-2">
                            {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                            {editingId ? 'Edit Category' : 'New Category'}
                        </h3>
                        <button onClick={closeDrawer} className="p-2 text-ash-grey hover:text-beige hover:bg-white/10 rounded-full transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto">
                        <form id="category-form" onSubmit={handleSubmit} className="space-y-6">

                            <div className="group">
                                <label className="block text-xs font-bold text-ash-grey mb-2 uppercase tracking-widest">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full p-4 bg-ink-black border border-ash-grey/20 rounded-xl text-beige focus:border-honey/50 focus:bg-white/5 outline-none transition-all"
                                    placeholder="e.g. Smart Watches"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-ash-grey mb-2 uppercase tracking-widest">URL Slug</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-4 text-ash-grey/50 font-mono">/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full pl-8 p-4 bg-ink-black border border-ash-grey/20 rounded-xl text-ash-grey font-mono text-sm focus:border-honey/50 focus:bg-white/5 outline-none transition-all"
                                        placeholder="smart-watches"
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-ash-grey/50">Used in the website address bar.</p>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-ash-grey mb-3 uppercase tracking-widest">Category Image</label>
                                <ImageUpload
                                    images={formData.image_url ? [formData.image_url] : []}
                                    setImages={(urls) => setFormData({ ...formData, image_url: urls[0] || '' })}
                                    onError={(msg) => showModal('Image Upload Error', msg, 'error')}
                                />
                            </div>

                        </form>
                    </div>

                    <div className="p-6 border-t border-ash-grey/10 bg-dark-teal/5 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="px-6 py-3 rounded-xl text-ash-grey font-medium hover:text-beige hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="category-form"
                            disabled={saving}
                            className="px-6 py-3 bg-beige text-dark-teal rounded-xl font-bold hover:bg-white transition-all shadow-lg flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {editingId ? 'Update Changes' : 'Create Category'}
                        </button>
                    </div>

                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}
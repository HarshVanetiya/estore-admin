import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Package, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import Modal from '../components/Modal';

export default function Products() {
    const [data, setData] = useState<any[]>([]);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Lists for dropdowns
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [filteredSubs, setFilteredSubs] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        title: '', slug: '', description: '', price: 0,
        discount_percent: 0, inventory: 0,
        sub_category_id: '', images: [] as string[]
    });

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
    const [selectedCatId, setSelectedCatId] = useState(''); // Helper to filter subs

    // Pagination
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        Promise.all([
            supabase.from('categories').select('id, name'),
            supabase.from('sub_categories').select('id, name, category_id')
        ]).then(([cats, subs]) => {
            setCategories(cats.data || []);
            setSubCategories(subs.data || []);
        });
    }, []);

    useEffect(() => { fetchProducts(); }, [page, search]);

    useEffect(() => {
        // Filter sub-categories when Category changes
        if (selectedCatId) {
            setFilteredSubs(subCategories.filter(s => s.category_id === selectedCatId));
        } else {
            setFilteredSubs([]);
        }
    }, [selectedCatId, subCategories]);

    const fetchProducts = async () => {

        let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (search) query = query.ilike('title', `%${search}%`);
        const from = (page - 1) * 8;
        query = query.range(from, from + 7);

        const { data, count } = await query;
        setData(data || []);
        setTotal(count || 0);

    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData };

        try {
            if (editingId) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('products').insert([payload]);
                if (error) throw error;
            }
            setIsDrawerOpen(false);
            fetchProducts();
            showModal('Success', 'Product saved successfully', 'success');
        } catch (error: any) {
            showModal('Error Saving', error.message, 'error');
        }
    };

    const openDrawer = (item?: any) => {
        if (item) {
            // Find parent category of this sub-category to set dropdown correctly
            const sub = subCategories.find(s => s.id === item.sub_category_id);
            setSelectedCatId(sub?.category_id || '');

            setFormData({
                title: item.title, slug: item.slug, description: item.description,
                price: item.price, discount_percent: item.discount_percent,
                inventory: item.inventory, sub_category_id: item.sub_category_id,
                images: item.images || []
            });
            setEditingId(item.id);
        } else {
            setFormData({
                title: '', slug: '', description: '', price: 0,
                discount_percent: 0, inventory: 0, sub_category_id: '', images: []
            });
            setSelectedCatId('');
            setEditingId(null);
        }
        setIsDrawerOpen(true);
    };

    return (
        <div className="relative min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-bright-snow flex gap-3"><Package className="text-platinum" /> Products</h2>
                <div className="flex gap-3">
                    <input type="text" placeholder="Search..." onChange={e => setSearch(e.target.value)} className="p-2 bg-gunmetal/40 border border-pale-slate/20 rounded-xl text-bright-snow" />
                    <button onClick={() => openDrawer()} className="px-4 py-2 bg-bright-snow text-gunmetal rounded-xl font-bold flex gap-2"><Plus size={20} /> New</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.map(product => (
                    <div key={product.id} onClick={() => openDrawer(product)} className="glass-card p-4 rounded-2xl group cursor-pointer hover:bg-white/5 transition-all">
                        <div className="aspect-square bg-gunmetal/50 rounded-xl mb-4 overflow-hidden relative">
                            {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover" />}
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Stock: {product.inventory}</div>
                        </div>
                        <h3 className="font-bold text-bright-snow truncate">{product.title}</h3>
                        <p className="text-pale-slate font-mono">₹{product.price}</p>
                    </div>
                ))}
            </div>

            {/* PAGINATION FOOTER */}
            {total > 0 && (
                <div className="mt-6 p-4 border border-pale-slate/10 bg-gunmetal/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-pale-slate">
                        Showing <span className="text-bright-snow font-bold">{data.length}</span> of <span className="text-bright-snow font-bold">{total}</span>
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
                            {page} / {Math.ceil(total / 8) || 1}
                        </span>
                        <button
                            disabled={page >= Math.ceil(total / 8)}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-gunmetal/40 border border-pale-slate/10 text-bright-snow hover:bg-iron-grey disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* DRAWER */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-gunmetal border-l border-pale-slate/20 h-full p-8 overflow-y-auto shadow-2xl">
                        <h2 className="text-2xl font-bold text-bright-snow mb-6">{editingId ? 'Edit Product' : 'Add Product'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-pale-slate font-bold uppercase">Title</label>
                                    <input required type="text" value={formData.title}
                                        onChange={e => {
                                            const slug = e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                            setFormData({ ...formData, title: e.target.value, slug });
                                        }}
                                        className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-pale-slate font-bold uppercase">Slug</label>
                                    <input required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-pale-slate font-mono" />
                                </div>
                            </div>

                            {/* IMAGES */}
                            <div>
                                <label className="text-xs text-pale-slate font-bold uppercase mb-2 block">Product Images</label>
                                <ImageUpload
                                    images={formData.images}
                                    setImages={(imgs) => setFormData({ ...formData, images: imgs })}
                                    onError={(msg) => showModal('Image Upload Error', msg, 'error')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-pale-slate font-bold uppercase">Category</label>
                                    <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow">
                                        <option value="">Select Category...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-pale-slate font-bold uppercase">Sub-Category</label>
                                    <select required value={formData.sub_category_id} onChange={e => setFormData({ ...formData, sub_category_id: e.target.value })} className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow" disabled={!selectedCatId}>
                                        <option value="">Select Sub-Category...</option>
                                        {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-pale-slate font-bold uppercase">Price (₹)</label>
                                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow" />
                                </div>
                                <div>
                                    <label className="text-xs text-pale-slate font-bold uppercase">Discount (%)</label>
                                    <input type="number" value={formData.discount_percent} onChange={e => setFormData({ ...formData, discount_percent: Number(e.target.value) })} className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow" />
                                </div>
                                <div>
                                    <label className="text-xs text-pale-slate font-bold uppercase">Stock</label>
                                    <input required type="number" value={formData.inventory} onChange={e => setFormData({ ...formData, inventory: Number(e.target.value) })} className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-pale-slate font-bold uppercase">Description</label>
                                <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-gunmetal border border-pale-slate/20 rounded-xl text-bright-snow" />
                            </div>

                            <button className="w-full py-4 bg-bright-snow text-gunmetal font-bold rounded-xl hover:bg-white transition-colors">Save Product</button>
                        </form>
                    </div>
                </div>
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
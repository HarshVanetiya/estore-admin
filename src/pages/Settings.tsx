import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Settings as SettingsIcon, Save, Layout, Phone, Globe, Loader2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State matching your 'company_settings' schema
    const [formData, setFormData] = useState({
        id: 1, // We force ID=1 to keep it a "Singleton" (only one settings row)
        site_name: '',
        hero_title: '',
        hero_subtitle: '',
        hero_image_url: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        all_products_image_url: '',
        products_hero_title: '',
        products_hero_subtitle: ''
    });

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'error' as 'error' | 'success' | 'confirm',
        onConfirm: undefined as (() => void) | undefined
    });

    const showModal = (title: string, message: string, type: 'error' | 'success' | 'confirm' = 'error') => {
        setModal({ isOpen: true, title, message, type, onConfirm: undefined });
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        // Fetch the first row, or default to empty if none exists
        const { data, error } = await supabase
            .from('company_settings')
            .select('*')
            .limit(1)
            .single();

        if (data) {
            setFormData(data);
        } else if (error && error.code !== 'PGRST116') {
            // PGRST116 is just "No Rows Found", which is fine for a fresh app
            console.error("Error fetching settings:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Upsert: Updates if ID=1 exists, Creates if it doesn't
        try {
            const { error } = await supabase
                .from('company_settings')
                .upsert(formData);

            if (error) throw error;
            showModal('Success', 'Settings saved successfully!', 'success');
        } catch (error: any) {
            showModal('Error Saving', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Helper to handle the ImageUpload component which expects an array
    const handleImageChange = (field: 'hero_image_url' | 'all_products_image_url') => (urls: string[]) => {
        // We only take the last uploaded image (Single Image Mode)
        const lastImage = urls[urls.length - 1];
        setFormData({ ...formData, [field]: lastImage || '' });
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-iron-grey/20 rounded-xl text-bright-snow">
                    <SettingsIcon size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-bright-snow tracking-tight">Store Settings</h2>
                    <p className="text-pale-slate mt-1">Manage global website configuration.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* SECTION 1: GENERAL INFO */}
                <div className="glass-card p-8 rounded-3xl border border-pale-slate/10">
                    <h3 className="text-xl font-bold text-bright-snow mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-platinum" /> General Identity
                    </h3>

                    <div className="group">
                        <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Website Name</label>
                        <input
                            type="text"
                            value={formData.site_name}
                            onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                            className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 focus:bg-gunmetal transition-all outline-none"
                            placeholder="e.g. My Awesome Store"
                        />
                    </div>
                </div>

                {/* SECTION 2: HERO BANNER */}
                <div className="glass-card p-8 rounded-3xl border border-pale-slate/10">
                    <h3 className="text-xl font-bold text-bright-snow mb-6 flex items-center gap-2">
                        <Layout size={20} className="text-platinum" /> Homepage Hero
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Hero Title</label>
                            <input
                                type="text"
                                value={formData.hero_title}
                                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="Summer Sale is Live!"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Subtitle</label>
                            <input
                                type="text"
                                value={formData.hero_subtitle}
                                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="Get 50% off on all electronics."
                            />
                        </div>
                    </div>

                    {/* Hero Image Upload */}
                    <div className="group mt-8">
                        <label className="block text-xs font-bold text-pale-slate mb-3 uppercase tracking-widest">Home Hero Banner</label>
                        <div className="bg-gunmetal/30 p-4 rounded-xl border border-dashed border-pale-slate/20">
                            <ImageUpload
                                images={formData.hero_image_url ? [formData.hero_image_url] : []}
                                setImages={handleImageChange('hero_image_url')}
                                onError={(msg) => showModal('Image Error', msg, 'error')}
                            />
                            <p className="text-xs text-pale-slate mt-2 ml-1 opacity-60">
                                Home page main banner (1920x600px)
                            </p>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ALL PRODUCTS HERO */}
                <div className="glass-card p-8 rounded-3xl border border-pale-slate/10">
                    <h3 className="text-xl font-bold text-bright-snow mb-6 flex items-center gap-2">
                        <Layout size={20} className="text-platinum" /> All Products Hero
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Hero Title</label>
                            <input
                                type="text"
                                value={formData.products_hero_title || ''}
                                onChange={(e) => setFormData({ ...formData, products_hero_title: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="All Products"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Hero Subtitle</label>
                            <input
                                type="text"
                                value={formData.products_hero_subtitle || ''}
                                onChange={(e) => setFormData({ ...formData, products_hero_subtitle: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="Explore our curated collection..."
                            />
                        </div>
                    </div>

                    {/* All Products Banner Upload */}
                    <div className="group mt-8">
                        <label className="block text-xs font-bold text-pale-slate mb-3 uppercase tracking-widest">All Products Banner</label>
                        <div className="bg-gunmetal/30 p-4 rounded-xl border border-dashed border-pale-slate/20">
                            <ImageUpload
                                images={formData.all_products_image_url ? [formData.all_products_image_url] : []}
                                setImages={handleImageChange('all_products_image_url')}
                                onError={(msg) => showModal('Image Error', msg, 'error')}
                            />
                            <p className="text-xs text-pale-slate mt-2 ml-1 opacity-60">
                                Default banner for product catalog (1920x400px)
                            </p>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: CONTACT INFO */}
                <div className="glass-card p-8 rounded-3xl border border-pale-slate/10">
                    <h3 className="text-xl font-bold text-bright-snow mb-6 flex items-center gap-2">
                        <Phone size={20} className="text-platinum" /> Contact Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Support Email</label>
                            <input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="support@store.com"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Phone Number</label>
                            <input
                                type="text"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Physical Address</label>
                        <textarea
                            rows={3}
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none resize-none"
                            placeholder="123 Store Street, Commerce City..."
                        />
                    </div>
                </div>

                {/* SECTION 4: SOCIAL PRESENCE */}
                <div className="glass-card p-8 rounded-3xl border border-pale-slate/10">
                    <h3 className="text-xl font-bold text-bright-snow mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-platinum" /> Social Presence
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Facebook URL</label>
                            <input
                                type="url"
                                value={formData.facebook_url || ''}
                                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">X (formerly Twitter) URL</label>
                            <input
                                type="url"
                                value={formData.twitter_url || ''}
                                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="https://x.com/yourhandle"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-pale-slate mb-2 uppercase tracking-widest">Instagram URL</label>
                            <input
                                type="url"
                                value={formData.instagram_url || ''}
                                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                                className="w-full p-4 bg-gunmetal/50 border border-pale-slate/20 rounded-xl text-bright-snow focus:border-bright-snow/50 outline-none"
                                placeholder="https://instagram.com/yourprofile"
                            />
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="sticky bottom-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-4 bg-bright-snow text-gunmetal rounded-2xl font-bold text-lg shadow-xl shadow-black/50 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                        Save Configuration
                    </button>
                </div>

            </form>


            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div >
    );
}
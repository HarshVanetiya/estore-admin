import { useState } from 'react';
import { supabase } from '../supabase';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    images: string[];
    setImages: (urls: string[]) => void;
    onError: (message: string) => void;
}

export default function ImageUpload({ images, setImages, onError }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data } = supabase.storage.from('products').getPublicUrl(filePath);

            setImages([...images, data.publicUrl]);

        } catch (error: any) {
            onError('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (urlToRemove: string) => {
        setImages(images.filter(url => url !== urlToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {images.map((url) => (
                    <div key={url} className="relative w-24 h-24 border border-ash-grey/20 rounded-lg overflow-hidden group">
                        <img src={url} alt="Product" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                <label className="w-24 h-24 border-2 border-dashed border-ash-grey/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-beige hover:bg-white/5 transition-colors">
                    {uploading ? <Loader2 className="animate-spin text-beige" /> : <Upload className="text-ash-grey" />}
                    <span className="text-xs text-ash-grey mt-2">Upload</span>
                    <input type="file" className="hidden" onChange={uploadImage} accept="image/*" disabled={uploading} />
                </label>
            </div>
        </div>
    );
}
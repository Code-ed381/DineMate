import { create } from 'zustand';
import { supabase } from './supabase';

const useAppStore = create((set) => ({
  viewMode: "card",
  setViewMode: (viewMode) => set({ viewMode }),
  
  user: null,
  profile_image: null,
  breadcrumb: localStorage.getItem('breadcrumb') || 'Dashboard',
  setProfileImage: (image) => set({ profile_image: image }),

  setBreadcrumb: (breadcrumb) => {
    localStorage.setItem('breadcrumb', breadcrumb);
    set({ breadcrumb })
  },

  setUser: (user) => set({ user }),
  resetUser: () => set({ user: null }),

  uploadFile: async (file, bucket = "avatars") => {
    if (!file) throw new Error("No file provided");

    // Clean up spaces in filename
    const safeName = file.name.replace(/\s+/g, "_");
    const filePath = `uploads/${Date.now()}_${safeName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } 
}));

export default useAppStore;
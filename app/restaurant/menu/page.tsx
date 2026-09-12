'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, X, Check, Leaf, Beef, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, type MenuItem, type Restaurant, type Category } from '@/lib/supabase';

const CUISINE_CATEGORIES = [
  'Indian',
  'Chinese',
  'South Indian',
  'North Indian',
  'Bengali',
  'Italian',
  'Mexican',
  'Thai',
  'Japanese',
  'Continental',
  'Biryani',
  'Pizza',
  'Burger',
  'Desserts',
  'Beverages',
  'Snacks',
  'Healthy',
  'Seafood',
];

export default function MenuManagement() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    is_veg: true, 
    is_available: true, 
    prep_time_min: '15',
    category: '',
    image_url: '' 
  });

  useEffect(() => {
    async function fetchData() {
      const { data: restData } = await supabase.from('restaurants').select('*').limit(1).maybeSingle();
      if (restData) {
        setRestaurant(restData as Restaurant);
        const [itemsRes, catRes] = await Promise.all([
          supabase.from('menu_items').select('*').eq('restaurant_id', (restData as Restaurant).id).order('name'),
          supabase.from('categories').select('*').order('sort_order'),
        ]);
        if (itemsRes.data) setMenuItems(itemsRes.data as MenuItem[]);
        if (catRes.data) setCategories(catRes.data as Category[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.is_available;
    await supabase.from('menu_items').update({ is_available: newStatus }).eq('id', item.id);
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: newStatus } : i)));
  };

  const updatePrice = async (item: MenuItem, price: number) => {
    await supabase.from('menu_items').update({ price }).eq('id', item.id);
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, price } : i)));
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      is_veg: true, 
      is_available: true, 
      prep_time_min: '15',
      category: '',
      image_url: '' 
    });
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      is_veg: item.is_veg,
      is_available: item.is_available,
      prep_time_min: String(item.prep_time_min),
      category: item.category_id || '',
      image_url: item.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const saveItem = async () => {
    if (!restaurant || !formData.name || !formData.price) return;
    const payload = {
      restaurant_id: restaurant.id,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      is_veg: formData.is_veg,
      is_available: formData.is_available,
      prep_time_min: parseInt(formData.prep_time_min) || 15,
      category_id: formData.category || null,
      image_url: formData.image_url || null,
    };
    if (editingItem) {
      const { data } = await supabase.from('menu_items').update(payload).eq('id', editingItem.id).select().maybeSingle();
      if (data) {
        setMenuItems((prev) => prev.map((i) => (i.id === editingItem.id ? data as MenuItem : i)));
      }
    } else {
      const { data } = await supabase.from('menu_items').insert(payload).select().maybeSingle();
      if (data) setMenuItems((prev) => [...prev, data as MenuItem]);
    }
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">{menuItems.length} items</p>
        </div>
        <Button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <span className="text-xl">🍽️</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  {item.is_veg ? <Leaf className="h-3.5 w-3.5 text-green-600" /> : <Beef className="h-3.5 w-3.5 text-red-500" />}
                  <h3 className="font-medium">{item.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    defaultValue={item.price}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val !== item.price) updatePrice(item, val);
                    }}
                    className="h-8 w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{item.is_available ? 'In Stock' : 'Out'}</span>
                  <Switch checked={item.is_available} onCheckedChange={() => toggleAvailability(item)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Item name" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Item description" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Price (₹)</label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Prep Time (min)</label>
                <Input type="number" value={formData.prep_time_min} onChange={(e) => setFormData({ ...formData, prep_time_min: e.target.value })} placeholder="15" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              <div className="mt-2 space-y-2">
                {formData.image_url && (
                  <div className="relative h-32 w-full overflow-hidden rounded-lg">
                    <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload an image for your menu item</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch checked={formData.is_veg} onCheckedChange={(v) => setFormData({ ...formData, is_veg: v })} />
                Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch checked={formData.is_available} onCheckedChange={(v) => setFormData({ ...formData, is_available: v })} />
                Available
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveItem} className="bg-orange-500 hover:bg-orange-600" disabled={uploading}>
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

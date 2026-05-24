import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit2, Trash2, AlertCircle, Clock, CheckCircle, ImagePlus, X, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { tunisiaGovernorates } from '../../data/tunisiaData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { updateCase, deleteCase, createCase, uploadFile } from '../../lib/backendApi';
import { useTranslation } from 'react-i18next';
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyAmk4IjHlJsQb8gchi-9SXxRD0vGaCsxaI";

const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "8px"
};

export function CasesManagement() {
  const { t, i18n } = useTranslation();
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [autoFilled, setAutoFilled] = useState<{ city?: boolean; governorate?: boolean }>({});

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    governorate: '',
    city: '',
    status: 'SUFFERING',
    victimName: '',
    victimPhone: '',
    victimEmail: '',
    creatorName: 'Admin',
    creatorPhone: '555-0000',
    creatorEmail: 'admin@touneshelp.tn',
    peopleAffected: 1,
    latitude: 33.8869,
    longitude: 9.5375,
    adoptingNGO: ''
  });

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cases?limit=100');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        // Sort cases by creation date (newest first)
        const sortedCases = data.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setCases(sortedCases);
      }
    } catch (e) {
      console.error('Failed to fetch cases', e);
      toast.error(t('admin.toast_fetch_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOpenCreate = () => {
    setEditingCase(null);
    setFormData({
      title: '',
      description: '',
      fullDescription: '',
      governorate: '',
      city: '',
      status: 'SUFFERING',
      victimName: '',
      victimPhone: '',
      victimEmail: '',
      creatorName: 'Admin',
      creatorPhone: '555-0000',
      creatorEmail: 'admin@touneshelp.tn',
      peopleAffected: 1,
      latitude: 33.8869,
      longitude: 9.5375,
      adoptingNGO: ''
    });
    setUploadedImages([]);
    setImagePreview([]);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCase(c);
    setFormData({
      title: c.title || '',
      description: c.description || '',
      fullDescription: c.fullDescription || '',
      governorate: c.governorate || '',
      city: c.city || '',
      status: c.status || 'SUFFERING',
      victimName: c.victimName || '',
      victimPhone: c.victimPhone || '',
      victimEmail: c.victimEmail || '',
      creatorName: c.creatorName || 'Admin',
      creatorPhone: c.creatorPhone || '',
      creatorEmail: c.creatorEmail || '',
      peopleAffected: c.peopleAffected || 1,
      latitude: c.latitude || 33.8869,
      longitude: c.longitude || 9.5375,
      adoptingNGO: c.adoptingNGO || ''
    });
    // Preload existing images for editing
    const existingImages = c.images && Array.isArray(c.images) ? c.images : [];
    setUploadedImages(existingImages);
    setImagePreview([]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.toast_delete_confirm'))) return;
    
    try {
      await deleteCase(id);
      toast.success(t('admin.toast_delete_success'));
      setCases(cases.filter(c => c.id !== id));
    } catch (error: any) {
      toast.error(error?.message || t('admin.delete_error'));
    }
  };

  // --- Image upload handlers ---
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter(f => {
      if (!validTypes.includes(f.type)) {
        toast.error(`"${f.name}" — unsupported format`);
        return false;
      }
      if (f.size > maxSize) {
        toast.error(`"${f.name}" — too large (max 5 MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Show previews immediately
    const previews = validFiles.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setImagePreview(prev => [...prev, ...previews]);

    // Upload to server
    setIsUploading(true);
    try {
      const results = await Promise.all(validFiles.map(f => uploadFile(f)));
      const urls = results.map(r => r.url);
      setUploadedImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
      // Remove previews that failed
      setImagePreview(prev => prev.filter(p => !previews.includes(p)));
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // reset so re-selecting same file works
    }
  }, [processFiles]);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isEdit = !!editingCase;

      if (isEdit) {
        await updateCase(editingCase.id, {
          ...formData,
          status: formData.status as 'SUFFERING' | 'HELPING' | 'RESOLVED',
          images: uploadedImages
        });
      } else {
        await createCase({
          ...formData,
          status: formData.status as 'SUFFERING' | 'HELPING' | 'RESOLVED',
          images: uploadedImages,
          fullDescription: formData.fullDescription || formData.description
        });
      }

      toast.success(isEdit ? t('admin.toast_save_success_edit') : t('admin.toast_save_success_create'));
      setIsDialogOpen(false);
      fetchCases();
    } catch (error: any) {
      toast.error(error?.message || t('admin.toast_save_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.governorate?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUrgencyDetails = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'SUFFERING':
        return { label: t('admin.status_suffering_detail'), color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
      case 'HELPING':
        return { label: t('admin.status_helping_detail'), color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock };
      case 'RESOLVED':
        return { label: t('admin.status_resolved_detail'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
      default:
        return { label: t('admin.status_unknown'), color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A202C]">{t('admin.case_management')}</h2>
          <p className="text-[#718096]">{t('admin.manage_cases_desc')}</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white">
          <Plus className="mr-2 h-4 w-4" /> {t('admin.create_case')}
        </Button>
      </div>

      <Card className="bg-white border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder={t('admin.search_cases_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-[#E2E8F0]"
            />
          </div>
          <div className="text-sm text-gray-500">
            {t('admin.cases_found', { count: filteredCases.length })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead className="w-[300px]">{t('admin.title_description')}</TableHead>
                <TableHead>{t('admin.location')}</TableHead>
                <TableHead>{t('admin.importance_status')}</TableHead>
                <TableHead>{t('admin.date_added')}</TableHead>
                <TableHead className="text-right">{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    {t('admin.loading_data')}
                  </TableCell>
                </TableRow>
              ) : filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    {t('admin.no_cases_found')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((c) => {
                  const urgency = getUrgencyDetails(c.status);
                  const UrgencyIcon = urgency.icon;
                  
                  return (
                    <TableRow key={c.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium text-[#1A202C]">{c.title || t('admin.title')}</div>
                        <div className="text-xs text-[#718096] truncate max-w-[280px]">
                          {c.description || t('admin.no_description', 'No description')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.governorate}</div>
                        <div className="text-xs text-gray-500">{c.city}</div>
                        {c.adoptingNGO && (
                          <div className="mt-1">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] py-0 px-1">
                              {c.adoptingNGO}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${urgency.color} flex w-fit items-center gap-1`}>
                          <UrgencyIcon size={12} />
                          {urgency.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(c.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-TN' : (i18n.language === 'fr' ? 'fr-FR' : 'en-US'), {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(c)} className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-sans" dir={i18n.dir()}>
          <DialogHeader>
            <DialogTitle>{editingCase ? t('admin.edit_case_dialog') : t('admin.create_case_dialog')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2 text-left">
                <Label>{t('admin.form_title')}</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="space-y-2 md:col-span-2 text-left">
                <Label>{t('admin.form_short_desc')}</Label>
                <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="space-y-2 md:col-span-2 text-left">
                <Label>{t('admin.form_importance_status')}</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUFFERING">{t('admin.form_status_suffering')}</SelectItem>
                    <SelectItem value="HELPING">{t('admin.form_status_helping')}</SelectItem>
                    <SelectItem value="RESOLVED">{t('admin.form_status_resolved')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Label>{t('admin.form_governorate')}</Label>
                  {autoFilled.governorate && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      ✓ {t('create_case.labels.autofilled', 'Auto-filled')}
                    </span>
                  )}
                </div>
                <Select value={formData.governorate} onValueChange={v => setFormData({...formData, governorate: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.form_select_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tunisiaGovernorates.map((gov) => (
                      <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Label>{t('admin.form_city')}</Label>
                  {autoFilled.city && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      ✓ {t('create_case.labels.autofilled', 'Auto-filled')}
                    </span>
                  )}
                </div>
                <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>

              {/* Map Selection */}
              <div className="space-y-2 md:col-span-2 text-left">
                <Label className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#1E88E5]" />
                  {t('admin.form_map_location', 'Pin Location on Map')}
                </Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{ lat: formData.latitude, lng: formData.longitude }}
                      zoom={7}
                      onClick={(e) => {
                        if (e.latLng) {
                          const lat = e.latLng.lat();
                          const lng = e.latLng.lng();
                          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                          
                          // Reverse geocode via OSM Nominatim
                          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`)
                            .then(res => res.json())
                            .then(data => {
                              if (data && data.address) {
                                let city = data.address.city || data.address.town || data.address.village || data.address.county || "";
                                let rawGov = data.address.state || data.address.region || "";
                                let governorate = "";

                                if (rawGov) {
                                  const normalized = tunisiaGovernorates.find(
                                    (g) => rawGov.toLowerCase().includes(g.toLowerCase()) || 
                                           rawGov.toLowerCase().replace(/[' -]/g, '').includes(g.toLowerCase().replace(/[' -]/g, ''))
                                  );
                                  governorate = normalized || ""; 
                                }

                                setFormData(prev => ({
                                  ...prev,
                                  city: city || prev.city,
                                  governorate: governorate || prev.governorate
                                }));
                                setAutoFilled({
                                  city: !!city,
                                  governorate: !!governorate
                                });
                              }
                            })
                            .catch(err => console.error("Geocoding failed", err));
                        }
                      }}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false
                      }}
                    >
                      <Marker 
                        position={{ lat: formData.latitude, lng: formData.longitude }} 
                        icon={{
                          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="20" cy="20" r="18" fill="#1E88E5" stroke="white" stroke-width="4"/>
                              <circle cx="20" cy="20" r="8" fill="white"/>
                            </svg>
                          `),
                          scaledSize: new google.maps.Size(32, 32),
                          anchor: new google.maps.Point(16, 32)
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center bg-gray-50 text-gray-400">
                      <Loader2 className="animate-spin mr-2" />
                      {t('admin.loading_map', 'Loading map...')}
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                  <span>{t('admin.form_map_hint', 'Click on map to change location')}</span>
                  <span>{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label>{t('admin.form_victim_name')}</Label>
                <Input required value={formData.victimName} onChange={e => setFormData({...formData, victimName: e.target.value})} />
              </div>

              <div className="space-y-2 text-left">
                <Label>{t('admin.form_victim_phone')}</Label>
                <Input required value={formData.victimPhone} onChange={e => setFormData({...formData, victimPhone: e.target.value})} />
              </div>

              <div className="space-y-2 md:col-span-2 text-left pt-2 border-t border-gray-100">
                <Label className="text-blue-600 font-semibold">{t('admin.form_adopting_ngo', 'Adopting NGO / Organization')}</Label>
                <Input 
                  placeholder={t('admin.form_adopting_ngo_placeholder', 'Enter organization name...')} 
                  value={formData.adoptingNGO} 
                  onChange={e => setFormData({...formData, adoptingNGO: e.target.value})} 
                  className="border-blue-100 focus:border-blue-400"
                />
              </div>

              {/* ---- Upload Picture ---- */}
              <div className="space-y-2 md:col-span-2 text-left pt-2 border-t border-gray-100">
                <Label className="font-semibold flex items-center gap-2">
                  <ImagePlus size={16} className="text-[#1E88E5]" />
                  {t('admin.form_upload_picture', 'Upload Pictures')}
                </Label>

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#1E88E5] bg-blue-50'
                      : 'border-gray-300 hover:border-[#1E88E5] hover:bg-gray-50'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 size={28} className="animate-spin text-[#1E88E5]" />
                  ) : (
                    <ImagePlus size={28} className="text-gray-400" />
                  )}
                  <span className="text-sm text-gray-500">
                    {isUploading
                      ? t('admin.form_uploading', 'Uploading...')
                      : t('admin.form_upload_hint', 'Click or drag images here')}
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG, WebP · {t('admin.form_upload_max', 'Max 5 MB each')}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Previews */}
                {(uploadedImages.length > 0 || imagePreview.length > 0) && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {(imagePreview.length > 0 ? imagePreview.map(p => p.url) : uploadedImages).map((url, idx) => (
                      <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className={`mt-8 pt-4 border-t border-gray-100 flex gap-3 ${i18n.dir() === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('admin.form_cancel')}</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white">
                {isSubmitting ? t('admin.form_submitting') : t('admin.form_submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

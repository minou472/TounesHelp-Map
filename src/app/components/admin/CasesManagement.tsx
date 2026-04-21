import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit2, Trash2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { tunisiaGovernorates } from '../../data/tunisiaData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function CasesManagement() {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    longitude: 9.5375
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
      toast.error('Erreur lors du chargement des cas');
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
      longitude: 9.5375
    });
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
      longitude: c.longitude || 9.5375
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cas ?')) return;
    
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('touneshelp_token')
        }
      });
      if (res.ok) {
        toast.success('Cas supprimé avec succès');
        setCases(cases.filter(c => c.id !== id));
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isEdit = !!editingCase;
      const url = isEdit 
        ? `/api/cases/${editingCase.id}`
        : `/api/cases`;
        
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('touneshelp_token')
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(isEdit ? 'Cas modifié avec succès' : 'Cas créé avec succès');
        setIsDialogOpen(false);
        fetchCases();
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
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
        return { label: 'Haute (Souffrance)', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
      case 'HELPING':
        return { label: 'Moyenne (En cours)', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock };
      case 'RESOLVED':
        return { label: 'Basse (Résolu)', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
      default:
        return { label: 'Inconnue', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A202C]">Gestion des Cas</h2>
          <p className="text-[#718096]">Gérez tous les cas signalés sur la plateforme.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white">
          <Plus className="mr-2 h-4 w-4" /> Créer un Cas
        </Button>
      </div>

      <Card className="bg-white border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Rechercher par titre ou lieu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-[#E2E8F0]"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredCases.length} cas trouvé(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead className="w-[300px]">Titre / Description</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Importance / Statut</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    Aucun cas trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((c) => {
                  const urgency = getUrgencyDetails(c.status);
                  const UrgencyIcon = urgency.icon;
                  
                  return (
                    <TableRow key={c.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium text-[#1A202C]">{c.title || 'Sans titre'}</div>
                        <div className="text-xs text-[#718096] truncate max-w-[280px]">
                          {c.description || 'Pas de description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.governorate}</div>
                        <div className="text-xs text-gray-500">{c.city}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${urgency.color} flex w-fit items-center gap-1`}>
                          <UrgencyIcon size={12} />
                          {urgency.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(c.createdAt).toLocaleDateString('fr-FR', {
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCase ? 'Modifier le Cas' : 'Créer un Nouveau Cas'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Titre du cas</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Description Courte</Label>
                <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Importance / Statut Actuel</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUFFERING">Haute Importance (Souffrance)</SelectItem>
                    <SelectItem value="HELPING">Importance Moyenne (En cours)</SelectItem>
                    <SelectItem value="RESOLVED">Faible Importance (Résolu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gouvernorat</Label>
                <Select value={formData.governorate} onValueChange={v => setFormData({...formData, governorate: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tunisiaGovernorates.map((gov) => (
                      <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Ville / Localité</Label>
                <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Nom de la Victime</Label>
                <Input required value={formData.victimName} onChange={e => setFormData({...formData, victimName: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Téléphone de la Victime</Label>
                <Input required value={formData.victimPhone} onChange={e => setFormData({...formData, victimPhone: e.target.value})} />
              </div>
            </div>

            <DialogFooter className="mt-8 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white">
                {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

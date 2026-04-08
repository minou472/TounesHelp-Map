import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { fetchAdminUsers, createUser, updateUser, deleteUser, type AdminUser, type CreateUserData, type UpdateUserData } from '../../lib/backendApi';
import { Search, UserPlus, Edit, Ban, CheckCircle, Trash2 } from 'lucide-react';

type UserRole = 'USER' | 'ADMIN';
type AccountStatus = 'ACTIVE' | 'BLOCKED';

const roleLabels: Record<UserRole, string> = {
  USER: 'Utilisateur',
  ADMIN: 'Administrateur',
};

const roleColors: Record<UserRole, string> = {
  USER: 'bg-[#718096] text-white',
  ADMIN: 'bg-[#9C27B0] text-white',
};

const statusLabels: Record<AccountStatus, string> = {
  ACTIVE: 'Actif',
  BLOCKED: 'Bloqué',
};

const statusColors: Record<AccountStatus, string> = {
  ACTIVE: 'bg-[#43A047] text-white',
  BLOCKED: 'bg-[#E53935] text-white',
};

export function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(formData as CreateUserData);
      setShowCreateForm(false);
      setFormData({});
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, formData as UpdateUserData);
      setEditingUser(null);
      setFormData({});
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBlockUser = async (user: AdminUser) => {
    try {
      await updateUser(user.id, { status: user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' });
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A202C]">Gestion des utilisateurs</h2>
          <p className="text-sm text-[#718096] mt-1">Gérer les comptes utilisateurs et leurs permissions</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#1E88E5] hover:bg-[#1976D2] text-white"
        >
          <UserPlus size={18} className="mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingUser) && (
        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <h3 className="text-lg font-semibold mb-4">
            {showCreateForm ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nom"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Téléphone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <select
              value={formData.role || 'USER'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            >
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            {!showCreateForm && (
              <select
                value={formData.status || editingUser?.status || 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AccountStatus })}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
              >
                <option value="ACTIVE">Actif</option>
                <option value="BLOCKED">Bloqué</option>
              </select>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={showCreateForm ? handleCreateUser : handleUpdateUser}
              className="bg-[#43A047] hover:bg-[#388E3C] text-white"
            >
              {showCreateForm ? 'Créer' : 'Modifier'}
            </Button>
            <Button
              onClick={() => {
                setShowCreateForm(false);
                setEditingUser(null);
                setFormData({});
              }}
              variant="outline"
            >
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 bg-white border border-[#E2E8F0]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            >
              <option value="all">Tous les rôles</option>
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'all')}
              className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            >
              <option value="all">Tous les statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="BLOCKED">Bloqué</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4 bg-white border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1E88E5&color=fff`}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-[#1A202C]">{user.name}</h3>
                  <p className="text-sm text-[#718096]">{user.email}</p>
                  <p className="text-sm text-[#718096]">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={roleColors[user.role]}>
                  {roleLabels[user.role]}
                </Badge>
                <Badge className={statusColors[user.status]}>
                  {statusLabels[user.status]}
                </Badge>
                <div className="text-sm text-[#718096]">
                  <div>Cases: {user.casesCreated || 0}</div>
                  <div>Helped: {user.helpedCount || 0}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setEditingUser(user);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      phone: user.phone,
                      role: user.role,
                      status: user.status,
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  onClick={() => handleBlockUser(user)}
                  variant="outline"
                  size="sm"
                  className={user.status === 'ACTIVE' ? 'text-[#E53935]' : 'text-[#43A047]'}
                >
                  {user.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                </Button>
                <Button
                  onClick={() => handleDeleteUser(user.id)}
                  variant="outline"
                  size="sm"
                  className="text-[#E53935]"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">
                  Date d'inscription
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A202C]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F5F7FA]/30'} hover:bg-[#E3F2FD] transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-[#1A202C]">{user.name}</div>
                        <div className="text-xs text-[#718096]">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#1A202C]">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#1A202C] font-medium">{user.casesSubmitted}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[user.status]}>
                      {statusLabels[user.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#718096]">
                      {user.joinDate.toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye size={14} className="mr-1" />
                        Voir
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Edit size={14} className="mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs ${
                          user.status === 'suspended'
                            ? 'text-[#43A047] border-[#43A047] hover:bg-[#43A047] hover:text-white'
                            : 'text-[#E53935] border-[#E53935] hover:bg-[#E53935] hover:text-white'
                        }`}
                      >
                        <Ban size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto text-[#718096] mb-3" width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <h3 className="text-lg font-medium text-[#1A202C] mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-sm text-[#718096]">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#718096]">
            Affichage de {filteredUsers.length} utilisateur(s)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Précédent
            </Button>
            <Button variant="outline" size="sm" className="bg-[#1E88E5] text-white border-[#1E88E5]">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

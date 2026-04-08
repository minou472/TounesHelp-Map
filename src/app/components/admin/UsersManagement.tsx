import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockUsers } from '../../data/tunisiaData';
import { Search, UserPlus, Eye, Edit, Ban, CheckCircle, XCircle, Filter } from 'lucide-react';

type UserRole = 'user' | 'contact' | 'org' | 'admin';
type AccountStatus = 'active' | 'suspended' | 'pending';

const roleLabels: Record<UserRole, string> = {
  user: 'Utilisateur',
  contact: 'Contact de cas',
  org: 'Organisation',
  admin: 'Administrateur',
};

const roleColors: Record<UserRole, string> = {
  user: 'bg-[#718096] text-white',
  contact: 'bg-[#1E88E5] text-white',
  org: 'bg-[#43A047] text-white',
  admin: 'bg-[#9C27B0] text-white',
};

const statusLabels: Record<AccountStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  pending: 'En attente',
};

const statusColors: Record<AccountStatus, string> = {
  active: 'bg-[#43A047] text-white',
  suspended: 'bg-[#E53935] text-white',
  pending: 'bg-[#FF9800] text-white',
};

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');

  // Extended user data with additional fields
  const enhancedUsers = mockUsers.map((user, index) => ({
    ...user,
    role: (['user', 'contact', 'org', 'admin'] as UserRole[])[index % 4],
    status: (['active', 'suspended', 'pending'] as AccountStatus[])[index % 3],
    casesSubmitted: Math.floor(Math.random() * 10),
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1E88E5&color=fff`,
  }));

  const filteredUsers = enhancedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A202C]">Gestion des utilisateurs</h2>
          <p className="text-sm text-[#718096] mt-1">Gérer les comptes utilisateurs et leurs permissions</p>
        </div>
        <Button className="bg-[#1E88E5] hover:bg-[#1976D2] text-white">
          <UserPlus size={18} className="mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

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
              <option value="user">Utilisateur</option>
              <option value="contact">Contact de cas</option>
              <option value="org">Organisation</option>
              <option value="admin">Administrateur</option>
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
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
              <svg className="text-[#1E88E5]" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#718096]">Total</p>
              <p className="text-xl font-bold text-[#1A202C]">{enhancedUsers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center">
              <CheckCircle className="text-[#43A047]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[#718096]">Actifs</p>
              <p className="text-xl font-bold text-[#1A202C]">
                {enhancedUsers.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
              <svg className="text-[#FF9800]" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#718096]">En attente</p>
              <p className="text-xl font-bold text-[#1A202C]">
                {enhancedUsers.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCE4EC] rounded-lg flex items-center justify-center">
              <XCircle className="text-[#E53935]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[#718096]">Suspendus</p>
              <p className="text-xl font-bold text-[#1A202C]">
                {enhancedUsers.filter(u => u.status === 'suspended').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F7FA] border-b border-[#E2E8F0]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">
                  Utilisateur
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">
                  Rôle
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">
                  Cas soumis
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A202C]">
                  Statut
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

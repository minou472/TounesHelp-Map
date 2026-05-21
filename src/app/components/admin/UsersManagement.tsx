import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { fetchAdminUsers, fetchAdminUserById, createUser, updateUser, deleteUser, type AdminUser, type CreateUserData, type UpdateUserData } from '../../lib/backendApi';
import { Search, UserPlus, Edit, Ban, CheckCircle, Trash2, X, Loader2, AlertTriangle, ChevronDown, ChevronUp, FileText, Calendar, Mail, Phone as PhoneIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type UserRole = 'USER' | 'ADMIN';
type AccountStatus = 'ACTIVE' | 'BLOCKED';

const roleColors: Record<UserRole, string> = {
  USER: 'bg-[#64748B] text-white',
  ADMIN: 'bg-[#7C3AED] text-white',
};

const statusColors: Record<AccountStatus, string> = {
  ACTIVE: 'bg-[#16A34A] text-white',
  BLOCKED: 'bg-[#DC2626] text-white',
};

const userTypeColors: Record<string, string> = {
  VOLUNTEER: 'bg-[#0D9488] text-white',
  ORGANIZATION: 'bg-[#4F46E5] text-white',
  OTHER: 'bg-[#475569] text-white',
  CITIZEN: 'bg-[#0EA5E9] text-white',
};

export function UsersManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminUsers();
      // Handle both { users: [], total } and direct array responses
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray((data as any).users)) {
        setUsers((data as any).users);
      } else if (data && Array.isArray((data as any))) {
        setUsers(data as any);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }
    try {
      setActionLoading('create');
      setError(null);
      await createUser(formData as CreateUserData);
      setShowCreateModal(false);
      setFormData({});
      setSuccessMsg(t('admin.user_created_success'));
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      setActionLoading('update');
      setError(null);
      await updateUser(editingUser.id, formData as UpdateUserData);
      setEditingUser(null);
      setFormData({});
      setSuccessMsg(t('admin.user_updated_success'));
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${t('admin.delete_user_confirm')} "${userName}"?`)) return;
    try {
      setActionLoading(userId);
      await deleteUser(userId);
      setSuccessMsg(t('admin.user_deleted_success'));
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockUser = async (user: AdminUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      setActionLoading(user.id);
      await updateUser(user.id, { status: newStatus });
      setSuccessMsg(newStatus === 'BLOCKED' ? t('admin.user_blocked') : t('admin.user_unblocked'));
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUserDrawer = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);
    
    // Fetch details if not already loaded or to refresh
    if (!userDetails[userId]) {
      try {
        setLoadingDetails(userId);
        const data = await fetchAdminUserById(userId);
        setUserDetails(prev => ({ ...prev, [userId]: data }));
      } catch (err: any) {
        console.error('Failed to load user details:', err);
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A202C]">{t('admin.user_management')}</h2>
          <p className="text-sm text-[#718096] mt-1">{t('admin.user_management_desc')}</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateModal(true);
            setFormData({ role: 'USER' });
            setError(null);
          }}
          className="bg-[#1E88E5] hover:bg-[#1565C0] text-white gap-2"
        >
          <UserPlus size={18} />
          {t('admin.add_user')}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-[#E8F5E9] border border-[#43A047] text-[#2E7D32] px-4 py-3 rounded-lg text-sm animate-in fade-in">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#E53935] text-[#C62828] px-4 py-3 rounded-lg text-sm">
          <AlertTriangle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingUser) && (
        <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#1A202C]">
              {showCreateModal ? t('admin.create_user') : t('admin.edit_user')}
            </h3>
            <button
              onClick={() => { setShowCreateModal(false); setEditingUser(null); setFormData({}); setError(null); }}
              className="text-[#718096] hover:text-[#1A202C] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1">{t('admin.user_name')} *</label>
              <Input
                placeholder="Ex: Ahmed Ben Ali"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1">{t('admin.user_email')} *</label>
              <Input
                placeholder="user@example.com"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1">{t('admin.user_phone')}</label>
              <Input
                placeholder="+216 XX XXX XXX"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A5568] mb-1">{t('admin.user_role')}</label>
              <select
                value={formData.role || 'USER'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] bg-white"
              >
                <option value="USER">{t('admin.role_user')}</option>
                <option value="ADMIN">{t('admin.role_admin')}</option>
              </select>
            </div>
            {editingUser && (
              <div>
                <label className="block text-sm font-medium text-[#4A5568] mb-1">{t('admin.user_status_label')}</label>
                <select
                  value={formData.status || editingUser?.status || 'ACTIVE'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AccountStatus })}
                  className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] bg-white"
                >
                  <option value="ACTIVE">{t('admin.status_active')}</option>
                  <option value="BLOCKED">{t('admin.status_blocked')}</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={showCreateModal ? handleCreateUser : handleUpdateUser}
              className="bg-[#1E88E5] hover:bg-[#1565C0] text-white gap-2"
              disabled={actionLoading === 'create' || actionLoading === 'update'}
            >
              {(actionLoading === 'create' || actionLoading === 'update') && <Loader2 size={16} className="animate-spin" />}
              {showCreateModal ? t('admin.create_btn') : t('admin.save_btn')}
            </Button>
            <Button
              onClick={() => { setShowCreateModal(false); setEditingUser(null); setFormData({}); setError(null); }}
              variant="outline"
            >
              {t('admin.cancel_btn')}
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 bg-white border border-[#E2E8F0] rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.search_users')}
              className="w-full pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] bg-white"
          >
            <option value="all">{t('admin.all_roles')}</option>
            <option value="USER">{t('admin.role_user')}</option>
            <option value="ADMIN">{t('admin.role_admin')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'all')}
            className="w-full h-10 px-3 border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] bg-white"
          >
            <option value="all">{t('admin.all_statuses')}</option>
            <option value="ACTIVE">{t('admin.status_active')}</option>
            <option value="BLOCKED">{t('admin.status_blocked')}</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[#718096]">
            <Loader2 size={24} className="animate-spin" />
            <span>{t('admin.loading')}</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#F5F7FA] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-[#718096]" />
            </div>
            <h3 className="text-lg font-medium text-[#1A202C] mb-2">{t('admin.no_users_found')}</h3>
            <p className="text-sm text-[#718096]">{t('admin.try_different_filters')}</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <p className="text-sm text-[#718096]">
                {t('admin.showing_users', { count: filteredUsers.length, total: users.length })}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="text-center px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">{t('admin.user_type_label')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">{t('admin.user_name')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">{t('admin.user_email')}</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">{t('admin.user_role')}</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">{t('admin.user_status_label')}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">{t('admin.user_joined')}</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredUsers.map((user, idx) => (
                    <>
                      <tr
                        key={user.id}
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'} hover:bg-[#E3F2FD]/40 transition-colors cursor-pointer group ${expandedUserId === user.id ? 'bg-[#E3F2FD]/20' : ''}`}
                        onClick={() => toggleUserDrawer(user.id)}
                      >
                      <td className="px-6 py-4 text-center">
                        {(user.userType && user.userType !== 'CITIZEN') ? (
                          <Badge className={`${userTypeColors[user.userType]} text-xs whitespace-nowrap`}>
                            {t(`admin.user_type_${user.userType.toLowerCase()}`)}
                          </Badge>
                        ) : (
                          <span className="text-[#A0AEC0] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#7C3AED] text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {(user.name || '?')[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-[#1A202C] text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4A5568]">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={`${roleColors[user.role]} text-xs`}>
                          {user.role === 'ADMIN' ? t('admin.role_admin') : t('admin.role_user')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={`${statusColors[user.status]} text-xs`}>
                          {user.status === 'ACTIVE' ? t('admin.status_active') : t('admin.status_blocked')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#718096]">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setFormData({
                                name: user.name,
                                email: user.email,
                                phone: user.phone || '',
                                role: user.role,
                                status: user.status,
                              });
                              setError(null);
                            }}
                            className="p-2 rounded-md text-[#718096] hover:text-[#1E88E5] hover:bg-[#E3F2FD] transition-colors"
                            title={t('admin.edit_user')}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleBlockUser(user)}
                            disabled={actionLoading === user.id}
                            className={`p-2 rounded-md transition-colors ${
                              user.status === 'ACTIVE'
                                ? 'text-[#718096] hover:text-[#E53935] hover:bg-[#FFEBEE]'
                                : 'text-[#718096] hover:text-[#43A047] hover:bg-[#E8F5E9]'
                            }`}
                            title={user.status === 'ACTIVE' ? t('admin.block_user') : t('admin.unblock_user')}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : user.status === 'ACTIVE' ? (
                              <Ban size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.name); }}
                            disabled={actionLoading === user.id}
                            className="p-2 rounded-md text-[#718096] hover:text-[#E53935] hover:bg-[#FFEBEE] transition-colors"
                            title={t('admin.delete_user')}
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="ml-2 text-[#CBD5E0] group-hover:text-[#1E88E5] transition-colors">
                            {expandedUserId === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Detail Drawer */}
                    {expandedUserId === user.id && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={7} className="px-6 py-6 border-b border-[#E2E8F0]">
                          {loadingDetails === user.id ? (
                            <div className="flex items-center gap-3 text-[#718096] py-4">
                              <Loader2 size={20} className="animate-spin" />
                              <span className="text-sm">{t('admin.loading_details')}</span>
                            </div>
                          ) : (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                              <div className="flex flex-wrap gap-8">
                                {/* Left Side: User Summary */}
                                <div className="space-y-4 min-w-[200px]">
                                  <h4 className="font-bold text-[#2D3748] flex items-center gap-2">
                                    <FileText size={16} />
                                    {t('admin.case_history')}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-sm">
                                      <p className="text-[10px] uppercase font-bold text-[#A0AEC0] mb-1">{t('admin.total_cases')}</p>
                                      <p className="text-xl font-bold text-[#1E88E5]">{userDetails[user.id]?.createdCases?.length || 0}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-sm">
                                      <p className="text-[10px] uppercase font-bold text-[#A0AEC0] mb-1">{t('admin.status_resolved')}</p>
                                      <p className="text-xl font-bold text-[#16A34A]">
                                        {userDetails[user.id]?.createdCases?.filter((c: any) => c.status === 'RESOLVED').length || 0}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side: Cases List */}
                                <div className="flex-1 min-w-[300px]">
                                  {userDetails[user.id]?.createdCases && userDetails[user.id].createdCases.length > 0 ? (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                      {userDetails[user.id].createdCases.map((c: any) => (
                                        <div key={c.id} className="flex items-center justify-between p-3 bg-white hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] transition-colors">
                                          <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[#2D3748]">{c.title}</span>
                                            <span className="text-[11px] text-[#A0AEC0]">{formatDate(c.createdAt)}</span>
                                          </div>
                                          <Badge className={`text-[10px] ${
                                            c.status === 'SUFFERING' ? 'bg-[#FEE2E2] text-[#EF4444]' :
                                            c.status === 'HELPING' ? 'bg-[#FEF3C7] text-[#D97706]' :
                                            'bg-[#DCFCE7] text-[#16A34A]'
                                          }`}>
                                            {t(`admin.status_${c.status.toLowerCase()}`)}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-full flex items-center justify-center border-2 border-dashed border-[#E2E8F0] rounded-xl p-8">
                                      <p className="text-sm text-[#718096] italic">{t('admin.no_cases_found_for_user')}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

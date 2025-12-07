import { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Check,
  UserCheck,
  Search
} from "lucide-react";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "../hook/useRoles";
import { usePermissionsList, useCreatePermission, useUpdatePermission, useDeletePermission } from "../hook/usePermissionsList";
import { useAdminAccounts, useAdminRoles, useAssignRolesToAdmin } from "../hook/useAdminAccounts";
import { toast } from "react-toastify";

const Permissions = () => {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions" | "admin-roles">("roles");
  
  // Roles
  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permission_ids: [] as number[] });
  
  // Permissions
  const { data: permissions, isLoading: permsLoading, refetch: refetchPermissions } = usePermissionsList();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();
  const [editingPermission, setEditingPermission] = useState<number | null>(null);
  const [permissionForm, setPermissionForm] = useState({ code: "", name: "", module: "" });
  
  // Admin Roles
  const { data: adminAccounts, isLoading: adminsLoading } = useAdminAccounts();
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const { data: adminRolesData } = useAdminRoles(selectedAdminId || undefined);
  const assignRoles = useAssignRolesToAdmin();
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

  // Handle Roles
  const handleCreateRole = async () => {
    try {
      await createRole.mutateAsync(roleForm);
      toast.success("Tạo role thành công!");
      setRoleForm({ name: "", description: "", permission_ids: [] });
      refetchRoles();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo role");
    }
  };

  const handleUpdateRole = async (id: number) => {
    try {
      await updateRole.mutateAsync({ id, ...roleForm });
      toast.success("Cập nhật role thành công!");
      setEditingRole(null);
      setRoleForm({ name: "", description: "", permission_ids: [] });
      refetchRoles();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật role");
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa role này?")) return;
    try {
      await deleteRole.mutateAsync(id);
      toast.success("Xóa role thành công!");
      refetchRoles();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa role");
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role.id);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      permission_ids: role.permissions?.map((p: any) => p.id) || [],
    });
  };

  // Handle Permissions
  const handleCreatePermission = async () => {
    try {
      await createPermission.mutateAsync(permissionForm);
      toast.success("Tạo permission thành công!");
      setPermissionForm({ code: "", name: "", module: "" });
      refetchPermissions();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo permission");
    }
  };

  const handleUpdatePermission = async (id: number) => {
    try {
      await updatePermission.mutateAsync({ id, ...permissionForm });
      toast.success("Cập nhật permission thành công!");
      setEditingPermission(null);
      setPermissionForm({ code: "", name: "", module: "" });
      refetchPermissions();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật permission");
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa permission này?")) return;
    try {
      await deletePermission.mutateAsync(id);
      toast.success("Xóa permission thành công!");
      refetchPermissions();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa permission");
    }
  };

  const handleEditPermission = (permission: any) => {
    setEditingPermission(permission.id);
    setPermissionForm({
      code: permission.code,
      name: permission.name,
      module: permission.module || "",
    });
  };

  // Handle Admin Roles
  const handleSelectAdmin = (adminId: number) => {
    setSelectedAdminId(adminId);
    // Reset selected roles, will be updated by useEffect when adminRolesData loads
    setSelectedRoleIds([]);
  };

  // Update selectedRoleIds when adminRolesData changes
  useEffect(() => {
    if (selectedAdminId && adminRolesData) {
      const currentRoleIds = adminRolesData.map((r: any) => r.id) || [];
      setSelectedRoleIds(currentRoleIds);
    }
  }, [selectedAdminId, adminRolesData]);

  const handleAssignRoles = async () => {
    if (!selectedAdminId) return;
    try {
      await assignRoles.mutateAsync({ adminId: selectedAdminId, role_ids: selectedRoleIds });
      toast.success("Gán roles thành công!");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi gán roles");
    }
  };

  const togglePermission = (permissionId: number) => {
    setRoleForm(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Filter admin accounts based on search term
  const filteredAdminAccounts = adminAccounts?.filter((admin) => {
    const searchLower = adminSearchTerm.toLowerCase();
    return (
      admin.username.toLowerCase().includes(searchLower) ||
      admin.employee?.name?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Group permissions by module
  const permissionsByModule = (permissions || []).reduce((acc: any, perm: any) => {
    const module = perm.module || "Other";
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý phân quyền</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("roles")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "roles"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Shield className="inline mr-2" size={18} />
            Quản lý Roles
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "permissions"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Key className="inline mr-2" size={18} />
            Quản lý Permissions
          </button>
          <button
            onClick={() => setActiveTab("admin-roles")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "admin-roles"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <UserCheck className="inline mr-2" size={18} />
            Gán Roles cho Admin
          </button>
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          {/* Create Role Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tạo Role mới</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Role *
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Sales Staff"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mô tả role"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                {Object.entries(permissionsByModule).map(([module, perms]: [string, any]) => (
                  <div key={module} className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">{module}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {perms.map((perm: any) => (
                        <label key={perm.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={roleForm.permission_ids.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreateRole}
                disabled={!roleForm.name || createRole.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                Tạo Role
              </button>
              {editingRole && (
                <>
                  <button
                    onClick={() => handleUpdateRole(editingRole)}
                    disabled={updateRole.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditingRole(null);
                      setRoleForm({ name: "", description: "", permission_ids: [] });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                  >
                    <X size={18} />
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Roles List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Danh sách Roles</h2>
            </div>
            {rolesLoading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles?.map((role) => (
                      <tr key={role.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {role.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {role.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {role.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {role.permissions?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          {/* Create Permission Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tạo Permission mới</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={permissionForm.code}
                  onChange={(e) => setPermissionForm({ ...permissionForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: product:read"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên *
                </label>
                <input
                  type="text"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Xem sản phẩm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <input
                  type="text"
                  value={permissionForm.module}
                  onChange={(e) => setPermissionForm({ ...permissionForm, module: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: product"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreatePermission}
                disabled={!permissionForm.code || !permissionForm.name || createPermission.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                Tạo Permission
              </button>
              {editingPermission && (
                <>
                  <button
                    onClick={() => handleUpdatePermission(editingPermission)}
                    disabled={updatePermission.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditingPermission(null);
                      setPermissionForm({ code: "", name: "", module: "" });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                  >
                    <X size={18} />
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Permissions List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Danh sách Permissions</h2>
            </div>
            {permsLoading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permissions?.map((perm) => (
                      <tr key={perm.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perm.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {perm.code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {perm.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {perm.module || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditPermission(perm)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletePermission(perm.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Roles Tab */}
      {activeTab === "admin-roles" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Danh sách Admin</h2>
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo username hoặc tên..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              {adminsLoading ? (
                <div className="p-8 text-center text-gray-500">Đang tải...</div>
              ) : filteredAdminAccounts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {adminSearchTerm ? "Không tìm thấy admin nào" : "Không có admin nào"}
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-200">
                  {filteredAdminAccounts.map((admin) => (
                    <button
                      key={admin.id}
                      onClick={() => handleSelectAdmin(admin.id)}
                      className={`w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedAdminId === admin.id ? "bg-indigo-50 border-l-4 border-indigo-600" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{admin.username}</p>
                          <p className="text-sm text-gray-500">{admin.employee?.name || "N/A"}</p>
                        </div>
                        {selectedAdminId === admin.id && (
                          <Check className="text-indigo-600" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Roles Assignment */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Gán Roles</h2>
              </div>
              {selectedAdminId ? (
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Chọn roles để gán cho admin:{" "}
                      <span className="font-medium">
                        {adminAccounts?.find(a => a.id === selectedAdminId)?.username}
                      </span>
                    </p>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {roles?.map((role) => (
                        <label
                          key={role.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(role.id)}
                            onChange={() => toggleRole(role.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{role.name}</p>
                            <p className="text-sm text-gray-500">{role.description || "-"}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {role.permissions?.length || 0} permissions
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAssignRoles}
                    disabled={assignRoles.isPending}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {assignRoles.isPending ? "Đang lưu..." : "Lưu Roles"}
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Chọn một admin để gán roles
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;


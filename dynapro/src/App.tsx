import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Project,
  TrainingGroup,
  TrainingCenter,
  Department,
  City,
  ActivityLog,
  ActiveView
} from './types';
import {
  getDbStatus,
  reconnectDb,
  fetchProjects,
  apiCreateProject,
  apiUpdateProject,
  apiDeleteProject,
  apiUpdateProjectStatus,
  fetchUsers,
  apiCreateUser,
  apiUpdateUser,
  apiToggleUserStatus,
  apiDeleteUser,
  fetchGroups,
  apiCreateGroup,
  apiUpdateGroup,
  apiToggleGroupStatus,
  apiDeleteGroup,
  fetchCenters,
  apiCreateCenter,
  apiUpdateCenter,
  apiDeleteCenter,
  fetchDepartments,
  fetchCities,
  fetchActivityLogs,
  apiCreateActivityLog,
  apiLogin,
  getSessionUser,
  setSessionUser,
  DbStatusInfo
} from './services/api';

// Layout Components
import { SideNavBar } from './components/layout/SideNavBar';
import { TopNavBar } from './components/layout/TopNavBar';
import { Footer } from './components/layout/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';

// Auth Views
import { LoginView } from './components/auth/LoginView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';

// Dashboard & Project Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsBankView } from './components/projects/ProjectsBankView';
import { NewProjectView } from './components/projects/NewProjectView';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';

// User Views
import { UsersListView } from './components/users/UsersListView';
import { UserFormView } from './components/users/UserFormView';
import { ProfileView } from './components/profile/ProfileView';

// Master Data & Audit Views
import { GroupsListView } from './components/groups/GroupsListView';
import { GroupFormView } from './components/groups/GroupFormView';
import { CentersListView } from './components/centers/CentersListView';
import { CenterFormView } from './components/centers/CenterFormView';
import { ActivityLogView } from './components/masterData/ActivityLogView';

// Support Views
import {
  AboutView,
  PrivacyView,
  TermsView,
  FaqView,
  CaseStudiesView
} from './components/support/SupportViews';

export const App: React.FC = () => {
  // Session & Navigation State
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getSessionUser());
  const [activeView, setActiveView] = useState<ActiveView>(() => (getSessionUser() ? 'dashboard' : 'login'));
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);

  // Entities loaded from MySQL Database
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Modals and Edit targets
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingGroup, setEditingGroup] = useState<TrainingGroup | null>(null);
  const [editingCenter, setEditingCenter] = useState<TrainingCenter | null>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all data from Supabase backend
  const loadAllData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const [
        loadedProjects,
        loadedUsers,
        loadedGroups,
        loadedCenters,
        loadedDepts,
        loadedCities,
        loadedLogs,
        statusInfo
      ] = await Promise.all([
        fetchProjects(),
        fetchUsers(),
        fetchGroups(),
        fetchCenters(),
        fetchDepartments(),
        fetchCities(),
        fetchActivityLogs(),
        getDbStatus()
      ]);

      setProjects(loadedProjects);
      setUsers(loadedUsers);
      setGroups(loadedGroups);
      setCenters(loadedCenters);
      setDepartments(loadedDepts);
      setCities(loadedCities);
      setActivityLogs(loadedLogs);
      setDbStatus(statusInfo);

      // If currentUser is stored in session, refresh their record from the fresh user list
      const sessionUser = getSessionUser();
      if (sessionUser) {
        const matched = loadedUsers.find((u) => u.id === sessionUser.id);
        if (matched && matched.status === 'Activo') {
          setCurrentUserState(matched);
          setSessionUser(matched);
        } else {
          // If the user was removed, deactivated, or not found in the DB, invalidate session
          setCurrentUserState(null);
          setSessionUser(null);
          setActiveView('login');
        }
      } else {
        setCurrentUserState(null);
        setActiveView((prev) =>
          prev === 'forgot-password' || prev === 'faq' || prev === 'privacy' || prev === 'terms'
            ? prev
            : 'login'
        );
      }
    } catch (err: any) {
      console.error('Error loading data from Supabase API:', err);
      addToast(
        'error',
        'Error de Conexión',
        `No se pudo cargar la información desde el servidor: ${err.message}`
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // RBAC View Guard: If non-admin attempts to view admin-only sections, redirect to 'projects'
  useEffect(() => {
    const adminOnlyViews: ActiveView[] = [
      'users',
      'new-user',
      'edit-user',
      'centers',
      'new-center',
      'edit-center',
      'activity-log'
    ];
    if (currentUser && currentUser.role !== 'ADMINISTRADOR' && adminOnlyViews.includes(activeView)) {
      setActiveView('projects');
    }
  }, [currentUser, activeView]);

  // Reconnect / Refresh DB handler
  const handleReconnectDb = async () => {
    try {
      const res = await reconnectDb();
      setDbStatus(res.status);
      await loadAllData();
      addToast(
        res.success ? 'success' : 'info',
        'Estado Supabase Actualizado',
        res.success
          ? 'Conexión exitosa con la base de datos Supabase.'
          : 'Se sincronizó el almacenamiento.'
      );
    } catch (err: any) {
      addToast('error', 'Fallo de Reconexión', err.message);
    }
  };

  // -------------------------------------------------------------
  // AUTH OPERATIONS
  // -------------------------------------------------------------
  const handleLogin = async (email: string, password: string) => {
    try {
      const loginRes = await apiLogin(email, password);
      if (loginRes.success) {
        setCurrentUserState(loginRes.user);
        setSessionUser(loginRes.user);
        setActiveView('dashboard');
        addToast(
          'success',
          '¡Bienvenido a DynaPro!',
          `Sesión iniciada como ${loginRes.user.full_name} (${loginRes.user.role}).`
        );
        // Refresh logs
        const updatedLogs = await fetchActivityLogs();
        setActivityLogs(updatedLogs);
      }
    } catch (err: any) {
      addToast('error', 'Error de Autenticación', err.message);
      throw err;
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Cierre de Sesión',
          action_type: 'LOGIN',
          detail: `El usuario ${currentUser.full_name} cerró su sesión.`,
          module: 'Autenticación'
        });
      } catch (err) {
        console.warn('Could not log logout in DB:', err);
      }
    }
    setCurrentUserState(null);
    setSessionUser(null);
    setActiveView('login');
    addToast('info', 'Sesión Finalizada', 'Has cerrado tu sesión exitosamente.');
  };

  const handleSwitchUser = async (user: User) => {
    setCurrentUserState(user);
    setSessionUser(user);
    try {
      await apiCreateActivityLog({
        user_id: user.id,
        user_name: user.full_name,
        user_avatar: undefined,
        action_label: 'Cambio de Rol/Usuario',
        action_type: 'LOGIN',
        detail: `Se cambió el contexto de sesión a ${user.full_name} (${user.role}).`,
        module: 'Autenticación'
      });
      const updatedLogs = await fetchActivityLogs();
      setActivityLogs(updatedLogs);
    } catch (err) {
      console.warn('Could not log switch in DB:', err);
    }
    addToast('info', 'Perfil Cambiado', `Ahora estás navegando como ${user.full_name} [${user.role}].`);
  };

  // -------------------------------------------------------------
  // PROJECT OPERATIONS (Supabase CRUD)
  // -------------------------------------------------------------
  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (!currentUser) return;

    try {
      if (editingProject) {
        // Update existing in Supabase
        const updated = await apiUpdateProject(editingProject.id, projectData);
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Proyecto Actualizado',
          action_type: 'EDITAR',
          detail: `Se modificaron los datos del proyecto "${projectData.name || editingProject.name}" en Supabase.`,
          module: 'Proyectos',
          payload: { projectId: editingProject.id }
        });

        addToast('success', 'Proyecto Actualizado', `El proyecto "${projectData.name || editingProject.name}" fue guardado en Supabase.`);
        setEditingProject(null);
        setActiveView('projects');
      } else {
        // Create new in Supabase
        const newProjectPayload: Partial<Project> = {
          name: projectData.name || 'Nuevo Proyecto de Investigación',
          training_center_id: projectData.training_center_id || 1,
          training_center_name: projectData.training_center_name || 'CLEM - Centro Latinoamericano de Especies Menores',
          regional_name: projectData.regional_name || 'Valle del Cauca',
          beneficiaries: projectData.beneficiaries || 'Comunidad educativa del SENA CLEM',
          executive_summary: projectData.executive_summary || '',
          keywords: projectData.keywords || ['Investigación'],
          general_objective: projectData.general_objective || '',
          specific_objectives: projectData.specific_objectives || [],
          start_date: projectData.start_date || new Date().toISOString().split('T')[0],
          end_date: projectData.end_date || new Date().toISOString().split('T')[0],
          total_budget: projectData.total_budget || 0,
          status: projectData.status || 'EN EJECUCIÓN',
          progress: projectData.progress || 0,
          author_ids: projectData.author_ids && projectData.author_ids.length > 0 ? projectData.author_ids : [currentUser.id],
          training_group_ids: projectData.training_group_ids && projectData.training_group_ids.length > 0 ? projectData.training_group_ids : [1],
          attachments: projectData.attachments || [],
          created_by_user_id: currentUser.id,
          is_deleted: false
        };

        const created = await apiCreateProject(newProjectPayload);
        setProjects((prev) => [created, ...prev]);

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Proyecto Registrado',
          action_type: 'CREAR',
          detail: `Se creó el proyecto de investigación "${created.name}" (ID #${created.id}) en Supabase.`,
          module: 'Proyectos',
          payload: { projectId: created.id, title: created.name }
        });

        addToast('success', 'Proyecto Registrado', `El proyecto "${created.name}" se guardó en Supabase exitosamente.`);
        setActiveView('projects');
      }

      // Refresh activity logs and DB status
      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);
    } catch (err: any) {
      console.error('Error saving project to Supabase:', err);
      addToast('error', 'Error al Guardar Proyecto', err.message);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!currentUser) return;
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    try {
      await apiDeleteProject(projectId);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, is_deleted: true } : p)));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: undefined,
        action_label: 'Proyecto Eliminado (Soft Delete)',
        action_type: 'ELIMINAR',
        detail: `Se eliminó lógicamente el proyecto "${target.name}" (ID #${projectId}) en MySQL.`,
        module: 'Proyectos',
        payload: { projectId }
      });

      if (selectedProjectForModal?.id === projectId) {
        setSelectedProjectForModal(null);
      }

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);

      addToast('warning', 'Proyecto Eliminado', `El proyecto "${target.name}" fue marcado como eliminado en MySQL.`);
    } catch (err: any) {
      addToast('error', 'Error al Eliminar Proyecto', err.message);
    }
  };

  const handleQuickStatusChange = async (projectId: number, newStatus: Project['status']) => {
    if (!currentUser) return;
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    try {
      await apiUpdateProjectStatus(projectId, newStatus);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: undefined,
        action_label: 'Cambio de Estado',
        action_type: 'ESTADO',
        detail: `Se cambió el estado del proyecto "${target.name}" a "${newStatus}" en MySQL.`,
        module: 'Proyectos',
        payload: { projectId, oldStatus: target.status, newStatus }
      });

      const [newLogs, newStatusInfo] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatusInfo);

      addToast('info', 'Estado Actualizado', `El estado del proyecto cambió a ${newStatus} en MySQL.`);
    } catch (err: any) {
      addToast('error', 'Error al Cambiar Estado', err.message);
    }
  };

  // -------------------------------------------------------------
  // USER OPERATIONS (MySQL CRUD)
  // -------------------------------------------------------------
  const handleSaveUser = async (userData: Partial<User>) => {
    if (!currentUser) return;

    try {
      if (editingUser) {
        const updated = await apiUpdateUser(editingUser.id, userData);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Usuario Actualizado',
          action_type: 'EDITAR',
          detail: `Se actualizaron los datos del usuario ${userData.full_name || editingUser.full_name} en MySQL.`,
          module: 'Usuarios'
        });

        addToast('success', 'Usuario Actualizado', `Se guardaron los cambios para ${userData.full_name} en MySQL.`);
        setEditingUser(null);
        setActiveView('users');
      } else {
        const created = await apiCreateUser(userData);
        setUsers((prev) => [created, ...prev]);

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Usuario Creado',
          action_type: 'CREAR',
          detail: `Se registró el usuario ${created.full_name} (${created.role}) en MySQL.`,
          module: 'Usuarios'
        });

        addToast('success', 'Usuario Creado', `El usuario ${created.full_name} fue registrado en MySQL con éxito.`);
        setActiveView('users');
      }

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);
    } catch (err: any) {
      addToast('error', 'Error al Guardar Usuario', err.message);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    if (!currentUser) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    try {
      const newStatus = await apiToggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus as any } : u)));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: undefined,
        action_label: 'Estado de Usuario Modificado',
        action_type: 'ESTADO',
        detail: `Se cambió el estado del usuario ${target.full_name} a "${newStatus}" en MySQL.`,
        module: 'Usuarios'
      });

      const newLogs = await fetchActivityLogs();
      setActivityLogs(newLogs);

      addToast('info', 'Estado de Cuenta', `La cuenta de ${target.full_name} ahora está ${newStatus}.`);
    } catch (err: any) {
      addToast('error', 'Error al Modificar Estado', err.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!currentUser) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    try {
      await apiDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: undefined,
        action_label: 'Usuario Eliminado',
        action_type: 'ELIMINAR',
        detail: `Se eliminó de la base de datos MySQL el usuario ${target.full_name} (${target.email}).`,
        module: 'Usuarios'
      });

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);

      addToast('warning', 'Usuario Eliminado', `El usuario ${target.full_name} fue eliminado de MySQL.`);
    } catch (err: any) {
      addToast('error', 'Error al Eliminar Usuario', err.message);
    }
  };

  const handleSaveProfile = async (userData: Partial<User>) => {
    if (!currentUser) return;

    try {
      const updated = await apiUpdateUser(currentUser.id, userData);
      setCurrentUserState(updated);
      setSessionUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...updated } : u)));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: updated.full_name,
        user_avatar: undefined,
        action_label: 'Perfil Actualizado',
        action_type: 'EDITAR',
        detail: `El usuario ${updated.full_name} actualizó su información de perfil.`,
        module: 'Usuarios'
      });

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);

      addToast('success', 'Perfil Actualizado', 'Tus datos fueron guardados exitosamente.');
    } catch (err: any) {
      addToast('error', 'Error al Guardar Perfil', err.message);
    }
  };

  // -------------------------------------------------------------
  // TRAINING GROUP OPERATIONS (MySQL CRUD)
  // -------------------------------------------------------------
  const handleSaveGroup = async (groupData: Partial<TrainingGroup>) => {
    if (!currentUser) return;

    try {
      if (editingGroup) {
        const updated = await apiUpdateGroup(editingGroup.id, groupData);
        setGroups((prev) => prev.map((g) => (g.id === editingGroup.id ? updated : g)));

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Ficha Actualizada',
          action_type: 'EDITAR',
          detail: `Se modificaron los datos de la ficha ${groupData.number || editingGroup.number} en MySQL.`,
          module: 'Grupos'
        });

        addToast('success', 'Grupo Actualizado', `Ficha ${groupData.number} guardada en MySQL.`);
        setEditingGroup(null);
        setActiveView('groups');
      } else {
        const created = await apiCreateGroup(groupData);
        setGroups((prev) => [created, ...prev]);

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Ficha Creada',
          action_type: 'CREAR',
          detail: `Se registró la ficha de formación ${created.number} (${created.training_program}) en MySQL.`,
          module: 'Grupos'
        });

        addToast('success', 'Grupo Registrado', `Ficha ${created.number} registrada exitosamente en MySQL.`);
        setActiveView('groups');
      }

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);
    } catch (err: any) {
      addToast('error', 'Error al Guardar Grupo', err.message);
    }
  };

  const handleToggleGroupStatus = async (groupId: number) => {
    if (!currentUser) return;
    const target = groups.find((g) => g.id === groupId);
    if (!target) return;

    try {
      const newStatus = await apiToggleGroupStatus(groupId);
      setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, status: newStatus as any } : g)));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: undefined,
        action_label: 'Estado de Ficha Modificado',
        action_type: 'ESTADO',
        detail: `Se cambió el estado de la ficha ${target.number} a "${newStatus}" en MySQL.`,
        module: 'Grupos'
      });

      const newLogs = await fetchActivityLogs();
      setActivityLogs(newLogs);

      addToast('info', 'Ficha Actualizada', `La ficha ${target.number} ahora está ${newStatus}.`);
    } catch (err: any) {
      addToast('error', 'Error al Modificar Ficha', err.message);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!currentUser) return;
    const target = groups.find((g) => g.id === groupId);
    if (!target) return;

    try {
      await apiDeleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: undefined,
        action_label: 'Ficha Eliminada',
        action_type: 'ELIMINAR',
        detail: `Se eliminó la ficha de formación ${target.number} de MySQL.`,
        module: 'Grupos'
      });

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);

      addToast('warning', 'Ficha Eliminada', `La ficha ${target.number} fue removida de MySQL.`);
    } catch (err: any) {
      addToast('error', 'Error al Eliminar Ficha', err.message);
    }
  };

  // -------------------------------------------------------------
  // TRAINING CENTER OPERATIONS (CRUD)
  // -------------------------------------------------------------
  const handleSaveCenter = async (centerData: Partial<TrainingCenter>) => {
    if (!currentUser) return;

    try {
      if (editingCenter) {
        const updated = await apiUpdateCenter(editingCenter.id, centerData);
        setCenters((prev) => prev.map((c) => (c.id === editingCenter.id ? { ...c, ...updated } : c)));

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Centro Actualizado',
          action_type: 'EDITAR',
          detail: `Se modificaron los datos del centro ${centerData.name || editingCenter.name}.`,
          module: 'Centros'
        });

        addToast('success', 'Centro Actualizado', `Centro ${centerData.name} guardado con éxito.`);
        setEditingCenter(null);
        setActiveView('centers');
      } else {
        const created = await apiCreateCenter(centerData);
        setCenters((prev) => [...prev, created]);

        await apiCreateActivityLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_avatar: undefined,
          action_label: 'Centro Creado',
          action_type: 'CREAR',
          detail: `Se registró el centro de formación ${created.name}.`,
          module: 'Centros'
        });

        addToast('success', 'Centro Registrado', `Centro ${created.name} registrado exitosamente.`);
        setActiveView('centers');
      }

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);
    } catch (err: any) {
      addToast('error', 'Error al Guardar Centro', err.message);
    }
  };

  const handleDeleteCenter = async (centerId: number) => {
    if (!currentUser) return;
    const target = centers.find((c) => c.id === centerId);
    if (!target) return;

    try {
      await apiDeleteCenter(centerId);
      setCenters((prev) => prev.filter((c) => c.id !== centerId));

      await apiCreateActivityLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_avatar: undefined,
        action_label: 'Centro Eliminado',
        action_type: 'ELIMINAR',
        detail: `Se eliminó el centro de formación ${target.name}.`,
        module: 'Centros'
      });

      const [newLogs, newStatus] = await Promise.all([fetchActivityLogs(), getDbStatus()]);
      setActivityLogs(newLogs);
      setDbStatus(newStatus);

      addToast('warning', 'Centro Eliminado', `El centro ${target.name} fue eliminado.`);
    } catch (err: any) {
      addToast('error', 'Error al Eliminar Centro', err.message);
    }
  };

  // -------------------------------------------------------------
  // AUTH VIEWS ROUTING
  // -------------------------------------------------------------
  if (!currentUser || activeView === 'login' || activeView === 'forgot-password') {
    if (activeView === 'forgot-password') {
      return (
        <>
          <ToastContainer toasts={toasts} onRemove={removeToast} />
          <ForgotPasswordView
            setActiveView={setActiveView}
            onSuccess={(msg) => addToast('success', 'Instrucciones Enviadas', msg)}
          />
        </>
      );
    }

    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <LoginView
          onLogin={handleLogin}
          availableUsers={users}
          setActiveView={setActiveView}
          onError={(msg) => addToast('error', 'Error de Autenticación', msg)}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // MAIN APPLICATION LAYOUT (DESKTOP + MOBILE)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-[#f5fceb] text-[#171d13] font-sans antialiased selection:bg-[#39a900]/20 selection:text-[#0c3400]">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Side Navigation Bar */}
      <SideNavBar
        activeView={activeView}
        setActiveView={(v) => {
          setEditingProject(null);
          setEditingUser(null);
          setEditingGroup(null);
          setActiveView(v);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar with MySQL VPS Status Badge */}
        <TopNavBar
          currentUser={currentUser}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={handleLogout}
          availableUsers={users}
          onSwitchUser={handleSwitchUser}
          recentLogs={activityLogs}
          dbStatus={dbStatus}
          onReconnectDb={handleReconnectDb}
          onToast={addToast}
        />

        {/* View Router */}
        <main className="flex-1 flex flex-col">
          {isLoadingData && projects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-12 h-12 border-4 border-[#39a900]/30 border-t-[#39a900] rounded-full animate-spin mb-4" />
              <h3 className="font-montserrat font-bold text-lg text-[#171d13]">
                Conectando con la base de datos MySQL VPS...
              </h3>
              <p className="text-xs text-[#6f7b66] mt-1 max-w-md">
                Consultando tablas relacionales del TRD (proyectos, instructores, aprendices, fichas y logs de auditoría).
              </p>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && (
                <DashboardView
                  projects={projects}
                  users={users}
                  groups={groups}
                  activityLogs={activityLogs}
                  currentUser={currentUser}
                  setActiveView={setActiveView}
                  onSelectProject={(p) => setSelectedProjectForModal(p)}
                />
              )}

              {activeView === 'projects' && (
                <ProjectsBankView
                  projects={projects}
                  allUsers={users}
                  allGroups={groups}
                  allCenters={centers}
                  currentUser={currentUser}
                  setActiveView={setActiveView}
                  onSelectProject={(p) => setSelectedProjectForModal(p)}
                  onEditProject={(p) => {
                    setEditingProject(p);
                    setActiveView('edit-project');
                  }}
                  onDeleteProject={handleDeleteProject}
                  onQuickStatusChange={handleQuickStatusChange}
                />
              )}

              {(activeView === 'new-project' || activeView === 'edit-project') && (
                <NewProjectView
                  initialProject={editingProject}
                  currentUser={currentUser}
                  allUsers={users}
                  allGroups={groups}
                  allCenters={centers}
                  allDepartments={departments}
                  allCities={cities}
                  onSave={handleSaveProject}
                  setActiveView={setActiveView}
                  onToast={addToast}
                />
              )}

              {currentUser?.role === 'ADMINISTRADOR' && activeView === 'users' && (
                <UsersListView
                  users={users}
                  currentUser={currentUser}
                  setActiveView={setActiveView}
                  onEditUser={(u) => {
                    setEditingUser(u);
                    setActiveView('edit-user');
                  }}
                  onToggleStatus={handleToggleUserStatus}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {currentUser?.role === 'ADMINISTRADOR' && (activeView === 'new-user' || activeView === 'edit-user') && (
                <UserFormView
                  initialUser={editingUser}
                  currentUser={currentUser}
                  onSave={handleSaveUser}
                  setActiveView={setActiveView}
                  onToast={addToast}
                />
              )}

              {activeView === 'groups' && (
                <GroupsListView
                  groups={groups}
                  centers={centers}
                  currentUser={currentUser}
                  setActiveView={setActiveView}
                  onEditGroup={(g) => {
                    setEditingGroup(g);
                    setActiveView('edit-group');
                  }}
                  onToggleStatus={handleToggleGroupStatus}
                  onDeleteGroup={handleDeleteGroup}
                />
              )}

              {(activeView === 'new-group' || activeView === 'edit-group') && (
                <GroupFormView
                  initialGroup={editingGroup}
                  centers={centers}
                  onSave={handleSaveGroup}
                  setActiveView={setActiveView}
                  onToast={addToast}
                />
              )}

              {currentUser?.role === 'ADMINISTRADOR' && activeView === 'centers' && (
                <CentersListView
                  centers={centers}
                  departments={departments}
                  cities={cities}
                  groups={groups}
                  projects={projects}
                  currentUser={currentUser}
                  setActiveView={setActiveView}
                  onEditCenter={(c) => {
                    setEditingCenter(c);
                    setActiveView('edit-center');
                  }}
                  onDeleteCenter={handleDeleteCenter}
                />
              )}

              {currentUser?.role === 'ADMINISTRADOR' && (activeView === 'new-center' || activeView === 'edit-center') && (
                <CenterFormView
                  initialCenter={editingCenter}
                  departments={departments}
                  cities={cities}
                  onSave={handleSaveCenter}
                  setActiveView={setActiveView}
                  onToast={addToast}
                />
              )}

              {currentUser?.role === 'ADMINISTRADOR' && activeView === 'activity-log' && (
                <ActivityLogView
                  logs={activityLogs}
                  setActiveView={setActiveView}
                  onToast={addToast}
                />
              )}

              {activeView === 'profile' && currentUser && (
                <ProfileView
                  currentUser={currentUser}
                  onSave={handleSaveProfile}
                  setActiveView={setActiveView}
                  onToast={addToast}
                />
              )}

              {activeView === 'about' && <AboutView setActiveView={setActiveView} />}
              {activeView === 'privacy' && <PrivacyView setActiveView={setActiveView} />}
              {activeView === 'terms' && <TermsView setActiveView={setActiveView} />}
              {activeView === 'faq' && <FaqView setActiveView={setActiveView} />}
              {activeView === 'case-studies' && <CaseStudiesView setActiveView={setActiveView} />}
            </>
          )}
        </main>

        {/* Project Details Modal */}
        <ProjectDetailModal
          project={selectedProjectForModal}
          onClose={() => setSelectedProjectForModal(null)}
          onEdit={(p) => {
            setSelectedProjectForModal(null);
            setEditingProject(p);
            setActiveView('edit-project');
          }}
          onDelete={handleDeleteProject}
          currentUser={currentUser}
          allUsers={users}
          allGroups={groups}
          allCenters={centers}
        />

        {/* Global Footer */}
        <Footer setActiveView={setActiveView} />
      </div>
    </div>
  );
};

export default App;

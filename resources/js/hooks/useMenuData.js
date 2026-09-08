// import { useState, useEffect } from 'react';
// import ApiService from '../core/services/ApiService';

// // Custom hook to load menu data from API/Database
// export const useMenuData = ({ selectedModule }) => {
//     const [menuData, setMenuData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

 

//     useEffect(() => {
//         const loadMenuData = async () => {
//             try {
//                 setLoading(true);
//                 const savedModule = selectedModule || [];
//                 const apiService = ApiService();
//                 const response = await apiService.vPost(`/api/menu-structure/`, { main_module_id: savedModule.mainModule.id });
//                 if (response.data.status === 1) {
//                     console.log('Menu data loaded successfully:', response.data);
//                     const data = response?.data || [];
//                     setMenuData(data);
//                     setError(null);
//                 }
//                 else {
//                     throw new Error(response.data.message || 'Failed to load menu data');
//                 }
//             } catch (err) {
//                 setError(err.message);
//                 console.error('Failed to load menu data:', err);

//                 // // Fallback to static data if API fails (for development)
//                 // const fallbackData = {
//                 //     sections: [
//                 //         {
//                 //             title: 'Menu',
//                 //             items: [
//                 //                 {
//                 //                     id: 'dashboard',
//                 //                     title: 'Dashboard',
//                 //                     icon: 'solar:home-2-broken',
//                 //                     url: '/dashboard',
//                 //                     type: 'link',
//                 //                     badge: '9+'
//                 //                 }
//                 //             ]
//                 //         },
//                 //         {
//                 //             title: 'Settings',
//                 //             items: [
//                 //                 {
//                 //                     id: 'moduleMaster',
//                 //                     title: 'Module Master',
//                 //                     icon: 'fa fa-cogs',
//                 //                     type: 'dropdown',
//                 //                     children: [
//                 //                         {
//                 //                             id: 'mainModule',
//                 //                             title: 'Main Module',
//                 //                             type: 'dropdown',
//                 //                             children: [
//                 //                                 { id: 'mainModuleCreate', title: 'Main Module Create', url: '/main-module/create', type: 'link' },
//                 //                                 { id: 'mainModuleList', title: 'Main Module List', url: '/main-module/list', type: 'link' }
//                 //                             ]
//                 //                         },
//                 //                         {
//                 //                             id: 'module',
//                 //                             title: 'Module',
//                 //                             type: 'dropdown',
//                 //                             children: [
//                 //                                 { id: 'moduleCreate', title: 'Module Create', url: '/module/create', type: 'link' },
//                 //                                 { id: 'moduleList', title: 'Module List', url: '/module/list', type: 'link' }
//                 //                             ]
//                 //                         },
//                 //                         {
//                 //                             id: 'subModule',
//                 //                             title: 'Sub Module',
//                 //                             type: 'dropdown',
//                 //                             children: [
//                 //                                 { id: 'subModuleCreate', title: 'Sub Module Create', url: '/sub-module/create', type: 'link' },
//                 //                                 { id: 'subModuleList', title: 'Sub Module List', url: '/sub-module/list', type: 'link' }
//                 //                             ]
//                 //                         },
//                 //                         {
//                 //                             id: 'permission',
//                 //                             title: 'Permission',
//                 //                             type: 'dropdown',
//                 //                             children: [
//                 //                                 { id: 'permissionCreate', title: 'Permission Create', url: '/permission/create', type: 'link' },
//                 //                                 { id: 'permissionList', title: 'Permission List', url: '/permission/list', type: 'link' }
//                 //                             ]
//                 //                         }
//                 //                     ]
//                 //                 },
//                 //                 {
//                 //                     id: 'rolePermission',
//                 //                     title: 'Role & Permissions',
//                 //                     icon: 'fa fa-cogs',
//                 //                     type: 'dropdown',
//                 //                     children: [
//                 //                         {
//                 //                             id: 'userRole',
//                 //                             title: 'User Role',
//                 //                             type: 'dropdown',
//                 //                             children: [
//                 //                                 { id: 'roleCreate', title: 'Role Create', url: '/role/create', type: 'link' },
//                 //                                 { id: 'roleList', title: 'Role List', url: '/role/list', type: 'link' }
//                 //                             ]
//                 //                         },
//                 //                         { id: 'rolePermissionCreate', title: 'Role Permission', url: '/role-permission/create', type: 'link' },
//                 //                         { id: 'userRolePermission', title: 'User Role Permission', url: '/user-role-permission/create', type: 'link' }
//                 //                     ]
//                 //                 },
//                 //                 {
//                 //                     id: 'commissionMaster',
//                 //                     title: 'Commission Master',
//                 //                     icon: 'fa fa-cogs',
//                 //                     type: 'dropdown',
//                 //                     children: [
//                 //                         {
//                 //                             id: 'commission',
//                 //                             title: 'Commission',
//                 //                             type: 'dropdown',
//                 //                             children: [
//                 //                                 { id: 'commissionCreate', title: 'Commission Create', url: '/commission/create', type: 'link' },
//                 //                                 { id: 'commissionList', title: 'Commission List', url: '/commission/list', type: 'link' }
//                 //                             ]
//                 //                         },
//                 //                         { id: 'roleCommission', title: 'Role Commission', url: '/role-commission/create', type: 'link' },
//                 //                         { id: 'userRoleCommission', title: 'User Role Commission', url: '/user-role-commission/create', type: 'link' }
//                 //                     ]
//                 //                 },
//                 //                 {
//                 //                     id: 'subscriptionMaster',
//                 //                     title: 'Subscription Master',
//                 //                     icon: 'fa fa-cubes',
//                 //                     type: 'dropdown',
//                 //                     children: [
//                 //                         {
//                 //                             id: 'subscription',
//                 //                             title: 'Subscription',
//                 //                             type: 'dropdown',
//                 //                             children: [
//                 //                                 { id: 'subscriptionCreate', title: 'Create', url: '/subscription-master/add', type: 'link' },
//                 //                                 { id: 'subscriptionList', title: 'List', url: '/subscription-master/list', type: 'link' }
//                 //                             ]
//                 //                         },
//                 //                         { id: 'roleSubscription', title: 'Role Subscription', url: '/role-subscription/create', type: 'link' }
//                 //                     ]
//                 //                 },
//                 //                 {
//                 //                     id: 'users',
//                 //                     title: 'Users',
//                 //                     icon: 'fa fa-users',
//                 //                     type: 'dropdown',
//                 //                     children: [
//                 //                         { id: 'userCreate', title: 'Create', url: '/users/add', type: 'link' },
//                 //                         { id: 'userList', title: 'List', url: '/users/list', type: 'link' }
//                 //                     ]
//                 //                 },
//                 //                 {
//                 //                     id: 'subscription',
//                 //                     title: 'Subscription',
//                 //                     icon: 'fa fa-credit-card',
//                 //                     url: '/subscription',
//                 //                     type: 'link'
//                 //                 }
//                 //             ]
//                 //         }
//                 //     ]
//                 // };

//                 // setMenuData(fallbackData);
//                 setError(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadMenuData();
//     }, []);

//     return { menuData, loading, error, refetch: () => loadMenuData() };
// };

// // Utility function to transform database menu structure to component format
// export const transformMenuData = (dbMenus) => {
//     // Transform your database menu structure to the format expected by the component
//     // Example transformation:
//     return {
//         sections: dbMenus.map(section => ({
//             title: section.section_name,
//             items: section.menus.map(menu => ({
//                 id: menu.id,
//                 title: menu.title,
//                 icon: menu.icon,
//                 url: menu.url,
//                 type: menu.type,
//                 badge: menu.badge,
//                 children: menu.children ? menu.children.map(child => ({
//                     id: child.id,
//                     title: child.title,
//                     type: child.type,
//                     url: child.url,
//                     children: child.children // Recursive for deeper nesting
//                 })) : undefined
//             }))
//         }))
//     };
// };

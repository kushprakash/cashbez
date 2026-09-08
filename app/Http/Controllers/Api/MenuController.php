<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    /**
     * Get menu structure for the sidebar
     * 
     * This method returns menu data based on user permissions from user_role_permissions table
     */
    public function getMenuStructure(Request $request): JsonResponse
    {
        try {
            // Get token from header
            if ($request->hasHeader('Token')) {
                $authHeader = $request->header('Token');
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => 'No token provided',
                ], 400);
            }

            // Find user by token
            $user = \App\Models\User::where('remember_token', $authHeader)->first();
            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid token',
                ], 401);
            }

            // Get main_module_id from request or find first available
            $mainModuleId = $request->input('main_module_id');
            
            if (!$mainModuleId) {
                // Find the first available main_module_id for this user
                $firstPermission = \App\Models\UserRolePermission::where('user_id', $user->id)
                    ->where('status', 1)
                    ->whereHas('module', function($query) {
                        $query->where('status', 1);
                    })
                    ->whereHas('subModule', function($query) {
                        $query->where('status', 1);
                    })
                    ->whereHas('permission', function($query) {
                        $query->where('status', 1);
                    })
                    ->first();
                
                if (!$firstPermission) {
                    return response()->json([
                        'status' => 1,
                        'sections' => []
                    ]);
                }
                
                // Check if MainModule is active
                $mainModule = \App\Models\MainModule::where('id', $firstPermission->main_module_id)
                    ->where('status', 1)
                    ->first();
                
                if (!$mainModule) {
                    return response()->json([
                        'status' => 1,
                        'sections' => []
                    ]);
                }
                
                $mainModuleId = $firstPermission->main_module_id;
                $mainModuleIdName = $firstPermission->name;
            } else {
                // Check if provided MainModule is active
                $mainModule = \App\Models\MainModule::where('id', $mainModuleId)
                    ->where('status', 1)
                    ->first();
                
                if (!$mainModule) {
                    return response()->json([
                        'status' => 1,
                        'sections' => []
                    ]);
                }
            }

           $userPermissions = \App\Models\UserRolePermission::with([
                'module' => function($query) {
                    $query->where('status', 1);
                },
                'subModule' => function($query) {
                    $query->where('status', 1);
                },
                'permission' => function($query) {
                    $query->where('status', 1);
                }
            ])
            ->join('modules', 'modules.id', '=', 'user_role_permissions.module_id')
            ->where('user_role_permissions.user_id', $user->id)
            ->where('user_role_permissions.main_module_id', $mainModuleId)
            ->where('user_role_permissions.status', 1)
            ->orderBy('modules.position', 'ASC')   // ← sorting by module.position
            ->select('user_role_permissions.*')    // important to avoid column conflicts
            ->get();


            if ($userPermissions->isEmpty()) {
                return response()->json([
                    'status' => 1,
                    'sections' => []
                ]);
            }

            // Build menu structure based on permissions
            $menuStructure = $this->buildMenuFromPermissions($userPermissions);

            return response()->json([
                'status' => 1,
                'sections' => $menuStructure
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'error' => 'Failed to load menu structure',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function buildMenuFromPermissions($permissions)
    {
        // Group permissions by module and sub-module
        $groupedData = [];
        
        foreach ($permissions as $permission) {
            $module = $permission->module;
            $subModule = $permission->subModule;
            $perm = $permission->permission;
            
            // Only include permissions that should be shown in menu and have status == 1
            // Also check if module, subModule are active (status == 1)
            if ($perm && $perm->menu_show == 1 && $perm->status == 1 && 
                $module && $module->status == 1 && 
                $subModule && $subModule->status == 1) {
                $moduleId = $module->id;
                $subModuleId = $subModule ? $subModule->id : null;
                
                if (!isset($groupedData[$moduleId])) {
                    $groupedData[$moduleId] = [
                        'module' => $module,
                        'subModules' => []
                    ];
                }
                
                if ($subModuleId && !isset($groupedData[$moduleId]['subModules'][$subModuleId])) {
                    $groupedData[$moduleId]['subModules'][$subModuleId] = [
                        'subModule' => $subModule,
                        'permissions' => []
                    ];
                }
                
                if ($subModuleId) {
                    // Check if permission already exists to avoid duplicates
                    $permissionExists = false;
                    foreach ($groupedData[$moduleId]['subModules'][$subModuleId]['permissions'] as $existingPerm) {
                        if ($existingPerm->id == $perm->id) {
                            $permissionExists = true;
                            break;
                        }
                    }
                    
                    if (!$permissionExists) {
                        $groupedData[$moduleId]['subModules'][$subModuleId]['permissions'][] = $perm;
                    }
                }
            }
        }

        // Build menu sections
        $sections = [
            [
                'title' => 'Menu',
                'items' => [
                    [
                        'id' => 'dashboard',
                        'title' => 'Dashboard',
                        'icon' => 'solar:home-2-broken',
                        'url' => '/dashboard',
                        'type' => 'link',
                        'badge' => '9+'
                    ]
                ]
            ]
        ];

        // Build Services section from actual permissions
        $servicesItems = [];
        
        foreach ($groupedData as $moduleData) {
            $module = $moduleData['module'];
            $subModules = $moduleData['subModules'];
            
            if (!empty($subModules)) {
                // Check if there's only one submodule and its name matches the module name
                if (count($subModules) == 1) {
                    $singleSubModule = reset($subModules);
                    $subModule = $singleSubModule['subModule'];
                    $permissions = $singleSubModule['permissions'];
                    
                    // If module name and submodule name are the same, show only submodule dropdown
                    if ($module->name == $subModule->name) {
                        $subModuleItem = [
                            'id' => strtolower(str_replace(' ', '', $subModule->name)),
                            'title' => $subModule->name,
                            'icon' => $module->icon,
                            'type' => 'dropdown',
                            'children' => []
                        ];
                        
                        // Add permissions as menu items to submodule
                        foreach ($permissions as $perm) {
                            $permissionItem = [
                                'id' => strtolower(str_replace([' ', '/'], ['', ''], $perm->name)),
                                'title' => $perm->name,
                                'url' => $perm->route,
                                'type' => 'link'
                            ];
                            $subModuleItem['children'][] = $permissionItem;
                        }
                        
                        if (!empty($subModuleItem['children'])) {
                            $servicesItems[] = $subModuleItem; // Add submodule directly to services
                        }
                        continue; // Skip the normal module processing
                    }
                    
                    // If module has single permission with same name, show only the menu item
                    if (count($permissions) == 1 && $module->name == $permissions[0]->name) {
                        $permissionItem = [
                            'id' => strtolower(str_replace([' ', '/'], ['', ''], $permissions[0]->name)),
                            'title' => $permissions[0]->name,
                            'icon' => $module->icon,
                            'url' => $permissions[0]->route,
                            'type' => 'link'
                        ];
                        $servicesItems[] = $permissionItem;
                        continue; // Skip the normal module processing
                    }
                }
                
                $moduleItem = [
                    'id' => strtolower(str_replace(' ', '', $module->name)),
                    'title' => $module->name,
                    'icon' => $module->icon,
                    'type' => 'dropdown',
                    'children' => []
                ];
                
                foreach ($subModules as $subModuleData) {
                    $subModule = $subModuleData['subModule'];
                    $permissions = $subModuleData['permissions'];
                    
                    // Check if submodule has only one permission with same name
                    if (count($permissions) == 1 && $subModule->name == $permissions[0]->name) {
                        // Add the permission directly as a link item
                        $permissionItem = [
                            'id' => strtolower(str_replace([' ', '/'], ['', ''], $permissions[0]->name)),
                            'title' => $permissions[0]->name,
                            'icon' => $module->icon,
                            'url' => $permissions[0]->route,
                            'type' => 'link'
                        ];
                        $moduleItem['children'][] = $permissionItem;
                    } else {
                        // Normal submodule processing
                        $subModuleItem = [
                            'id' => strtolower(str_replace(' ', '', $subModule->name)),
                            'title' => $subModule->name,
                            'type' => 'dropdown',
                            'children' => []
                        ];
                        
                        // Add permissions as menu items
                        foreach ($permissions as $perm) {
                            $permissionItem = [
                                'id' => strtolower(str_replace([' ', '/'], ['', ''], $perm->name)),
                                'title' => $perm->name,
                                'url' => $perm->route,
                                'type' => 'link'
                            ];
                            $subModuleItem['children'][] = $permissionItem;
                        }
                        
                        if (!empty($subModuleItem['children'])) {
                            $moduleItem['children'][] = $subModuleItem;
                        }
                    }
                }
                
                if (!empty($moduleItem['children'])) {
                    $servicesItems[] = $moduleItem;
                }
            }
        }

        // Add Services section if there are any items
        if (!empty($servicesItems)) {
            $sections[] = [
                'title' => 'Services',
                'items' => $servicesItems
            ];
        }

        return $sections;
    }

}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash, UserX, UserCheck, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const UserRow = ({ user, onEdit, onDelete, onToggleStatus }) => {
  const { t } = useTranslation();
  
  // Format date for readability
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get role badge color
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'vendor':
        return 'warning';
      case 'customer':
      default:
        return 'success';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-gray-500">
                {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.name || t("unnamed_user")}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {t(user.role || 'customer')}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={user.isActive ? 'success' : 'secondary'}>
          {user.isActive ? t('active') : t('disabled')}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {formatDate(user.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2 justify-end">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onEdit(user)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleStatus(user)}
            className={user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
          >
            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(user)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

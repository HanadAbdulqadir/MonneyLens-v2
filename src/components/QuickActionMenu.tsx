import React from 'react';
import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@shared/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from "lucide-react";
import { Transaction } from "@data/financialData";

interface QuickActionMenuProps {
  transaction: Transaction | any;
  onEdit?: (transaction: any) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (transaction: any) => void;
  onView?: (transaction: any) => void;
  size?: "sm" | "md" | "lg";
}

const QuickActionMenu = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onView,
  size = "sm" 
}: QuickActionMenuProps) => {
  const handleEdit = () => {
    onEdit?.(transaction);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete?.(transaction.id);
    }
  };

  const handleDuplicate = () => {
    onDuplicate?.(transaction);
  };

  const handleView = () => {
    onView?.(transaction);
  };

  const iconSize = "h-3 w-3"; // Always use smallest size
  const buttonSize = "h-5 w-5 p-0"; // Much smaller button

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`${buttonSize} opacity-0 group-hover:opacity-75 transition-all duration-150 hover:bg-accent/30 rounded-sm`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className={iconSize} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 text-xs">
        {onView && (
          <DropdownMenuItem onClick={handleView} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit Transaction
          </DropdownMenuItem>
        )}
        {onDuplicate && (
          <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
        )}
        {(onEdit || onDuplicate) && onDelete && <DropdownMenuSeparator />}
        {onDelete && (
          <DropdownMenuItem 
            onClick={handleDelete} 
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickActionMenu;
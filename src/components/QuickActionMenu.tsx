import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from "lucide-react";
import { Transaction } from "@/data/financialData";

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

  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-6 w-6 p-0" : size === "md" ? "h-8 w-8 p-0" : "h-10 w-10 p-0";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`${buttonSize} opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent/50`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className={iconSize} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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
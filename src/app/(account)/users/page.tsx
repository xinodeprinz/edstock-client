"use client";

import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
} from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import CreateUserModal, { UserFormData } from "./CreateUserModal";
import { IconButton } from "@mui/material";
import { getUser } from "@/app/lib/helpers";

const Users = () => {
  const { data: users, isError, isLoading, refetch } = useGetUsersQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = getUser();
  const canPerform = !!(user && ["SUPER_ADMIN"].includes(user.role));

  const [createUser] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const columns: GridColDef[] = [
    { field: "userId", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "role", headerName: "Role", width: 200 },
  ];

  if (canPerform) {
    columns.push({
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleDeleteUser(params.row.userId)}
          aria-label="delete"
          color="error"
        >
          <Trash2Icon className="w-4 h-4" />
        </IconButton>
      ),
    });
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
      refetch();
    }
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !users) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users</div>
    );
  }

  const handleCreateUser = async (userData: UserFormData) => {
    await createUser(userData);
  };

  return (
    <div className="flex flex-col">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row gap-5 justify-between items-center mb-6">
        <Header name="Users" />

        {canPerform && (
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Add User
          </button>
        )}
      </div>
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.userId}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
};

export default Users;

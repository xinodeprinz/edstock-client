import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/app/(components)/Header";
import { ROLES } from "@/app/lib/interface";

export type UserFormData = {
  name: string;
  email: string;
  role: string;
  photo?: string;
};

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: UserFormData) => void;
};

const CreateUserModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateUserModalProps) => {
  const [formData, setFormData] = useState({
    userId: v4(),
    name: "",
    email: "",
    role: "",
    photo: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Add New User" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* NAME */}
          <label htmlFor="name" className={labelCssStyles}>
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          {/* EMAIL */}
          <label htmlFor="email" className={labelCssStyles}>
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
            value={formData.email}
            className={inputCssStyles}
            required
          />

          {/* PHOTO */}
          <label htmlFor="photo" className={labelCssStyles}>
            Photo (Optional)
          </label>
          <input
            type="url"
            name="photo"
            placeholder="Enter Photo"
            onChange={handleChange}
            value={formData.photo}
            className={inputCssStyles}
          />

          {/* ROLE */}
          <label htmlFor="role" className={labelCssStyles}>
            Role
          </label>
          <select
            name="role"
            onChange={handleChange}
            value={formData.role}
            className={inputCssStyles}
            required
          >
            <option value="">Select...</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* CREATE ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;

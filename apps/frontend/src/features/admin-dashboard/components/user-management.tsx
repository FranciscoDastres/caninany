import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "@caninany/shared";
import { ShieldCheck, Users } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";

import { getApiErrorMessage } from "@/core/api/get-api-error";
import { useAuthStore } from "@/store/auth.store";

import { getUsers, updateUserRole } from "../api/admin.api";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
});

export function UserManagement(): JSX.Element {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [message, setMessage] = useState<string | null>(null);
  const users = useQuery({ queryKey: ["usuarios"], queryFn: getUsers });
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: async () => {
      setMessage("Rol actualizado correctamente.");
      await queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  return (
    <article className="overflow-hidden border border-[#dfd7e0] bg-white shadow-[0_18px_60px_rgba(116,71,118,0.08)]">
      <div className="flex items-center gap-3 border-b border-[#ebe4ec] px-6 py-5 sm:px-8">
        <span className="grid size-11 place-items-center bg-brand-soft text-brand-primary">
          <Users className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-[#744776]">
            Gestión de usuarios
          </h2>
          <p className="text-sm text-[#756e77]">
            Revisa usuarios y administra sus permisos.
          </p>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className="mx-6 mt-5 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-primary sm:mx-8"
        >
          {message}
        </p>
      ) : null}

      {users.isPending ? (
        <p className="px-8 py-12 text-center text-[#756e77]">
          Cargando usuarios...
        </p>
      ) : users.isError ? (
        <p className="px-8 py-12 text-center font-semibold text-red-700">
          No fue posible cargar los usuarios.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-[#f7f5f7] text-xs uppercase tracking-[0.12em] text-[#756e77]">
              <tr>
                <th className="px-8 py-4">Usuario</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-8 py-4 text-right">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9e3ea]">
              {users.data.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="text-sm text-[#514853]">
                    <td className="px-8 py-5 font-bold text-[#403441]">
                      <span className="flex items-center gap-2">
                        {user.role === "admin" ? (
                          <ShieldCheck className="size-4 text-[#8f6291]" />
                        ) : null}
                        {user.name}
                      </span>
                    </td>
                    <td className="px-6 py-5">{user.email}</td>
                    <td className="px-6 py-5">
                      {dateFormatter.format(new Date(user.createdAt))}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <select
                        className="form-control ml-auto max-w-40"
                        value={user.role}
                        disabled={isCurrentUser || roleMutation.isPending}
                        aria-label={`Rol de ${user.name}`}
                        onChange={(event) =>
                          roleMutation.mutate({
                            id: user.id,
                            role: event.target.value as UserRole,
                          })
                        }
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

import { Download, FileText, ShoppingBag } from "lucide-react";
import type { JSX } from "react";

import { useAuthStore } from "@/store/auth.store";
import { PetManagement } from "@/features/pets/components/pet-management";

import { useMyPurchases } from "../hooks/use-my-purchases";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
});

export function ClientProfilePage(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const purchases = useMyPurchases();

  return (
    <section className="min-h-screen bg-[#eef2e8] px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Mi perfil</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl leading-[1.06] text-[#183c2d] sm:text-5xl">
              Hola, {user?.name}.
            </h1>
            <p className="mt-3 text-[#66766e]">
              Administra tus mascotas y revisa tus compras de Caninany.
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-3 text-sm text-[#52665c] shadow-sm">
            <span className="font-bold">Usuario:</span> {user?.email}
          </div>
        </div>

        <div className="mt-10 grid gap-8">
          <PetManagement />

          <div className="overflow-hidden rounded-[2rem] border border-[#e0d8cd] bg-white shadow-[0_18px_60px_rgba(35,67,52,0.08)]">
            <div className="flex items-center gap-3 border-b border-[#ece5dc] px-6 py-5 sm:px-8">
              <span className="grid size-11 place-items-center rounded-xl bg-[#dce8db] text-[#315f49]">
                <ShoppingBag className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl text-[#183c2d]">
                  Mis Compras
                </h2>
                <p className="text-sm text-[#75827b]">
                  Historial asociado a tu cuenta.
                </p>
              </div>
            </div>

            {purchases.isPending ? (
              <p className="px-8 py-12 text-center text-[#6d7b73]">
                Cargando tus compras...
              </p>
            ) : purchases.isError ? (
              <p className="px-8 py-12 text-center font-semibold text-red-700">
                No fue posible cargar tus compras.
              </p>
            ) : purchases.data.length === 0 ? (
              <div className="grid place-items-center px-8 py-16 text-center">
                <FileText className="size-10 text-[#b16d4b]" />
                <h3 className="mt-4 font-display text-2xl text-[#183c2d]">
                  Todavía no tienes compras registradas.
                </h3>
                <p className="mt-2 text-[#75827b]">
                  Cuando completes una compra aparecerá aquí con su comprobante.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-[#f7f3ed] text-xs uppercase tracking-[0.12em] text-[#718078]">
                    <tr>
                      <th className="px-8 py-4">Fecha</th>
                      <th className="px-6 py-4">Detalle</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-8 py-4 text-right">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee7de]">
                    {purchases.data.map((purchase) => (
                      <tr key={purchase.id} className="text-sm text-[#40574c]">
                        <td className="px-8 py-5">
                          {dateFormatter.format(new Date(purchase.purchasedAt))}
                        </td>
                        <td className="px-6 py-5 font-bold text-[#29483a]">
                          {purchase.description}
                        </td>
                        <td className="px-6 py-5">
                          {currencyFormatter.format(purchase.total)}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {purchase.receiptUrl ? (
                            <a
                              href={purchase.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-full bg-[#214e3b] px-4 py-2 font-bold text-white"
                            >
                              <Download className="size-4" />
                              Ver comprobante
                            </a>
                          ) : (
                            <span className="text-[#929b96]">
                              No disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

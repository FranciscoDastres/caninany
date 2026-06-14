import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSiteConfigurationSchema,
  type UpdateSiteConfigurationInput,
} from "@caninany/shared";
import { ImageUp, Save, Settings2 } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";
import { useSiteConfiguration } from "@/features/site-configuration/hooks/use-site-configuration";

import { updateSiteConfiguration, uploadSiteImage } from "../api/admin.api";

export function SiteContentEditor(): JSX.Element {
  const queryClient = useQueryClient();
  const configuration = useSiteConfiguration();
  const [message, setMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<UpdateSiteConfigurationInput>({
    resolver: zodResolver(updateSiteConfigurationSchema),
  });
  const heroImageUrl = watch("heroImageUrl");

  useEffect(() => {
    if (configuration.data) reset(configuration.data);
  }, [configuration.data, reset]);

  const imageMutation = useMutation({
    mutationFn: uploadSiteImage,
    onSuccess: (image) => {
      setValue("heroImageUrl", image.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setMessage("Imagen cargada. Guarda los cambios para publicarla.");
    },
    onError: (error) =>
      setMessage(getApiErrorMessage(error, "No fue posible cargar la imagen.")),
  });

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    try {
      const updatedConfiguration = await updateSiteConfiguration(values);
      queryClient.setQueryData(["configuracion-sitio"], updatedConfiguration);
      setMessage("Contenido actualizado correctamente.");
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "No fue posible guardar el contenido."),
      );
    }
  });

  return (
    <article className="rounded-[2rem] border border-[#e0d8cd] bg-white shadow-[0_18px_60px_rgba(35,67,52,0.08)]">
      <div className="flex items-center gap-3 border-b border-[#ece5dc] px-6 py-5 sm:px-8">
        <span className="grid size-11 place-items-center rounded-xl bg-[#f4dfd1] text-[#a65f40]">
          <Settings2 className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-[#183c2d]">
            Editor de contenido
          </h2>
          <p className="text-sm text-[#75827b]">
            Actualiza los textos e imagen principal de la portada.
          </p>
        </div>
      </div>

      {configuration.isPending ? (
        <p className="px-8 py-12 text-center text-[#6d7b73]">
          Cargando contenido...
        </p>
      ) : configuration.isError ? (
        <p className="px-8 py-12 text-center font-semibold text-red-700">
          No fue posible cargar la configuración.
        </p>
      ) : (
        <form className="grid gap-6 p-6 sm:p-8" onSubmit={onSubmit}>
          <div className="grid gap-5 lg:grid-cols-2">
            <EditorField
              label="Título principal"
              error={errors.heroTitle?.message}
            >
              <Input {...register("heroTitle")} />
            </EditorField>
            <EditorField
              label="Texto destacado"
              error={errors.heroHighlight?.message}
            >
              <Input {...register("heroHighlight")} />
            </EditorField>
          </div>

          <EditorField
            label="Descripción principal"
            error={errors.heroDescription?.message}
          >
            <textarea
              className="form-control min-h-28 resize-y py-3"
              {...register("heroDescription")}
            />
          </EditorField>

          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="grid content-start gap-4">
              <EditorField
                label="Ruta de la imagen"
                error={errors.heroImageUrl?.message}
              >
                <Input {...register("heroImageUrl")} />
              </EditorField>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[#cfc5b8] px-5 py-3 text-sm font-extrabold text-[#214e3b]">
                <ImageUp className="size-4" />
                {imageMutation.isPending ? "Subiendo..." : "Subir imagen"}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={imageMutation.isPending}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) imageMutation.mutate(file);
                  }}
                />
              </label>
              <p className="text-xs leading-5 text-[#849088]">
                Formatos JPG, PNG o WebP. Máximo 5 MB.
              </p>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef2e8]">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt="Vista previa de la portada"
                  className="size-full object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <EditorField
              label="Etiqueta de servicios"
              error={errors.servicesEyebrow?.message}
            >
              <Input {...register("servicesEyebrow")} />
            </EditorField>
            <EditorField
              label="Título de servicios"
              error={errors.servicesTitle?.message}
            >
              <Input {...register("servicesTitle")} />
            </EditorField>
          </div>

          <EditorField
            label="Descripción de servicios"
            error={errors.servicesDescription?.message}
          >
            <textarea
              className="form-control min-h-24 resize-y py-3"
              {...register("servicesDescription")}
            />
          </EditorField>

          {message ? (
            <p className="rounded-xl bg-[#eef2e8] px-4 py-3 text-sm font-semibold text-[#315f49]">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-13 w-fit items-center justify-center gap-3 rounded-full bg-[#214e3b] px-7 text-sm font-extrabold text-white transition hover:bg-[#183c2d] disabled:opacity-60"
          >
            <Save className="size-4" />
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}
    </article>
  );
}

interface EditorFieldProps {
  children: React.ReactNode;
  error?: string | undefined;
  label: string;
}

function EditorField({
  children,
  error,
  label,
}: EditorFieldProps): JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-[#344e41]">
      {label}
      {children}
      {error ? (
        <span className="text-xs font-semibold text-red-700">{error}</span>
      ) : null}
    </label>
  );
}

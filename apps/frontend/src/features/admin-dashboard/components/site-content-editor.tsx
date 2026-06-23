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

import { FormField } from "@/components/ui/form-field";
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
    <article className="border border-[#dfd7e0] bg-white shadow-[0_18px_60px_rgba(116,71,118,0.08)]">
      <div className="flex items-center gap-3 border-b border-[#ebe4ec] px-6 py-5 sm:px-8">
        <span className="grid size-11 place-items-center bg-[#f0e8f1] text-brand-primary">
          <Settings2 className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-[#744776]">
            Editor de contenido
          </h2>
          <p className="text-sm text-[#756e77]">
            Actualiza los textos e imagen principal de la portada.
          </p>
        </div>
      </div>

      {configuration.isPending ? (
        <p className="px-8 py-12 text-center text-[#756e77]">
          Cargando contenido...
        </p>
      ) : configuration.isError ? (
        <p className="px-8 py-12 text-center font-semibold text-red-700">
          No fue posible cargar la configuración.
        </p>
      ) : (
        <form className="grid gap-6 p-6 sm:p-8" onSubmit={onSubmit}>
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField
              label="Título principal"
              error={errors.heroTitle?.message}
            >
              <Input {...register("heroTitle")} />
            </FormField>
            <FormField
              label="Texto destacado"
              error={errors.heroHighlight?.message}
            >
              <Input {...register("heroHighlight")} />
            </FormField>
          </div>

          <FormField
            label="Descripción principal"
            error={errors.heroDescription?.message}
          >
            <textarea
              className="form-control min-h-28 resize-y py-3"
              {...register("heroDescription")}
            />
          </FormField>

          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="grid content-start gap-4">
              <FormField
                label="Ruta de la imagen"
                error={errors.heroImageUrl?.message}
              >
                <Input {...register("heroImageUrl")} />
              </FormField>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 border border-[#cfc5d1] px-5 py-3 text-sm font-extrabold text-brand-primary">
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
              <p className="text-xs leading-5 text-[#756e77]">
                Formatos JPG, PNG o WebP. Máximo 5 MB.
              </p>
            </div>
            <div className="aspect-[4/3] overflow-hidden bg-brand-soft">
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
            <FormField
              label="Etiqueta de servicios"
              error={errors.servicesEyebrow?.message}
            >
              <Input {...register("servicesEyebrow")} />
            </FormField>
            <FormField
              label="Título de servicios"
              error={errors.servicesTitle?.message}
            >
              <Input {...register("servicesTitle")} />
            </FormField>
          </div>

          <FormField
            label="Descripción de servicios"
            error={errors.servicesDescription?.message}
          >
            <textarea
              className="form-control min-h-24 resize-y py-3"
              {...register("servicesDescription")}
            />
          </FormField>

          {message ? (
            <p
              role="status"
              className="bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-primary"
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-13 w-fit items-center justify-center gap-3 bg-brand-primary px-7 text-sm font-extrabold text-white transition hover:bg-brand-deep disabled:opacity-60"
          >
            <Save className="size-4" />
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}
    </article>
  );
}

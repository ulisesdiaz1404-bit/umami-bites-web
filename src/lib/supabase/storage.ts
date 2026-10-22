import { createServiceRoleClient } from "./admin-client";

// SOLO servidor (usa service role): importar únicamente desde Server Actions.

/**
 * Sube una imagen a un bucket público de Supabase Storage y devuelve su URL.
 * Usa service role (server-only) y crea el bucket si no existe, así el dueño
 * puede cambiar fotos desde el panel sin tocar código ni redeploy.
 */
export async function uploadPublicImage(
  bucket: string,
  file: File,
  prefix: string
): Promise<{ url?: string; error?: string }> {
  const admin = createServiceRoleClient();
  if (!admin) {
    return { error: "Para subir fotos falta configurar SUPABASE_SERVICE_ROLE_KEY." };
  }
  // Idempotente: si el bucket ya existe, devuelve error que ignoramos.
  await admin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: "8MB",
  });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  // Sufijo aleatorio: varias fotos subidas en el mismo ms no se pisan entre sí.
  const path = `${prefix || "img"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await admin.storage.from(bucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) return { error: `No se pudo subir la foto: ${error.message}` };

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

/** Borra del bucket una imagen subida con uploadPublicImage (por su URL pública). */
export async function removePublicImage(bucket: string, url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return; // no es de este bucket (ej. foto por defecto en /public)
  const admin = createServiceRoleClient();
  if (!admin) return;
  await admin.storage.from(bucket).remove([decodeURIComponent(url.slice(i + marker.length))]);
}

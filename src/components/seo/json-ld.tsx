// Inyecta un bloque de datos estructurados (JSON-LD) para Google.
// No renderiza nada visible: solo un <script type="application/ld+json">.

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // El objeto es de origen propio (no input de usuario): serialización segura.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

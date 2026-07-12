// Per-cadeau PWA-manifest zodat "zet op beginscherm" direct op de
// cadeaupagina van deze ontvanger opent.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ secretSlug: string }> }
) {
  const { secretSlug } = await params;

  return Response.json(
    {
      name: "GiveWally",
      short_name: "GiveWally",
      start_url: `/cadeau/${secretSlug}`,
      scope: "/cadeau/",
      display: "standalone",
      background_color: "#f7f7f5",
      theme_color: "#0a1830",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}

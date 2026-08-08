import { describe, expect, it } from "vitest";

import {
  FEATURED_SUBJECT_TYPES,
  type FeaturedSubjectType,
  type HomeFeaturedItemV2,
  type HomeFeaturedItemV2Request,
  type HomeFeaturedSlidePublicV2,
} from "../src/home";
import { V2_ENDPOINTS, endpoint } from "../src/endpoints";

/**
 * El carrusel del home es la superficie más vista del sitio, y ahora cualquier
 * contenido publicado puede llegar ahí. Estos tests congelan las dos cosas que
 * un consumidor no puede deducir leyendo el tipo:
 *
 * 1. `subject_type` tiene TRES estados, no dos — y el tercero (ausente) es el
 *    que sirve producción hoy.
 * 2. La lista de tipos destacables es un contrato con el CHECK de la tabla Y
 *    con el registro de descriptores del BE. Un tipo que esté en un lado y no
 *    en el otro es una fila que guarda bien y no renderiza nada.
 */

describe("FEATURED_SUBJECT_TYPES (contrato con mini-back)", () => {
  it("son exactamente los seis tipos con descriptor en el BE", () => {
    expect([...FEATURED_SUBJECT_TYPES]).toEqual([
      "gallery",
      "event",
      "program",
      "subprogram",
      "blog_post",
      "bulletin",
    ]);
  });

  it("no tiene duplicados", () => {
    expect(new Set(FEATURED_SUBJECT_TYPES).size).toBe(FEATURED_SUBJECT_TYPES.length);
  });
});

describe("HomeFeaturedSlidePublicV2", () => {
  it("acepta un slide legacy SIN subject_type", () => {
    /**
     * Verificado contra producción el 2026-08-08: mientras no exista ninguna
     * fila de curaduría, el carrusel sigue sirviendo los slides escritos a mano
     * desde el JSONB de la sección, y esos NO llevan la clave.
     *
     * Si este tipo exigiera `subject_type`, todo consumidor tipado rompería
     * contra el payload que hoy está vivo.
     */
    const legacy: HomeFeaturedSlidePublicV2 = {
      id: "hero-1",
      href: "/es/blog/independencia",
      image: { url: "https://cdn.example.org/a.jpg" },
      eyebrow: null,
      title: "MÉXICO: INDEPENDENCIA POLÍTICA",
      description: null,
      link_label: null,
      image_alt: "Portada",
    };
    expect(legacy.subject_type).toBeUndefined();
  });

  it("distingue un slide manual curado (null) de uno de entidad", () => {
    const manual: HomeFeaturedSlidePublicV2 = {
      id: "0d1c…",
      href: "https://www.gob.mx/tramite",
      image: { url: null },
      eyebrow: null,
      title: "Trámite externo",
      description: null,
      link_label: null,
      image_alt: "Trámite externo",
      subject_type: null,
    };
    const entity: HomeFeaturedSlidePublicV2 = { ...manual, subject_type: "gallery" };

    // El patrón correcto de narrowing: `?? null` colapsa ausente y null, que
    // para el render son lo mismo — "no hay entidad detrás".
    expect(manual.subject_type ?? null).toBeNull();
    expect(entity.subject_type ?? null).toBe<FeaturedSubjectType | null>("gallery");
  });
});

describe("HomeFeaturedItemV2", () => {
  it("separa la intención del editor (enabled) del resultado (live)", () => {
    /**
     * Una fila habilitada puede NO estar en la página: ventana sin abrir,
     * evento ya pasado (expiran solos 24h después de end_date ?? event_date),
     * o contenido despublicado. Confundir ambos campos es prometerle al editor
     * que publicó algo que nadie ve.
     */
    const promovidoPeroInvisible: HomeFeaturedItemV2 = {
      uuid: "aaaa-bbbb",
      subject_type: "event",
      subject_uuid: "cccc-dddd",
      rank: 0,
      enabled: true,
      starts_at: null,
      ends_at: null,
      override_title: null,
      override_summary: null,
      override_image: null,
      override_href: null,
      live: false,
      resolved: null,
    };
    expect(promovidoPeroInvisible.enabled).toBe(true);
    expect(promovidoPeroInvisible.live).toBe(false);
  });

  it("una fila manual lleva su propio título y puede apuntar afuera", () => {
    const legacyExterno: HomeFeaturedItemV2Request = {
      subject_type: null,
      subject_uuid: null,
      override_title: "Convocatoria histórica",
      override_href: "https://legacy.example.org/2019/convocatoria",
    };
    expect(legacyExterno.subject_type).toBeNull();
    expect(legacyExterno.override_href).toMatch(/^https:\/\//);
  });
});

describe("endpoints de destacados", () => {
  it("crear y listar comparten path; el verbo los distingue", () => {
    expect(V2_ENDPOINTS.HOME_FEATURED_LIST).toBe("/home/featured");
    expect(V2_ENDPOINTS.HOME_FEATURED_CREATE).toBe("/home/featured");
  });

  it("interpola el uuid", () => {
    expect(endpoint(V2_ENDPOINTS.HOME_FEATURED_REPLACE, { uuid: "abc-123" })).toBe(
      "/home/featured/abc-123",
    );
    expect(endpoint(V2_ENDPOINTS.HOME_FEATURED_DELETE, { uuid: "abc-123" })).toBe(
      "/home/featured/abc-123",
    );
  });

  it("reorder NO colisiona con el path de {uuid}", () => {
    // `/home/featured/reorder` debe seguir siendo una ruta propia; si alguien
    // la reescribe como {uuid}, un POST de reorden se leería como un uuid.
    expect(V2_ENDPOINTS.HOME_FEATURED_REORDER).toBe("/home/featured/reorder");
  });
});

// Demo sample data in case the Google Sheet ID is empty or during preview/testing
export const DEFAULT_SHEET_ID = '';

export const SAMPLE_CSV = `Marca temporal,Nombre y Apellidos,Profesores de Estadística,Profesores de Informática
2026-10-01 10:14:22,Álvaro Gómez Moreno,"Maria Teresa González (ESTD, CEST, MEA) -- Jubilado, Francisco Javier Martín (MIP, ESTD, BIO)","David Romero (BD, IS, ADA), Elena Ruiz (SO, RED)"
2026-10-01 10:18:05,Lucía Hernández Sánchez,"Maria Teresa González (ESTD, CEST, MEA) -- Jubilado, Roberto Santos (IO, SIM)","Elena Ruiz (SO, RED), Carlos Mendoza (POO, ED)"
2026-10-01 10:25:40,Carlos Delgado Ruiz,"Ana Belén Cabrera (PE, AP), Francisco Javier Martín (MIP, ESTD, BIO)","David Romero (BD, IS, ADA), Carlos Mendoza (POO, ED)"
2026-10-01 11:02:11,Marta Gil Morales,"Maria Teresa González (ESTD, CEST, MEA) -- Jubilado, Ana Belén Cabrera (PE, AP)","Elena Ruiz (SO, RED), Beatriz Salazar (TALF, COMP)"
2026-10-01 11:45:30,Javier Ortiz Navarro,"Francisco Javier Martín (MIP, ESTD, BIO), Roberto Santos (IO, SIM)","David Romero (BD, IS, ADA), Elena Ruiz (SO, RED)"
2026-10-01 12:10:15,Sara Ramos Castro,"Ana Belén Cabrera (PE, AP), Maria Teresa González (ESTD, CEST, MEA) -- Jubilado","Carlos Mendoza (POO, ED), David Romero (BD, IS, ADA)"
2026-10-01 12:55:00,Diego Morales Blanco,"Pablo Vega (ESTD, ANMULT) -- Cambio de Adscripción, Roberto Santos (IO, SIM)","David Romero (BD, IS, ADA), Elena Ruiz (SO, RED), Beatriz Salazar (TALF, COMP)"
2026-10-01 13:20:44,Paula Iglesias Lozano,"Maria Teresa González (ESTD, CEST, MEA) -- Jubilado, Francisco Javier Martín (MIP, ESTD, BIO)","Elena Ruiz (SO, RED), Carlos Mendoza (POO, ED)"
2026-10-01 14:05:12,Marcos Serrano Cano,"Roberto Santos (IO, SIM), Ana Belén Cabrera (PE, AP)","David Romero (BD, IS, ADA), Elena Ruiz (SO, RED)"
2026-10-01 15:30:20,Laura Garrido Marín,"Maria Teresa González (ESTD, CEST, MEA) -- Jubilado, Pablo Vega (ESTD, ANMULT) -- Cambio de Adscripción","Carlos Mendoza (POO, ED), Beatriz Salazar (TALF, COMP)"
2026-10-01 16:15:33,Álvaro Gómez Moreno,"Maria Teresa González (ESTD, CEST, MEA) -- Jubilado, Francisco Javier Martín (MIP, ESTD, BIO)","David Romero (BD, IS, ADA)"
`;

export function buildGoogleSheetUrl(sheetId: string, sheetName: string = 'Respuestas de formulario 1'): string {
  const cleanId = sheetId.trim();
  const encodedSheet = encodeURIComponent(sheetName.trim());
  return `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
}

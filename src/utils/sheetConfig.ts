// Default Google Sheet URL & IDs
export const DEFAULT_SHEET_ID = '1ywjmWhhdcYyi4LEz-OfSex3UlFai2gJohdj5owDKr-Y';
export const DEFAULT_SHEET_GID = '1484206016';

export function buildGoogleSheetUrl(sheetId: string = DEFAULT_SHEET_ID, gid: string = DEFAULT_SHEET_GID): string {
  const cleanId = sheetId.trim() || DEFAULT_SHEET_ID;
  const cleanGid = gid.trim() || DEFAULT_SHEET_GID;
  return `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&gid=${cleanGid}`;
}

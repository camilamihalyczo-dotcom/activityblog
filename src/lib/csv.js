// Parser de CSV genérico (RFC4180-ish): soporta campos entre comillas con
// comas y saltos de línea adentro, y comillas escapadas como "".
// Se usa para importar contenido pegado desde Excel/Sheets o exportado de
// NotebookLM. Devuelve un array de filas, cada fila un array de strings.
export function parseCSVRows(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char === '\r') {
      // el \n que sigue cierra la fila, así que este se ignora
    } else {
      field += char
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

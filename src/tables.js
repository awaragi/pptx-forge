// Table rendering functions — uses slide.addTable() (pptxgenjs native).
// Export makeTables(theme, prim) to get the tables group.

import { on } from './primitives.js';

export function makeTables(theme, prim) {

  // dataTable — standard table with header row and alternating data rows
  function dataTable(slide, box, { headers, rows = [] }, opts = {}, name) {
    const { x, y, w } = box;
    const dt = theme.shape.dataTable;
    const {
      headerBgColor   = dt.headerBgColor,
      headerTextColor = dt.headerTextColor,
      rowBgColor      = dt.rowBgColor,
      altBgColor      = dt.altBgColor,
      borderColor     = dt.borderColor,
      textColor       = dt.textColor,
      fontSize        = theme.size.badge,
      rowH            = 0.36,
    } = opts;

    const colCount = headers.length;
    const colW = w / colCount;
    const cellBorder = { type: 'solid', pt: 0.5, color: borderColor };

    const headerRow = headers.map(h => ({
      text: h,
      options: {
        fill: headerBgColor,
        color: headerTextColor,
        bold: true,
        align: 'center',
        valign: 'middle',
        fontFace: theme.font.body,
        fontSize,
        border: cellBorder,
      },
    }));

    const dataRows = rows.map((row, ri) =>
      row.map(cell => ({
        text: String(cell ?? ''),
        options: {
          fill: ri % 2 === 0 ? rowBgColor : altBgColor,
          color: textColor,
          align: 'left',
          valign: 'middle',
          fontFace: theme.font.body,
          fontSize,
          border: cellBorder,
        },
      })),
    );

    slide.addTable([headerRow, ...dataRows], {
      x, y, w,
      colW: Array(colCount).fill(colW),
      rowH,
      ...on(name),
    });
  }

  // comparisonTable — header + criteria rows; first column is wide criteria label
  // headers: string[] — first entry is the criteria column label
  // rows: string[][] — first element per row is criteria, rest are values (supports UTF-8 symbols)
  function comparisonTable(slide, box, { headers, rows = [] }, opts = {}, name) {
    const { x, y, w } = box;
    const ct = theme.shape.comparisonTable;
    const {
      headerBgColor   = ct.headerBgColor,
      headerTextColor = ct.headerTextColor,
      criteriaColor   = ct.criteriaColor,
      valueColor      = ct.valueColor,
      borderColor     = ct.borderColor,
      criteriaW       = 2.5,
      fontSize        = theme.size.badge,
      rowH            = 0.36,
    } = opts;

    const valueColCount = Math.max(0, headers.length - 1);
    const valueColW = valueColCount > 0 ? (w - criteriaW) / valueColCount : w;
    const colWs = [criteriaW, ...Array(valueColCount).fill(valueColW)];
    const cellBorder = { type: 'solid', pt: 0.5, color: borderColor };

    const headerRow = headers.map((h, i) => ({
      text: h,
      options: {
        fill: headerBgColor,
        color: headerTextColor,
        bold: true,
        align: i === 0 ? 'left' : 'center',
        valign: 'middle',
        fontFace: theme.font.body,
        fontSize,
        border: cellBorder,
      },
    }));

    const dataRows = rows.map(row =>
      row.map((cell, ci) => ({
        text: String(cell ?? ''),
        options: {
          fill: 'bg1',
          color: ci === 0 ? criteriaColor : valueColor,
          bold: ci === 0,
          align: ci === 0 ? 'left' : 'center',
          valign: 'middle',
          fontFace: theme.font.body,
          fontSize,
          border: cellBorder,
        },
      })),
    );

    slide.addTable([headerRow, ...dataRows], {
      x, y, w,
      colW: colWs,
      rowH,
      ...on(name),
    });
  }

  return { dataTable, comparisonTable };
}

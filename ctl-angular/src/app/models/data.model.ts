import * as ExcelJS from 'exceljs';

export type Workbook = ExcelJS.Workbook
export type WorkbookModel = ExcelJS.WorkbookModel;
export type WorksheetModel = ExcelJS.WorksheetModel;

export type NewsItem = {
  id: string;
  description: string;
  photoSrc: string;
}

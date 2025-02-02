import xlsx from "xlsx";
import fs from "fs";
import libreConvert from "libreoffice-convert";

export const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { defval: null });
};

export const parseCsv = (filePath) => {
  const data = fs.readFileSync(filePath, "utf8");
  const [headerLine, ...lines] = data.split("\n").filter(Boolean);
  const headers = headerLine.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim() || null;
      return obj;
    }, {});
  });
};

export const convertOdsToXlsx = (odsPath, xlsxPath) => {
  const data = fs.readFileSync(odsPath);
  return new Promise((resolve, reject) => {
    libreConvert.convert(data, ".xlsx", undefined, (err, result) => {
      if (err) reject(err);
      fs.writeFileSync(xlsxPath, result);
      resolve(xlsxPath);
    });
  });
};

export const parseOds = async (odsFilePath) => {
  const convertedPath = odsFilePath.replace(".ods", ".xlsx");
  await convertOdsToXlsx(odsFilePath, convertedPath);
  return parseExcel(convertedPath);
};

export const parseTestCases = async (filePath) => {
  const ext = filePath.split(".").pop().toLowerCase();

  if (ext === "xlsx" || ext === "xls") return parseExcel(filePath);
  if (ext === "ods") return await parseOds(filePath);
  if (ext === "csv") return parseCsv(filePath);

  throw new Error(
    "Unsupported file format. Supported formats: .xlsx, .xls, .ods, .csv"
  );
};

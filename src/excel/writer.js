import fs from "fs";
import xlsx from "xlsx";
import libreConvert from "libreoffice-convert";

/**
 * Writes test results to the specified format.
 *
 * @param {string} inputFile - The original test case file path.
 * @param {string} outputFormat - Desired output format (xlsx, csv, ods).
 * @param {Array} results - The array of test results.
 */
export const writeResults = async (inputFile, outputFormat, results) => {
  const outputFilePath = inputFile.replace(
    /\.\w+$/,
    `-results.${outputFormat}`
  );

  // Prepare the data for writing
  const dataToWrite = results.map((result) => ({
    Description: result.description,
    Pass: result.pass ? "Pass" : "Fail",
    Error: result.error || "",
  }));

  // Handle different output formats
  switch (outputFormat.toLowerCase()) {
    case "xlsx":
      writeExcel(outputFilePath, dataToWrite);
      break;
    case "csv":
      writeCSV(outputFilePath, dataToWrite);
      break;
    case "ods":
      await writeODS(outputFilePath, dataToWrite);
      break;
    default:
      console.error(`Unsupported output format: ${outputFormat}`);
  }

  console.log(`Results written to ${outputFilePath}`);
};

const writeExcel = (filePath, data) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Test Results");
  xlsx.writeFile(workbook, filePath);
};

const writeCSV = (filePath, data) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const csvData = xlsx.utils.sheet_to_csv(worksheet);
  fs.writeFileSync(filePath, csvData);
};

const writeODS = async (filePath, data) => {
  const tempXlsxPath = filePath.replace(".ods", ".xlsx");
  writeExcel(tempXlsxPath, data);

  const xlsxBuffer = fs.readFileSync(tempXlsxPath);
  await new Promise((resolve, reject) => {
    libreConvert.convert(xlsxBuffer, ".ods", undefined, (err, odsBuffer) => {
      if (err) return reject(err);
      fs.writeFileSync(filePath, odsBuffer);
      fs.unlinkSync(tempXlsxPath); // Clean up the temporary XLSX file
      resolve();
    });
  });
};

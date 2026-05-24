/**
 * CarRadar — Google Sheets club member + image exporter
 * ---------------------------------------------------------------------------
 * COPY THIS ENTIRE FILE into Google Sheets:
 *   Extensions → Apps Script → paste → Save → reload spreadsheet
 *
 * NOT Node.js — do not import into the Next.js app.
 *
 * Optional (better in-cell image support):
 *   Apps Script editor → Services (+) → Google Sheets API → Enable
 *   Then set USE_SHEETS_API = true below.
 */

// --- Configure per club / spreadsheet tab -----------------------------------
const CLUB_ID = "wbn";
const CLUB_NAME = "WBN";

/** Set true if "Google Sheets API" advanced service is enabled in Apps Script */
const USE_SHEETS_API = false;

const EXPORT_ROOT_FOLDER_NAME = "CarRadar Exports";
const HEADER_ROW = 1;
const DATA_START_ROW = 2;
const EXPECTED_HEADERS = ["Instagram", "Car Model", "Photo", "Location"];

// --- Menu -------------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("CarRadar Export")
    .addItem("Export active sheet", "exportActiveSheet")
    .addItem("Export active sheet images only", "exportActiveSheetImagesOnly")
    .addToUi();
}

function exportActiveSheet() {
  runExport({ imagesOnly: false });
}

function exportActiveSheetImagesOnly() {
  runExport({ imagesOnly: true });
}

// --- Main export ------------------------------------------------------------
function runExport(options) {
  options = options || { imagesOnly: false };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  try {
    validateHeaders(sheet);
  } catch (e) {
    ui.alert("CarRadar Export", String(e.message || e), ui.ButtonSet.OK);
    return;
  }

  const cols = getColumnMap(sheet);
  const clubFolder = getOrCreateClubExportFolder(CLUB_ID);
  const imagesFolder = getOrCreateSubfolder(clubFolder, "images");

  const lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) {
    ui.alert("CarRadar Export", "No data rows found.", ui.ButtonSet.OK);
    return;
  }

  const numRows = lastRow - HEADER_ROW;
  const values = sheet.getRange(DATA_START_ROW, 1, numRows, EXPECTED_HEADERS.length).getValues();
  const formulas = sheet
    .getRange(DATA_START_ROW, 1, numRows, EXPECTED_HEADERS.length)
    .getFormulas();

  const overGridByCell = indexOverGridImages(sheet);
  const rows = [];
  let exportedImages = 0;
  let missingImages = 0;
  let errors = 0;

  for (var i = 0; i < values.length; i++) {
    const sheetRow = DATA_START_ROW + i;
    const rowValues = values[i];
    const rowFormulas = formulas[i];

    try {
      const instagramRaw = String(rowValues[cols.instagram - 1] || "").trim();
      if (!instagramRaw) {
        continue; // skip empty rows
      }

      const handle = normalizeInstagramHandle(instagramRaw);
      if (!handle) {
        rows.push(buildErrorRow(sheetRow, "Invalid Instagram handle"));
        errors++;
        continue;
      }

      const memberId = CLUB_ID + "-" + slugifyHandle(handle);
      const carModelRaw = String(rowValues[cols.carModel - 1] || "").trim();
      const locationRaw = String(rowValues[cols.location - 1] || "").trim();
      const photoCol = cols.photo;
      const photoValue = String(rowValues[photoCol - 1] || "").trim();
      const photoFormula = String(rowFormulas[photoCol - 1] || "").trim();

      const car = parseCarModel(carModelRaw, handle);
      const loc = parseLocation(locationRaw);

      let imageResult = {
        imageFileName: "",
        imageDriveUrl: "",
        imageStatus: "missing",
        notes: "",
      };

      if (!options.imagesOnly) {
        imageResult = extractAndSavePhoto({
          sheet: sheet,
          spreadsheet: ss,
          sheetRow: sheetRow,
          photoCol: photoCol,
          photoValue: photoValue,
          photoFormula: photoFormula,
          memberId: memberId,
          imagesFolder: imagesFolder,
          overGridByCell: overGridByCell,
        });

        if (imageResult.imageStatus === "exported") {
          exportedImages++;
        } else if (imageResult.imageStatus === "missing") {
          missingImages++;
        } else if (imageResult.imageStatus === "error") {
          errors++;
        }
      } else {
        imageResult = extractAndSavePhoto({
          sheet: sheet,
          spreadsheet: ss,
          sheetRow: sheetRow,
          photoCol: photoCol,
          photoValue: photoValue,
          photoFormula: photoFormula,
          memberId: memberId,
          imagesFolder: imagesFolder,
          overGridByCell: overGridByCell,
        });
        if (imageResult.imageStatus === "exported") exportedImages++;
        else if (imageResult.imageStatus === "missing") missingImages++;
        else if (imageResult.imageStatus === "error") errors++;

        rows.push({
          id: memberId,
          instagramHandle: handle,
          imageFileName: imageResult.imageFileName,
          imageDriveUrl: imageResult.imageDriveUrl,
          imageStatus: imageResult.imageStatus,
          notes: imageResult.notes,
        });
        continue;
      }

      rows.push({
        id: memberId,
        clubId: CLUB_ID,
        clubName: CLUB_NAME,
        displayName: "@" + handle,
        instagramHandle: handle,
        instagram: "https://instagram.com/" + handle,
        carName: car.carName,
        carMake: car.carMake,
        carModel: car.carModel,
        city: loc.city,
        country: loc.country,
        area: loc.area,
        imageFileName: imageResult.imageFileName,
        imageDriveUrl: imageResult.imageDriveUrl,
        imageStatus: imageResult.imageStatus,
        notes: imageResult.notes,
        sheetRow: sheetRow,
      });
    } catch (rowErr) {
      errors++;
      rows.push(buildErrorRow(sheetRow, String(rowErr.message || rowErr)));
      Logger.log("Row " + sheetRow + " error: " + rowErr);
    }
  }

  if (!options.imagesOnly) {
    writeExportSheet(ss, rows);
    writeJsonFile(clubFolder, CLUB_ID + "-members-export.json", {
      clubId: CLUB_ID,
      clubName: CLUB_NAME,
      exportedAt: new Date().toISOString(),
      members: rows.filter(function (r) {
        return r.clubId;
      }),
    });
    writeCsvFile(clubFolder, CLUB_ID + "-members-export.csv", rows);
  }

  const summary =
    "CarRadar export complete\n\n" +
    "Club: " +
    CLUB_NAME +
    " (" +
    CLUB_ID +
    ")\n" +
    "Sheet: " +
    sheet.getName() +
    "\n" +
    "Total rows processed: " +
    rows.length +
    "\n" +
    "Images exported: " +
    exportedImages +
    "\n" +
    "Missing images: " +
    missingImages +
    "\n" +
    "Errors: " +
    errors +
    "\n\n" +
    "Drive folder:\n" +
    clubFolder.getUrl();

  Logger.log(summary);
  ui.alert("CarRadar Export", summary, ui.ButtonSet.OK);
}

// --- Headers / columns ------------------------------------------------------
function validateHeaders(sheet) {
  const header = sheet
    .getRange(HEADER_ROW, 1, 1, EXPECTED_HEADERS.length)
    .getValues()[0]
    .map(function (h) {
      return String(h || "").trim();
    });
  for (var i = 0; i < EXPECTED_HEADERS.length; i++) {
    if (header[i] !== EXPECTED_HEADERS[i]) {
      throw new Error(
        "Row 1 must be exactly: " +
          EXPECTED_HEADERS.join(" | ") +
          "\nFound: " +
          header.join(" | ")
      );
    }
  }
}

function getColumnMap(sheet) {
  return {
    instagram: 1,
    carModel: 2,
    photo: 3,
    location: 4,
  };
}

// --- Instagram / IDs --------------------------------------------------------
function normalizeInstagramHandle(raw) {
  var s = String(raw || "").trim();
  if (!s) return "";
  s = s.replace(/^@+/, "");
  // Full URL
  var urlMatch = s.match(/instagram\.com\/([^/?#]+)/i);
  if (urlMatch) s = urlMatch[1];
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/^www\./i, "");
  s = s.split("?")[0].split("#")[0];
  s = s.replace(/\/+$/, "");
  if (s.indexOf("/") !== -1) {
    var parts = s.split("/").filter(Boolean);
    s = parts[parts.length - 1];
  }
  return s.replace(/^@+/, "").trim();
}

function slugifyHandle(handle) {
  return String(handle)
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- Car parsing ------------------------------------------------------------
function parseCarModel(carModelRaw, handle) {
  var carName = String(carModelRaw || "").trim();
  var carMake = "";
  var carModel = "";

  if (!carName) {
    return { carName: "", carMake: "", carModel: "" };
  }

  var upper = carName.toUpperCase();

  // Special case: sheet uses CIVIC Type R without make
  if (upper.indexOf("CIVIC") !== -1 && upper.indexOf("TYPE R") !== -1) {
    return {
      carName: carName,
      carMake: "Honda",
      carModel: "Civic Type R",
    };
  }

  var knownMakes = [
    "Audi",
    "BMW",
    "Mercedes",
    "Mercedes-Benz",
    "Volkswagen",
    "VW",
    "Porsche",
    "Mini",
    "Honda",
    "Toyota",
    "Nissan",
    "Ford",
    "Chevrolet",
    "Dodge",
    "Subaru",
    "Mazda",
  ];

  for (var i = 0; i < knownMakes.length; i++) {
    var make = knownMakes[i];
    if (upper.indexOf(make.toUpperCase()) === 0) {
      carMake = make === "VW" ? "Volkswagen" : make;
      carModel = carName.substring(make.length).trim();
      if (make === "Mercedes-Benz" && carModel) {
        carMake = "Mercedes-Benz";
      }
      return { carName: carName, carMake: carMake, carModel: carModel };
    }
  }

  // Mini as word (case-sensitive brand)
  if (/^Mini\b/i.test(carName)) {
    return {
      carName: carName,
      carMake: "Mini",
      carModel: carName.replace(/^Mini\s*/i, "").trim(),
    };
  }

  return { carName: carName, carMake: carMake, carModel: carModel };
}

// --- Location ---------------------------------------------------------------
function parseLocation(locationRaw) {
  var s = String(locationRaw || "").trim();
  if (!s) {
    return { city: "", country: "", area: "" };
  }
  var parts = s.split(",").map(function (p) {
    return p.trim();
  });
  var city = parts[0] || "";
  var country = parts.length > 1 ? parts.slice(1).join(", ") : "";
  var area = country ? city + " / " + country : city;
  return { city: city, country: country, area: area };
}

// --- Image extraction -------------------------------------------------------
function indexOverGridImages(sheet) {
  var map = {};
  var images = sheet.getImages();
  for (var i = 0; i < images.length; i++) {
    try {
      var anchor = images[i].getAnchorCell();
      var key = anchor.getRow() + ":" + anchor.getColumn();
      if (!map[key]) map[key] = [];
      map[key].push(images[i]);
    } catch (e) {
      Logger.log("Over-grid index skip: " + e);
    }
  }
  return map;
}

/**
 * Tries, in order:
 * A) In-cell image (Sheets API advanced service, if enabled)
 * B) Over-grid image anchored on Photo cell
 * C) IMAGE() formula URL in Photo cell
 * D) Plain http(s) URL or Drive file link in Photo cell value
 */
function extractAndSavePhoto(ctx) {
  var result = {
    imageFileName: "",
    imageDriveUrl: "",
    imageStatus: "missing",
    notes: "",
  };

  var blob = null;
  var sourceNote = "";

  // C) IMAGE() formula
  if (!blob && ctx.photoFormula) {
    var formulaUrl = extractUrlFromImageFormula(ctx.photoFormula);
    if (formulaUrl) {
      blob = fetchImageBlob(formulaUrl);
      sourceNote = "IMAGE() formula";
    }
  }

  // D) Plain URL / Drive link in cell value
  if (!blob && ctx.photoValue) {
    if (/^https?:\/\//i.test(ctx.photoValue)) {
      blob = fetchImageBlob(ctx.photoValue);
      sourceNote = "cell URL text";
    } else {
      var driveBlob = tryDriveLinkBlob(ctx.photoValue);
      if (driveBlob) {
        blob = driveBlob;
        sourceNote = "Drive link";
      }
    }
  }

  // B) Over-grid image on Photo column
  if (!blob) {
    var key = ctx.sheetRow + ":" + ctx.photoCol;
    var list = ctx.overGridByCell[key] || [];
    for (var i = 0; i < list.length && !blob; i++) {
      blob = tryOverGridImageBlob(list[i]);
      if (blob) sourceNote = "over-grid image";
    }
  }

  // A) In-cell image via Sheets API (optional)
  if (!blob && USE_SHEETS_API) {
    var apiBlob = trySheetsApiCellImage(ctx.spreadsheet, ctx.sheet, ctx.sheetRow, ctx.photoCol);
    if (apiBlob) {
      blob = apiBlob;
      sourceNote = "in-cell image (Sheets API)";
    }
  }

  // Try in-cell via getContentUrl on rich value (newer Sheets; may throw)
  if (!blob) {
    try {
      var range = ctx.sheet.getRange(ctx.sheetRow, ctx.photoCol);
      var url = tryCellContentUrl(range);
      if (url) {
        blob = fetchImageBlob(url);
        sourceNote = "cell content URL";
      }
    } catch (e) {
      // ignore
    }
  }

  if (!blob) {
    result.notes = "No extractable image (placeholder text or unsupported embed)";
    return result;
  }

  try {
    var ext = guessExtension(blob.getContentType());
    var fileName = ctx.memberId + ext;
    var existing = findFileInFolder(ctx.imagesFolder, fileName);
    var file;
    if (existing) {
      existing.setContent(blob.getBytes());
      file = existing;
    } else {
      file = ctx.imagesFolder.createFile(blob).setName(fileName);
    }
    result.imageFileName = fileName;
    result.imageDriveUrl = file.getUrl();
    result.imageStatus = "exported";
    result.notes = sourceNote;
  } catch (saveErr) {
    result.imageStatus = "error";
    result.notes = "Save failed: " + saveErr;
  }

  return result;
}

function extractUrlFromImageFormula(formula) {
  if (!formula) return null;
  var m = formula.match(/IMAGE\s*\(\s*["']([^"']+)["']/i);
  if (m) return m[1];
  m = formula.match(/https?:\/\/[^\s"')]+/i);
  return m ? m[0] : null;
}

function fetchImageBlob(url) {
  try {
    var resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
    });
    if (resp.getResponseCode() >= 400) return null;
    return resp.getBlob();
  } catch (e) {
    Logger.log("UrlFetch failed: " + url + " — " + e);
    return null;
  }
}

function tryDriveLinkBlob(value) {
  try {
    var idMatch = String(value).match(/[-\w]{25,}/);
    if (!idMatch) return null;
    var file = DriveApp.getFileById(idMatch[0]);
    return file.getBlob();
  } catch (e) {
    return null;
  }
}

function tryOverGridImageBlob(image) {
  try {
    // Some Workspace builds expose getBlob on OverGridImage
    if (typeof image.getBlob === "function") {
      return image.getBlob();
    }
  } catch (e) {
    Logger.log("OverGrid getBlob: " + e);
  }
  return null;
}

function tryCellContentUrl(range) {
  try {
    // Experimental: not available in all accounts
    if (typeof range.getContentUrl === "function") {
      return range.getContentUrl();
    }
  } catch (e) {
    return null;
  }
  return null;
}

function trySheetsApiCellImage(spreadsheet, sheet, row, col) {
  if (typeof Sheets === "undefined") return null;
  try {
    var a1 = sheet.getRange(row, col).getA1Notation();
    var resp = Sheets.Spreadsheets.get(spreadsheet.getId(), {
      ranges: [sheet.getName() + "!" + a1],
      fields: "sheets/data/rowData/values",
    });
    var rowData =
      resp.sheets &&
      resp.sheets[0] &&
      resp.sheets[0].data &&
      resp.sheets[0].data[0] &&
      resp.sheets[0].data[0].rowData &&
      resp.sheets[0].data[0].rowData[0];
    if (!rowData || !rowData.values || !rowData.values[0]) return null;
    var cell = rowData.values[0];
    if (cell.image && cell.image.sourceUri) {
      return fetchImageBlob(cell.image.sourceUri);
    }
  } catch (e) {
    Logger.log("Sheets API image: " + e);
  }
  return null;
}

function guessExtension(contentType) {
  var ct = String(contentType || "").toLowerCase();
  if (ct.indexOf("jpeg") !== -1 || ct.indexOf("jpg") !== -1) return ".jpg";
  if (ct.indexOf("webp") !== -1) return ".webp";
  if (ct.indexOf("gif") !== -1) return ".gif";
  return ".png";
}

// --- Drive / output ---------------------------------------------------------
function getOrCreateClubExportFolder(clubId) {
  var root = getOrCreateFolderByName(null, EXPORT_ROOT_FOLDER_NAME);
  return getOrCreateSubfolder(root, clubId);
}

function getOrCreateSubfolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

function getOrCreateFolderByName(parent, name) {
  if (!parent) {
    var rootIter = DriveApp.getFoldersByName(name);
    if (rootIter.hasNext()) return rootIter.next();
    return DriveApp.createFolder(name);
  }
  var childIter = parent.getFoldersByName(name);
  if (childIter.hasNext()) return childIter.next();
  return parent.createFolder(name);
}

function findFileInFolder(folder, name) {
  var files = folder.getFilesByName(name);
  if (files.hasNext()) return files.next();
  return null;
}

function writeExportSheet(spreadsheet, rows) {
  var name = "export_" + CLUB_ID;
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  sheet.clear();
  var headers = [
    "id",
    "clubId",
    "clubName",
    "displayName",
    "instagramHandle",
    "instagram",
    "carName",
    "carMake",
    "carModel",
    "city",
    "country",
    "area",
    "imageFileName",
    "imageDriveUrl",
    "imageStatus",
    "notes",
    "sheetRow",
  ];
  var data = [headers];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    data.push([
      r.id || "",
      r.clubId || "",
      r.clubName || "",
      r.displayName || "",
      r.instagramHandle || "",
      r.instagram || "",
      r.carName || "",
      r.carMake || "",
      r.carModel || "",
      r.city || "",
      r.country || "",
      r.area || "",
      r.imageFileName || "",
      r.imageDriveUrl || "",
      r.imageStatus || "",
      r.notes || "",
      r.sheetRow || "",
    ]);
  }
  sheet.getRange(1, 1, data.length, headers.length).setValues(data);
  sheet.setFrozenRows(1);
}

function writeJsonFile(folder, fileName, obj) {
  var json = JSON.stringify(obj, null, 2);
  var blob = Utilities.newBlob(json, "application/json", fileName);
  replaceOrCreateFile(folder, fileName, blob);
}

function writeCsvFile(folder, fileName, rows) {
  var headers = [
    "id",
    "clubId",
    "clubName",
    "displayName",
    "instagramHandle",
    "instagram",
    "carName",
    "carMake",
    "carModel",
    "city",
    "country",
    "area",
    "imageFileName",
    "imageDriveUrl",
    "imageStatus",
    "notes",
    "sheetRow",
  ];
  var lines = [headers.join(",")];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r.clubId && !r.instagramHandle) continue;
    lines.push(
      [
        r.id,
        r.clubId,
        r.clubName,
        r.displayName,
        r.instagramHandle,
        r.instagram,
        r.carName,
        r.carMake,
        r.carModel,
        r.city,
        r.country,
        r.area,
        r.imageFileName,
        r.imageDriveUrl,
        r.imageStatus,
        r.notes,
        r.sheetRow,
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  var blob = Utilities.newBlob(lines.join("\n"), "text/csv", fileName);
  replaceOrCreateFile(folder, fileName, blob);
}

function csvEscape(val) {
  var s = String(val == null ? "" : val);
  if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function replaceOrCreateFile(folder, fileName, blob) {
  var existing = findFileInFolder(folder, fileName);
  if (existing) {
    existing.setContent(blob.getBytes());
    return existing;
  }
  return folder.createFile(blob);
}

function buildErrorRow(sheetRow, message) {
  return {
    id: "",
    clubId: CLUB_ID,
    clubName: CLUB_NAME,
    displayName: "",
    instagramHandle: "",
    instagram: "",
    carName: "",
    carMake: "",
    carModel: "",
    city: "",
    country: "",
    area: "",
    imageFileName: "",
    imageDriveUrl: "",
    imageStatus: "error",
    notes: "Row " + sheetRow + ": " + message,
    sheetRow: sheetRow,
  };
}

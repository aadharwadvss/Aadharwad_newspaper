const { google } = require("googleapis");
const stream = require("stream");
const path = require("path");

// Use a Service Account JSON file for authentication
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: auth,
});

class DriveService {
  async uploadFile(buffer, name, mimeType) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID ? process.env.GOOGLE_DRIVE_FOLDER_ID.trim() : "";

      const res = await drive.files.create({
        requestBody: {
          name,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType,
          body: bufferStream,
        },
        fields: "id, name, size, webViewLink",
        supportsAllDrives: true
      });

      // make public
      await drive.permissions.create({
        fileId: res.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true
      });

      return res.data;
    } catch (err) {
      console.error("Drive upload error FULL:", err);
      throw err;
    }
  }

  getPreviewUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  getDownloadUrl(fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  async deleteFile(fileId) {
    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (err) {
      console.error("Drive delete error:", err);
      throw err;
    }
  }
}

module.exports = new DriveService();

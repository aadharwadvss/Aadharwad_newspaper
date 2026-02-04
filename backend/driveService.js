const { google } = require("googleapis");
const stream = require("stream");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

class DriveService {
  async uploadFile(buffer, name, mimeType) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      const res = await drive.files.create({
        requestBody: {
          name,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        },
        media: {
          mimeType,
          body: bufferStream,
        },
        fields: "id, name, size, webViewLink",
      });

      // make public
      await drive.permissions.create({
        fileId: res.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
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

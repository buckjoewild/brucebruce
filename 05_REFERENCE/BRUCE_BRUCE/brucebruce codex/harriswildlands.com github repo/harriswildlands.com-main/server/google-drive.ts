// Google Drive Integration for BruceOps
// Connected via Replit connector: google-drive

import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Helper: List files in Drive
export async function listDriveFiles(query?: string) {
  const drive = await getGoogleDriveClient();
  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, modifiedTime, size)',
    orderBy: 'modifiedTime desc',
    pageSize: 50
  });
  return res.data.files || [];
}

// Helper: Upload a file to Drive
export async function uploadToDrive(name: string, content: string, mimeType: string = 'text/plain') {
  const drive = await getGoogleDriveClient();
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType
    },
    media: {
      mimeType,
      body: content
    },
    fields: 'id, name, webViewLink'
  });
  return res.data;
}

// Helper: Download a file from Drive
export async function downloadFromDrive(fileId: string) {
  const drive = await getGoogleDriveClient();
  const res = await drive.files.get({
    fileId,
    alt: 'media'
  }, { responseType: 'text' });
  return res.data;
}

// Helper: Create a folder
export async function createDriveFolder(name: string) {
  const drive = await getGoogleDriveClient();
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id, name, webViewLink'
  });
  return res.data;
}

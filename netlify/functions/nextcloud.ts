/**
 * Netlify Serverless Function for Nextcloud WebDAV Integration
 */

export const handler = async (event: any) => {
  // Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  try {
    let body: any = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        body = {};
      }
    }

    const { nextcloudUrl, username, password } = body;
    if (!nextcloudUrl || !username || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Server URL, username, and app token are required.',
        }),
      };
    }

    const baseUrl = nextcloudUrl.trim().replace(/\/+$/, '');
    const davUrl = `${baseUrl}/remote.php/dav/files/${encodeURIComponent(username.trim())}/`;
    const authHeader = 'Basic ' + Buffer.from(`${username.trim()}:${password.trim()}`).toString('base64');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(davUrl, {
      method: 'PROPFIND',
      signal: controller.signal,
      headers: {
        'Authorization': authHeader,
        'Depth': '0',
        'Content-Type': 'application/xml',
        'User-Agent': 'HMGeomatics-ERP-Client/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok || response.status === 207) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          status: response.status,
          serverReachable: true,
          message: `Verified WebDAV connection to ${baseUrl.replace(/^https?:\/\//, '')}`,
        }),
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          status: response.status,
          serverReachable: true,
          errorType: 'AUTH_FAILED',
          securityUrl: `${baseUrl}/index.php/settings/user/security`,
          error: 'Authentication failed (HTTP 401): Nextcloud requires a dedicated App Password / Token. Master login passwords cannot authenticate WebDAV.',
        }),
      };
    } else if (response.status === 404) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          status: response.status,
          serverReachable: true,
          errorType: 'NOT_FOUND',
          error: `Nextcloud user directory not found at ${davUrl}. Please check the username '${username.trim()}'.`,
        }),
      };
    } else {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          status: response.status,
          serverReachable: true,
          errorType: 'HTTP_ERROR',
          error: `Nextcloud returned HTTP status ${response.status} (${response.statusText || 'Error'})`,
        }),
      };
    }
  } catch (err: any) {
    const isAbort = err.name === 'AbortError';
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        status: 0,
        serverReachable: false,
        errorType: 'NETWORK_ERROR',
        error: isAbort
          ? 'Connection timed out after 10 seconds. Check server URL and network connectivity.'
          : (err.message || 'Unable to establish network connection to host.'),
      }),
    };
  }
};

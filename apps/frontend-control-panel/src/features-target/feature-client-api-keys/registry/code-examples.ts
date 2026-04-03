// Code examples for API integration guide
// These are documentation strings, not UI labels

export const CODE_EXAMPLES = {
  javascript: (
    apiUrl: string,
  ) => `// ============================================
// lib/api.js — API Client Setup
// ============================================
const API_URL = '${apiUrl}/green';
const API_KEY = 'pk_your_api_key_here'; // dari Dashboard > API & Security

// ── Base Fetch Helper ────────────────────────
export async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(\`\${API_URL}\${endpoint}\`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
            ...options.headers,
        },
    });

    const data = await res.json();

    // Handle error response
    if (!res.ok) {
        const errMsg = data?.error?.message || data?.message || 'Request failed';
        throw new Error(errMsg);
    }

    return data; // { status: 'success', data: ... }
}

// ── Auth: Register ───────────────────────────
async function register(username, email, password) {
    const res = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });
    localStorage.setItem('auth_token', res.data.token);
    return res.data; // { token, user: { id, username, email } }
}

// ── Auth: Login ──────────────────────────────
async function login(email, password) {
    const res = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('auth_token', res.data.token);
    return res.data; // { token, user: { id, username, email, role } }
}

// ── Auth: Get Current User ───────────────────
async function getMe() {
    const res = await fetchAPI('/auth/me');
    return res.data; // { id, username, email, role, level, permissions }
}

// ── Auth: Logout ─────────────────────────────
async function logout() {
    await fetchAPI('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
}

// ── Data: Fetch Resource List ────────────────
// Endpoint ditentukan di Dashboard > API Management
async function getProducts(page = 1, limit = 10) {
    const res = await fetchAPI(
        \`/products?page=\${page}&limit=\${limit}\`
    );
    return res.data; // Array of products
}

// ── Data: Fetch Single Item ──────────────────
async function getProduct(id) {
    const res = await fetchAPI(\`/products/\${id}\`);
    return res.data;
}

// ── Data: Create Item ────────────────────────
async function createProduct(product) {
    const res = await fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(product),
    });
    return res.data;
}

// ── Data: Update Item ────────────────────────
async function updateProduct(id, updates) {
    const res = await fetchAPI(\`/products/\${id}\`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return res.data;
}

// ── Data: Delete Item ────────────────────────
async function deleteProduct(id) {
    await fetchAPI(\`/products/\${id}\`, { method: 'DELETE' });
}`,

  flutter: (apiUrl: string) => `// ============================================
// lib/services/api_service.dart — API Client
// ============================================
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = '${apiUrl}/green';
  static const String apiKey = 'pk_your_api_key_here';

  // ── Base Request Helper ──────────────────────
  static Future<Map<String, dynamic>> request(
    String endpoint, {
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    final headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      if (token != null) 'Authorization': 'Bearer \$token',
    };

    late http.Response response;
    final uri = Uri.parse('\$baseUrl\$endpoint');

    switch (method) {
      case 'POST':
        response = await http.post(uri, headers: headers,
          body: body != null ? jsonEncode(body) : null);
        break;
      case 'PUT':
        response = await http.put(uri, headers: headers,
          body: body != null ? jsonEncode(body) : null);
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        response = await http.get(uri, headers: headers);
    }

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400) {
      throw Exception(data['error']?['message'] ?? 'Request failed');
    }
    return data; // { status: 'success', data: ... }
  }

  // ── Auth ─────────────────────────────────────
  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    final res = await request('/auth/login',
        method: 'POST', body: {'email': email, 'password': password});
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', res['data']['token']);
    return res['data'];
  }

  static Future<Map<String, dynamic>> register(
      String username, String email, String password) async {
    final res = await request('/auth/register',
        method: 'POST',
        body: {'username': username, 'email': email, 'password': password});
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', res['data']['token']);
    return res['data'];
  }

  static Future<Map<String, dynamic>> getMe() async {
    final res = await request('/auth/me');
    return res['data'];
  }

  // ── Data Resources ───────────────────────────
  static Future<List> getProducts({int page = 1, int limit = 10}) async {
    final res = await request('/products?page=\$page&limit=\$limit');
    return res['data'] as List;
  }

  static Future<Map<String, dynamic>> createProduct(
      Map<String, dynamic> product) async {
    final res = await request('/products', method: 'POST', body: product);
    return res['data'];
  }
}`,

  reactNative: (
    apiUrl: string,
  ) => `// ============================================
// src/services/api.js — React Native API Client
// ============================================
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = '${apiUrl}/green';
const API_KEY = 'pk_your_api_key_here';

// ── Base Request Helper ────────────────────────
export async function fetchAPI(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('auth_token');

    const response = await fetch(\`\${API_URL}\${endpoint}\`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || 'Request failed');
    }
    return data; // { status: 'success', data: ... }
}

// ── Auth ────────────────────────────────────────
export async function login(email, password) {
    const res = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    await AsyncStorage.setItem('auth_token', res.data.token);
    return res.data; // { token, user }
}

export async function register(username, email, password) {
    const res = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });
    await AsyncStorage.setItem('auth_token', res.data.token);
    return res.data;
}

export async function getMe() {
    const res = await fetchAPI('/auth/me');
    return res.data;
}

export async function logout() {
    await fetchAPI('/auth/logout', { method: 'POST' });
    await AsyncStorage.removeItem('auth_token');
}

// ── Data Resources (CRUD) ───────────────────────
export async function getList(resource, page = 1, limit = 10) {
    const res = await fetchAPI(
        \`/\${resource}?page=\${page}&limit=\${limit}\`
    );
    return res.data;
}

export async function getById(resource, id) {
    const res = await fetchAPI(\`/\${resource}/\${id}\`);
    return res.data;
}

export async function create(resource, body) {
    const res = await fetchAPI(\`/\${resource}\`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return res.data;
}

export async function update(resource, id, body) {
    const res = await fetchAPI(\`/\${resource}/\${id}\`, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
    return res.data;
}

export async function remove(resource, id) {
    await fetchAPI(\`/\${resource}/\${id}\`, { method: 'DELETE' });
}`,
};

// Integration guide step content
export const GUIDE_CONTENT = {
  step1: {
    title: "Buat API Key",
    description:
      'Buat API Key di bagian "API Access Keys" di atas. Copy key yang dihasilkan (format: pk_xxx...)',
    warning:
      "Simpan API Key dengan aman! Key hanya ditampilkan sekali saat dibuat.",
  },
  step2: {
    title: "Tambahkan Domain CORS (Khusus Website)",
    description:
      'Untuk website, tambahkan domain frontend Anda di bagian "CORS Domains" agar browser mengizinkan request ke API.',
    examples: ["https://mywebsite.com", "http://localhost:3000"] as string[],
    note: "Mobile app (Flutter/React Native) tidak memerlukan konfigurasi CORS.",
  },
  step3: {
    title: "Gunakan Base URL",
    description:
      "Semua request API harus menggunakan Base URL berikut sebagai prefix. Semua endpoint dimulai dari URL ini.",
  },
  step4: {
    title: "Setup Headers di Setiap Request",
    description:
      "Setiap request ke API WAJIB menyertakan header berikut. Tanpa header ini, request akan ditolak.",
  },
  step5: {
    title: "Auth Flow (Register & Login)",
    description:
      "Untuk fitur yang memerlukan autentikasi user, gunakan alur berikut:",
    substeps: [
      {
        label: "Register",
        method: "POST",
        path: "/auth/register",
        body: "{ username, email, password }",
      },
      {
        label: "Login",
        method: "POST",
        path: "/auth/login",
        body: "{ email, password }",
      },
      {
        label: "Simpan Token",
        note: "Simpan token dari response ke localStorage / AsyncStorage",
      },
      {
        label: "Akses Endpoint Protected",
        note: "Kirim token di header: Authorization: Bearer <token>",
      },
    ],
  },
  step6: {
    title: "Akses Data Resource (CRUD)",
    description:
      "Endpoint data resource dibuat otomatis dari Dashboard > API Management. Pola URL-nya:",
    endpoints: [
      { method: "GET", path: "/{resource}", desc: "Ambil semua data (list)" },
      { method: "GET", path: "/{resource}/{id}", desc: "Ambil data by ID" },
      { method: "POST", path: "/{resource}", desc: "Buat data baru" },
      { method: "PUT", path: "/{resource}/{id}", desc: "Update data" },
      { method: "DELETE", path: "/{resource}/{id}", desc: "Hapus data" },
    ],
    note: "Ganti {resource} dengan nama endpoint yang sudah dibuat di API Management (contoh: products, orders, articles).",
  },
  step7: {
    title: "Format Response API",
    description: "Semua response dari API mengikuti format standar berikut:",
    successExample: `{
  "status": "success",
  "data": { ... }
}`,
    errorExample: `{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error yang bisa ditampilkan"
  }
}`,
    tip: 'Gunakan field "error.code" untuk i18n/translation di frontend. Field "error.message" bisa langsung ditampilkan ke user.',
  },
  headers: {
    required: {
      label: "Wajib (Semua Request)",
      value: "x-api-key: pk_xxx...",
      description: "API Key dari Dashboard. Tanpa ini → 401 Unauthorized.",
    },
    contentType: {
      label: "Wajib (POST/PUT)",
      value: "Content-Type: application/json",
      description: "Wajib untuk request yang mengirim body JSON.",
    },
    optional: {
      label: "Optional (Protected Endpoints)",
      value: "Authorization: Bearer eyJ...",
      description:
        "JWT token dari login/register. Diperlukan untuk endpoint yang butuh auth.",
    },
  },
  authRoutes: {
    title: "Daftar Auth Endpoints",
    routes: [
      {
        method: "POST",
        path: "/auth/register",
        auth: "Public",
        desc: "Registrasi user baru",
      },
      {
        method: "POST",
        path: "/auth/login",
        auth: "Public",
        desc: "Login user",
      },
      {
        method: "GET",
        path: "/auth/me",
        auth: "Token",
        desc: "Data user yang sedang login",
      },
      {
        method: "GET",
        path: "/auth/verify",
        auth: "Token",
        desc: "Verifikasi token masih valid",
      },
      {
        method: "POST",
        path: "/auth/logout",
        auth: "Token",
        desc: "Logout (invalidasi token)",
      },
      {
        method: "GET",
        path: "/auth/user/data",
        auth: "Token",
        desc: "Data lengkap user dari DB",
      },
      {
        method: "PUT",
        path: "/auth/user/profile",
        auth: "Token",
        desc: "Update profil (username/email)",
      },
      {
        method: "POST",
        path: "/auth/user/change-password",
        auth: "Token",
        desc: "Ganti password",
      },
      {
        method: "DELETE",
        path: "/auth/user/account",
        auth: "Token",
        desc: "Hapus akun (soft delete)",
      },
    ],
  },
};

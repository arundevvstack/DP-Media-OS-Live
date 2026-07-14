/**
 * eTimeOffice Playwright-based Client
 *
 * Uses a headless Chromium browser to:
 * 1. Log into https://www.etimeoffice.com
 * 2. Navigate to the Daily/Monthly Report page
 * 3. Generate and download the attendance report
 * 4. Parse and return attendance records
 *
 * Why headless? eTimeOffice is an ASP.NET SPA that requires JavaScript
 * execution to render the login form and generate CSRF tokens.
 */

export interface EtoDailyRecord {
  emp_code: string;
  emp_name: string;
  date: string;
  in_time?: string;
  out_time?: string;
  status: string; // 'P' | 'A' | 'WO' | 'H' | 'L' etc.
}

export interface EtoSyncResult {
  success: boolean;
  records?: EtoDailyRecord[];
  error?: string;
  screenshotBase64?: string; // for debugging
}

export function isConfigured(): boolean {
  return !!(
    process.env.ETIMEOFFICE_CORP_ID &&
    process.env.ETIMEOFFICE_CORP_ID !== 'YOUR_CORP_ID' &&
    process.env.ETIMEOFFICE_USERNAME &&
    process.env.ETIMEOFFICE_USERNAME !== 'YOUR_USERNAME' &&
    process.env.ETIMEOFFICE_PASSWORD &&
    process.env.ETIMEOFFICE_PASSWORD !== 'YOUR_PASSWORD'
  );
}

/**
 * Use Playwright Chromium to login and scrape attendance data
 */
export async function scrapeAttendance(fromDate: Date, toDate: Date): Promise<EtoSyncResult> {
  let chromium: any;
  try {
    const pw = (await import('playwright-extra')).default || await import('playwright-extra');
    const stealth = (await import('puppeteer-extra-plugin-stealth')).default;
    pw.chromium.use(stealth());
    chromium = pw.chromium;
  } catch {
    try {
      chromium = (await import('playwright-core')).chromium;
    } catch {
      return { success: false, error: 'Playwright is not installed. Run: npm install playwright-core' };
    }
  }

  let browser: any;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();
    const base = (process.env.ETIMEOFFICE_BASE_URL || 'https://www.etimeoffice.com').replace(/\/$/, '');

    // ── Step 1: Navigate to login page (confirmed URL via browser inspection) ──
    await page.goto(`${base}/Login/loginCheck`, { waitUntil: 'networkidle', timeout: 30000 });

    // ── Step 2: Fill in credentials (exact IDs confirmed via Playwright inspection) ──
    await page.fill('#loginModel_corporateId', process.env.ETIMEOFFICE_CORP_ID || '');
    await page.fill('#loginModel_userName', process.env.ETIMEOFFICE_USERNAME || '');
    await page.fill('#loginModel_password', process.env.ETIMEOFFICE_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});

    const currentUrl = page.url();
    if (currentUrl.includes('loginCheck') || currentUrl.includes('Login/')) {
      const screenshot = await page.screenshot({ encoding: 'base64' });
      return { success: false, error: 'Login failed — still on login page. Check Corporate ID, Username and Password.', screenshotBase64: screenshot as string };
    }

    // ── Step 3: Navigate to Daily Report ───────────────────────────────────
    const formatDate = (d: Date) => {
      const dd = d.getDate().toString().padStart(2, '0');
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    };

    // Intercept the JSON response from the report API
    const records: EtoDailyRecord[] = [];
    page.on('response', async (response: any) => {
      const url = response.url();
      if (url.includes('DetailsWeb') || url.includes('DailyReport') || url.includes('Attendance')) {
        try {
          const ct = response.headers()['content-type'] || '';
          if (ct.includes('json')) {
            const data = await response.json();
            // Normalize whatever shape the data comes back in
            const rows = Array.isArray(data) ? data : (data.data || data.Data || data.records || []);
            rows.forEach((row: any) => {
              records.push({
                emp_code: row.EmpCode || row.emp_code || row.EmployeeCode || '',
                emp_name: row.EmpName || row.emp_name || row.EmployeeName || '',
                date: row.Date || row.date || row.AttDate || '',
                in_time: row.InTime || row.in_time || row.InPunch || undefined,
                out_time: row.OutTime || row.out_time || row.OutPunch || undefined,
                status: row.Status || row.status || row.AttStatus || 'P'
              });
            });
          }
        } catch {}
      }
    });

    await page.goto(`${base}/DailyReport/Details`, { waitUntil: 'networkidle', timeout: 20000 });

    // Try to trigger the report for the date range
    // Each day in range
    const msPerDay = 86400000;
    const dayCount = Math.ceil((toDate.getTime() - fromDate.getTime()) / msPerDay) + 1;

    for (let i = 0; i < Math.min(dayCount, 31); i++) {
      const d = new Date(fromDate.getTime() + i * msPerDay);
      const dateStr = formatDate(d);

      // Trigger the date input
      const dateInputSels = ['input[name*="date"]', '#reportDate', 'input[type="date"]', '.date-picker input'];
      for (const sel of dateInputSels) {
        try {
          await page.fill(sel, dateStr, { timeout: 2000 });
          break;
        } catch {}
      }

      // Click generate/search button
      try {
        await page.click('.btn-search, .btn-generate, button[type="submit"], #btnSearch, #btnGenerate', { timeout: 3000 });
        await page.waitForTimeout(1500);
      } catch {}
    }

    await page.waitForTimeout(2000);
    await browser.close();

    return { success: true, records };
  } catch (err: any) {
    if (browser) await browser.close().catch(() => {});
    return { success: false, error: err.message };
  }
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  let chromium: any;
  try {
    const pw = (await import('playwright-extra')).default || await import('playwright-extra');
    const stealth = (await import('puppeteer-extra-plugin-stealth')).default;
    pw.chromium.use(stealth());
    chromium = pw.chromium;
  } catch {
    try {
      chromium = (await import('playwright-core')).chromium;
    } catch {
      return { success: false, message: 'Playwright not installed. Run: npm install playwright' };
    }
  }

  let browser: any;
  try {
    const base = (process.env.ETIMEOFFICE_BASE_URL || 'https://www.etimeoffice.com').replace(/\/$/, '');
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await (await browser.newContext()).newPage();

    // Real login URL discovered via browser inspection
    await page.goto(`${base}/Login/loginCheck`, { waitUntil: 'networkidle', timeout: 25000 });

    // Exact field IDs confirmed via Playwright form inspection
    await page.fill('#loginModel_corporateId', process.env.ETIMEOFFICE_CORP_ID || '');
    await page.fill('#loginModel_userName', process.env.ETIMEOFFICE_USERNAME || '');
    await page.fill('#loginModel_password', process.env.ETIMEOFFICE_PASSWORD || '');

    // Click the Login submit button
    await page.click('button[type="submit"].btn.btn-block');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});

    const finalUrl = page.url();
    await browser.close();

    if (!finalUrl.includes('loginCheck') && !finalUrl.includes('Login')) {
      return { success: true, message: `✅ Logged in successfully. Dashboard URL: ${finalUrl}` };
    }
    return { success: false, message: 'Login failed — still on login page. Verify Corporate ID, Username and Password.' };
  } catch (err: any) {
    if (browser) await browser.close().catch(() => {});
    return { success: false, message: err.message };
  }
}

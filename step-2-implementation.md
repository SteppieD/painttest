# Step 2 Implementation: Multi-Company Access Codes
**Version 2.0** - Updated 2025-06-01

## 🎯 **Goal**: Support multiple company access codes with isolated workspaces

Instead of just "DEMO2024", support codes like:
- DEMO2024 (Demo Painting Company)  
- PAINTER001 (Smith Painting LLC)
- CONTRACTOR123 (Elite Contractors)
- CUSTOM789 (Custom Paint Works)

Each company gets their own isolated quote workspace.

---

## 📁 **File 1: Create `database/schema-update.sql`**

**Instructions**: Create this new file to add companies table:

```sql
-- Add companies table for multi-company support
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  access_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id to quotes table
ALTER TABLE quotes ADD COLUMN company_id INTEGER REFERENCES companies(id);

-- Insert default companies
INSERT OR IGNORE INTO companies (access_code, company_name, phone, email) VALUES
('DEMO2024', 'Demo Painting Company', '(555) 123-4567', 'demo@paintingcompany.com'),
('PAINTER001', 'Smith Painting LLC', '(555) 987-6543', 'info@smithpainting.com'),
('CONTRACTOR123', 'Elite Contractors', '(555) 456-7890', 'quotes@elitecontractors.com'),
('CUSTOM789', 'Custom Paint Works', '(555) 234-5678', 'hello@custompaintworks.com');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_access_code ON companies(access_code);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);

-- Update trigger for companies
CREATE TRIGGER IF NOT EXISTS update_companies_timestamp 
  AFTER UPDATE ON companies
  BEGIN
    UPDATE companies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
```

---

## 📁 **File 2: Replace `app/api/verify-code/route.ts`**

**Instructions**: Replace the ENTIRE contents with this enhanced API:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

// Initialize database
const dbPath = path.join(process.cwd(), 'quotes.db')
const db = new Database(dbPath)

// Ensure tables exist (run schema updates)
const setupDatabase = () => {
  try {
    // Check if companies table exists
    const companiesTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='companies'
    `).get()

    if (!companiesTableExists) {
      // Create companies table
      db.exec(`
        CREATE TABLE companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          access_code TEXT UNIQUE NOT NULL,
          company_name TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          logo_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Add company_id to quotes table if it doesn't exist
      try {
        db.exec(`ALTER TABLE quotes ADD COLUMN company_id INTEGER REFERENCES companies(id)`)
      } catch (err) {
        // Column might already exist, that's OK
      }

      // Insert default companies
      const insertCompany = db.prepare(`
        INSERT OR IGNORE INTO companies (access_code, company_name, phone, email) 
        VALUES (?, ?, ?, ?)
      `)

      const companies = [
        ['DEMO2024', 'Demo Painting Company', '(555) 123-4567', 'demo@paintingcompany.com'],
        ['PAINTER001', 'Smith Painting LLC', '(555) 987-6543', 'info@smithpainting.com'],
        ['CONTRACTOR123', 'Elite Contractors', '(555) 456-7890', 'quotes@elitecontractors.com'],
        ['CUSTOM789', 'Custom Paint Works', '(555) 234-5678', 'hello@custompaintworks.com'],
        ['BUILDER456', 'Premier Builders', '(555) 345-6789', 'contact@premierbuilders.com'],
        ['PAINT2025', 'Modern Paint Solutions', '(555) 567-8901', 'info@modernpaint.com']
      ]

      companies.forEach(company => {
        insertCompany.run(...company)
      })

      // Create indexes
      db.exec(`CREATE INDEX IF NOT EXISTS idx_companies_access_code ON companies(access_code)`)
      db.exec(`CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id)`)

      console.log('✅ Database setup complete - companies table created')
    }
  } catch (error) {
    console.error('❌ Database setup error:', error)
  }
}

// Run setup on startup
setupDatabase()

export async function POST(request: NextRequest) {
  try {
    const { accessCode } = await request.json()
    
    if (!accessCode) {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 })
    }

    // Convert to uppercase for consistency
    const normalizedCode = accessCode.toString().toUpperCase()

    // Check if access code exists in companies table
    const findCompany = db.prepare(`
      SELECT id, access_code, company_name, phone, email, logo_url
      FROM companies 
      WHERE access_code = ?
    `)
    
    const company = findCompany.get(normalizedCode)

    if (company) {
      // Valid company found
      console.log(`✅ Valid access code: ${normalizedCode} for ${company.company_name}`)
      
      return NextResponse.json({ 
        success: true,
        company: {
          id: company.id,
          accessCode: company.access_code,
          name: company.company_name,
          phone: company.phone,
          email: company.email,
          logoUrl: company.logo_url
        }
      })
    } else {
      // Check if it's a new access code pattern (starts with letter, contains numbers)
      const newCodePattern = /^[A-Z]{3,10}\d{2,4}$/
      
      if (newCodePattern.test(normalizedCode)) {
        // Auto-create new company for valid pattern
        const companyName = `Company ${normalizedCode}`
        
        const insertCompany = db.prepare(`
          INSERT INTO companies (access_code, company_name, phone, email) 
          VALUES (?, ?, ?, ?)
        `)
        
        const result = insertCompany.run(
          normalizedCode, 
          companyName, 
          '', 
          ''
        )
        
        console.log(`🆕 Auto-created company: ${companyName} with code ${normalizedCode}`)
        
        return NextResponse.json({ 
          success: true,
          company: {
            id: result.lastInsertRowid,
            accessCode: normalizedCode,
            name: companyName,
            phone: '',
            email: '',
            logoUrl: null
          },
          isNewCompany: true
        })
      } else {
        // Invalid access code
        console.log(`❌ Invalid access code: ${normalizedCode}`)
        return NextResponse.json({ 
          error: 'Invalid access code. Please contact support.' 
        }, { status: 401 })
      }
    }
  } catch (error) {
    console.error('Access code verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to list available demo companies (for testing)
export async function GET() {
  try {
    const getCompanies = db.prepare(`
      SELECT access_code, company_name, phone 
      FROM companies 
      ORDER BY created_at ASC
    `)
    
    const companies = getCompanies.all()
    
    return NextResponse.json({ 
      companies,
      message: 'Available access codes for testing' 
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 📁 **File 3: Replace `app/api/quotes/route.ts`**

**Instructions**: Update quotes API to link quotes to companies:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'quotes.db')
const db = new Database(dbPath)

export async function POST(request: NextRequest) {
  try {
    const { customer_name, customer_email, customer_phone, address, quote_amount, notes, company_id } = await request.json()
    
    // Validate required fields
    if (!customer_name || !address || !quote_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, address, quote_amount' },
        { status: 400 }
      )
    }

    // Get company_id from session storage or default to 1 (DEMO2024)
    const finalCompanyId = company_id || 1

    // Insert quote with company association
    const stmt = db.prepare(`
      INSERT INTO quotes (customer_name, customer_email, customer_phone, address, quote_amount, notes, company_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    
    const result = stmt.run(
      customer_name,
      customer_email || '',
      customer_phone || '',
      address,
      quote_amount,
      notes || '',
      finalCompanyId
    )
    
    console.log(`✅ Quote ${result.lastInsertRowid} saved for company ${finalCompanyId}`)
    
    return NextResponse.json({ 
      id: result.lastInsertRowid,
      message: 'Quote saved successfully',
      company_id: finalCompanyId
    })
    
  } catch (error) {
    console.error('Error saving quote:', error)
    return NextResponse.json(
      { error: 'Failed to save quote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    let stmt, quotes
    
    if (companyId) {
      // Get quotes for specific company
      stmt = db.prepare(`
        SELECT q.*, c.company_name, c.access_code
        FROM quotes q
        LEFT JOIN companies c ON q.company_id = c.id
        WHERE q.company_id = ?
        ORDER BY q.created_at DESC
      `)
      quotes = stmt.all(companyId)
    } else {
      // Get all quotes with company info
      stmt = db.prepare(`
        SELECT q.*, c.company_name, c.access_code
        FROM quotes q
        LEFT JOIN companies c ON q.company_id = c.id
        ORDER BY q.created_at DESC
      `)
      quotes = stmt.all()
    }
    
    return NextResponse.json(quotes)
    
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
```

---

## 📁 **File 4: Replace `app/access-code/page.tsx`**

**Instructions**: Enhance access code page with company selection:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccessCodePage() {
  const [accessCode, setAccessCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableCodes, setAvailableCodes] = useState<any[]>([])
  const [showDemoCodes, setShowDemoCodes] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store company info in localStorage for session management
        localStorage.setItem('paintquote_company', JSON.stringify({
          id: data.company.id,
          accessCode: data.company.accessCode,
          name: data.company.name,
          phone: data.company.phone,
          email: data.company.email,
          logoUrl: data.company.logoUrl,
          loginTime: Date.now(),
          isNewCompany: data.isNewCompany || false
        }))

        // Redirect to dashboard or show welcome for new companies
        if (data.isNewCompany) {
          router.push(`/success?newCompany=true&companyName=${encodeURIComponent(data.company.name)}`)
        } else {
          router.push('/create-quote')
        }
      } else {
        setError(data.error || 'Invalid access code')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDemoCodes = async () => {
    try {
      const response = await fetch('/api/verify-code')
      const data = await response.json()
      setAvailableCodes(data.companies || [])
      setShowDemoCodes(true)
    } catch (error) {
      console.error('Error loading demo codes:', error)
    }
  }

  const selectDemoCode = (code: string) => {
    setAccessCode(code)
    setShowDemoCodes(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '24px' }}>
            🎨 Painting Quote Pro
          </h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Enter your company access code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Enter access code (e.g., DEMO2024)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 'bold'
              }}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !accessCode.trim()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={loadDemoCodes}
            style={{
              background: 'none',
              border: 'none',
              color: '#3498db',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            View Demo Access Codes
          </button>
        </div>

        {showDemoCodes && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
              Available Demo Codes:
            </h4>
            {availableCodes.map((company, index) => (
              <div
                key={index}
                onClick={() => selectDemoCode(company.access_code)}
                style={{
                  padding: '8px',
                  margin: '5px 0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <strong>{company.access_code}</strong> - {company.company_name}
                {company.phone && <div style={{ color: '#666' }}>{company.phone}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: '20px',
          fontSize: '11px',
          color: '#999',
          textAlign: 'center'
        }}>
          <p>New access codes auto-create companies</p>
          <p>Format: LETTERS + NUMBERS (e.g., PAINT2025)</p>
        </div>
      </div>
    </div>
  )
}
```

---

## 📁 **File 5: Update `app/create-quote/page.tsx`**

**Instructions**: Add company context to quote creation (add this to existing file):

```typescript
// Add this to the top of your existing create-quote page, after the imports:

// Get company info from localStorage
const getCompanyInfo = () => {
  if (typeof window !== 'undefined') {
    const companyData = localStorage.getItem('paintquote_company')
    if (companyData) {
      try {
        return JSON.parse(companyData)
      } catch (e) {
        return null
      }
    }
  }
  return null
}

// Add this inside your component, after the existing state declarations:
const [companyInfo, setCompanyInfo] = useState<any>(null)

// Add this useEffect after your existing useEffects:
useEffect(() => {
  const company = getCompanyInfo()
  if (company) {
    setCompanyInfo(company)
  } else {
    // No company info, redirect to access code page
    router.push('/access-code')
  }
}, [router])

// Update your saveQuote function to include company_id:
const saveQuote = async () => {
  if (!conversationState.customerName || !conversationState.baseCost || !companyInfo) {
    alert('Quote not complete yet!');
    return;
  }

  setIsSaving(true);

  try {
    const finalPrice = conversationState.baseCost * (1 + (conversationState.markupPercentage || 20) / 100);
    
    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name: conversationState.customerName,
        customer_email: '',
        customer_phone: '',
        address: conversationState.address,
        quote_amount: finalPrice,
        notes: `${conversationState.workType} - ${conversationState.roomDetails} - ${conversationState.roomCount} rooms, ${conversationState.totalSqft} sq ft, ${conversationState.paintQuality} paint quality`,
        company_id: companyInfo.id // 🆕 Include company ID
      }),
    });

    const result = await response.json();

    if (response.ok) {
      router.push(`/success?quoteId=${result.id}&amount=${finalPrice.toFixed(2)}&company=${encodeURIComponent(companyInfo.name)}`);
    } else {
      alert(`Error saving quote: ${result.error}`);
    }
  } catch (error) {
    console.error('Error saving quote:', error);
    alert('Failed to save quote. Please try again.');
  } finally {
    setIsSaving(false);
  }
};

// Update your header to show company name (replace the existing h1):
<h1 style={{
  margin: 0,
  color: "#333",
  fontSize: "18px",
  fontWeight: "600",
}}>
  🎨 {companyInfo ? companyInfo.name : 'Create New Quote'}
</h1>
```

---

## 🧪 **Testing Instructions**

### **Step 1: Run Database Update**
```bash
# In your Replit terminal
npm run dev
```

### **Step 2: Test Multiple Access Codes**
1. Go to `/access-code`
2. Click "View Demo Access Codes" to see all available codes
3. Try different codes:
   - `DEMO2024` (Demo Painting Company)
   - `PAINTER001` (Smith Painting LLC)  
   - `CONTRACTOR123` (Elite Contractors)
   - `CUSTOM789` (Custom Paint Works)

### **Step 3: Test New Code Auto-Creation**
1. Enter a new code like `PAINT2025`
2. Should auto-create "Company PAINT2025"
3. Should redirect to success page with new company message

### **Step 4: Test Quote Isolation**
1. Create quotes under different company codes
2. Quotes should be isolated per company
3. Check database: `quotes` table should have `company_id` column

---

## ✅ **Expected Results**

- ✅ Multiple access codes work (not just DEMO2024)
- ✅ Each company has isolated quote workspace  
- ✅ New codes auto-create companies
- ✅ Database links quotes to companies
- ✅ Company name shows in interface
- ✅ Session management works per company

## 🎯 **If It Works**
Report back: "Step 2 complete - multi-company access codes working!"

## 🚨 **If It Doesn't Work**  
Check Replit console for errors and copy/paste the error message.

---

## 🚀 **Ready for Step 3?**
Once Step 2 works, we'll implement **Step 3: Quote Management Dashboard** with company-specific quote lists and analytics!
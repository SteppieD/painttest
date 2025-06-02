# Painting App Implementation Guide
**Version 6.0** - Updated 2025-06-01

---

# 🚨 REACT HOOKS FIXES NEEDED

## Current Status:
- ❌ **React Hooks Error**: useState, useEffect, useRouter not allowed in Server Components
- ⏳ **Step 2 Needed**: Multi-company access codes 
- ⏳ **Step 3 Needed**: Quote management dashboard

## 🔧 **IMMEDIATE FIXES FOR REACT HOOKS**

The issue is that React hooks only work in **Client Components**, not **Server Components**.

### **Fix: Add 'use client' directive**

Make sure your `app/create-quote/page.tsx` starts with:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
```

### **All files that use React hooks MUST start with 'use client':**
- ✅ `app/create-quote/page.tsx` - needs 'use client'
- ✅ `app/access-code/page.tsx` - needs 'use client' 
- ✅ `app/dashboard/page.tsx` - needs 'use client'
- ✅ `app/success/page.tsx` - needs 'use client'

### **API routes do NOT use 'use client':**
- ❌ `app/api/verify-code/route.ts` - Server-side only
- ❌ `app/api/quotes/route.ts` - Server-side only

---

# 🎯 NEXT STEPS TO IMPLEMENT

## Current Status Check:
- ✅ **Step 1 Complete**: Dependencies installed, create-quote page working
- ⏳ **Step 2 Needed**: Multi-company access codes 
- ⏳ **Step 3 Needed**: Quote management dashboard

---

# 🎯 STEP 2: Multi-Company Access Codes

## 🎯 **Goal**: Support multiple company access codes with isolated workspaces

Instead of just "DEMO2024", support codes like:
- DEMO2024 (Demo Painting Company)  
- PAINTER001 (Smith Painting LLC)
- CONTRACTOR123 (Elite Contractors)
- CUSTOM789 (Custom Paint Works)

Each company gets their own isolated quote workspace.

═══════════════════════════════════════════════════════════
📁 FILE 1: app/api/verify-code/route.ts
═══════════════════════════════════════════════════════════

## 📁 **File 1: Replace `app/api/verify-code/route.ts`**

**Instructions**: Replace the ENTIRE contents with this enhanced API:

═══════════════════════════════════════════════════════════
💻 CODE BLOCK: app/api/verify-code/route.ts
═══════════════════════════════════════════════════════════

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

// Initialize database
const dbPath = path.join(process.cwd(), 'quotes.db')
const db = new Database(dbPath)

// Type definitions
interface Company {
  id: number
  access_code: string
  company_name: string
  phone: string
  email: string
  logo_url: string | null
}

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
    
    const company = findCompany.get(normalizedCode) as Company | undefined

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
    
    const companies = getCompanies.all() as Pick<Company, 'access_code' | 'company_name' | 'phone'>[]
    
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

═══════════════════════════════════════════════════════════
⚠️ END CODE BLOCK
═══════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════
📁 FILE 2: app/api/quotes/route.ts
═══════════════════════════════════════════════════════════

## 📁 **File 2: Update `app/api/quotes/route.ts`**

**Instructions**: Replace the ENTIRE contents to link quotes to companies:

═══════════════════════════════════════════════════════════
💻 CODE BLOCK: app/api/quotes/route.ts
═══════════════════════════════════════════════════════════

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'quotes.db')
const db = new Database(dbPath)

// Type definitions
interface Quote {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  quote_amount: number
  notes: string
  company_id: number
  status: string
  created_at: string
  updated_at: string
  company_name?: string
  access_code?: string
}

// Ensure status column exists
const setupQuotesTable = () => {
  try {
    // Check if status column exists
    const columns = db.prepare(`PRAGMA table_info(quotes)`).all() as Array<{name: string}>
    const hasStatusColumn = columns.some((col) => col.name === 'status')
    
    if (!hasStatusColumn) {
      db.exec(`ALTER TABLE quotes ADD COLUMN status TEXT DEFAULT 'pending'`)
      console.log('✅ Added status column to quotes table')
    }

    // Check if updated_at column exists
    const hasUpdatedAtColumn = columns.some((col) => col.name === 'updated_at')
    
    if (!hasUpdatedAtColumn) {
      db.exec(`ALTER TABLE quotes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`)
      console.log('✅ Added updated_at column to quotes table')
    }

    // Check if company_id column exists
    const hasCompanyIdColumn = columns.some((col) => col.name === 'company_id')
    
    if (!hasCompanyIdColumn) {
      db.exec(`ALTER TABLE quotes ADD COLUMN company_id INTEGER REFERENCES companies(id)`)
      console.log('✅ Added company_id column to quotes table')
    }
  } catch (error) {
    console.error('Error setting up quotes table:', error)
  }
}

// Run setup
setupQuotesTable()

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

    // Insert quote with company association and default status
    const stmt = db.prepare(`
      INSERT INTO quotes (customer_name, customer_email, customer_phone, address, quote_amount, notes, company_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    
    const result = stmt.run(
      customer_name,
      customer_email || '',
      customer_phone || '',
      address,
      quote_amount,
      notes || '',
      finalCompanyId,
      'pending' // Default status
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
      // Get quotes for specific company with status
      stmt = db.prepare(`
        SELECT q.*, c.company_name, c.access_code
        FROM quotes q
        LEFT JOIN companies c ON q.company_id = c.id
        WHERE q.company_id = ?
        ORDER BY q.created_at DESC
      `)
      quotes = stmt.all(companyId) as Quote[]
    } else {
      // Get all quotes with company info and status
      stmt = db.prepare(`
        SELECT q.*, c.company_name, c.access_code
        FROM quotes q
        LEFT JOIN companies c ON q.company_id = c.id
        ORDER BY q.created_at DESC
      `)
      quotes = stmt.all() as Quote[]
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

═══════════════════════════════════════════════════════════
⚠️ END CODE BLOCK
═══════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════
📁 FILE 3: app/access-code/page.tsx
═══════════════════════════════════════════════════════════

## 📁 **File 3: Update `app/access-code/page.tsx`**

**Instructions**: Replace the ENTIRE contents with enhanced access code page:

═══════════════════════════════════════════════════════════
💻 CODE BLOCK: app/access-code/page.tsx
═══════════════════════════════════════════════════════════

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
          router.push('/dashboard')
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

═══════════════════════════════════════════════════════════
⚠️ END CODE BLOCK
═══════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════
✅ STEP 2 NOTES: create-quote page updates
═══════════════════════════════════════════════════════════

**NOTE**: Your existing `app/create-quote/page.tsx` should already be working.

**Step 2 will modify it to:**
- Add company session management
- Link quotes to specific companies  
- Show company name in header

**For now, keep your current create-quote page as-is.**

---

# 🎯 STEP 3: Quote Management Dashboard

## 📁 **File 1: Create `app/dashboard/page.tsx`**

**Instructions**: Create this new dashboard page:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Quote {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  quote_amount: number
  notes: string
  status?: string
  created_at: string
  company_id: number
  company_name?: string
}

interface Analytics {
  totalQuotes: number
  totalRevenue: number
  averageQuote: number
  pendingQuotes: number
  acceptedQuotes: number
  thisMonthQuotes: number
  thisMonthRevenue: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalQuotes: 0,
    totalRevenue: 0,
    averageQuote: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
    thisMonthQuotes: 0,
    thisMonthRevenue: 0
  })
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Get company info from localStorage
  useEffect(() => {
    const companyData = localStorage.getItem('paintquote_company')
    if (companyData) {
      try {
        const company = JSON.parse(companyData)
        setCompanyInfo(company)
        loadQuotes(company.id)
      } catch (e) {
        router.push('/access-code')
      }
    } else {
      router.push('/access-code')
    }
  }, [router])

  const loadQuotes = async (companyId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/quotes?company_id=${companyId}`)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setQuotes(data)
        calculateAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAnalytics = (quotesData: Quote[]) => {
    const total = quotesData.length
    const revenue = quotesData.reduce((sum, quote) => sum + quote.quote_amount, 0)
    const average = total > 0 ? revenue / total : 0
    
    const pending = quotesData.filter(q => !q.status || q.status === 'pending').length
    const accepted = quotesData.filter(q => q.status === 'accepted').length
    
    // This month calculations
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthQuotes = quotesData.filter(quote => {
      const quoteDate = new Date(quote.created_at)
      return quoteDate >= thisMonthStart
    })
    
    setAnalytics({
      totalQuotes: total,
      totalRevenue: revenue,
      averageQuote: average,
      pendingQuotes: pending,
      acceptedQuotes: accepted,
      thisMonthQuotes: thisMonthQuotes.length,
      thisMonthRevenue: thisMonthQuotes.reduce((sum, quote) => sum + quote.quote_amount, 0)
    })
  }

  // Filter and sort quotes
  useEffect(() => {
    let filtered = quotes.filter(quote => {
      const matchesSearch = 
        quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quote_amount.toString().includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending' && (!quote.status || quote.status === 'pending')) ||
        (statusFilter !== 'pending' && quote.status === statusFilter)
      
      return matchesSearch && matchesStatus
    })

    // Sort quotes
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Quote]
      let bValue: any = b[sortBy as keyof Quote]
      
      if (sortBy === 'quote_amount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredQuotes(filtered)
  }, [quotes, searchTerm, statusFilter, sortBy, sortOrder])

  const updateQuoteStatus = async (quoteId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/quotes/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, status: newStatus })
      })
      
      if (response.ok) {
        // Update local state
        setQuotes(prev => prev.map(quote => 
          quote.id === quoteId ? { ...quote, status: newStatus } : quote
        ))
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted': return '#28a745'
      case 'completed': return '#17a2b8'
      case 'cancelled': return '#dc3545'
      default: return '#ffc107'
    }
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666' }}>Loading dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#333' }}>
              📊 {companyInfo?.name || 'Dashboard'}
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {companyInfo?.accessCode} • Manage your painting quotes
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/create-quote')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + New Quote
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('paintquote_company')
                router.push('/access-code')
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Analytics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Quotes</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {analytics.totalQuotes}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Revenue</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {formatCurrency(analytics.totalRevenue)}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Average Quote</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
              {formatCurrency(analytics.averageQuote)}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>This Month</h3>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              {analytics.thisMonthQuotes} quotes
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {formatCurrency(analytics.thisMonthRevenue)}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Search Quotes
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Customer name, address, or amount..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Sort By
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order as 'asc' | 'desc')
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="quote_amount-desc">Highest Amount</option>
                <option value="quote_amount-asc">Lowest Amount</option>
                <option value="customer_name-asc">Customer A-Z</option>
                <option value="customer_name-desc">Customer Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quotes List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
              Recent Quotes ({filteredQuotes.length})
            </h2>
          </div>

          {filteredQuotes.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>
                {quotes.length === 0 ? 'No quotes yet' : 'No quotes match your filters'}
              </p>
              <p style={{ fontSize: '14px', margin: 0 }}>
                {quotes.length === 0 && (
                  <button
                    onClick={() => router.push('/create-quote')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Create your first quote
                  </button>
                )}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold' }}>
                      Customer
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold' }}>
                      Address
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                      Amount
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      Date
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {quote.customer_name}
                          </div>
                          {quote.customer_phone && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {quote.customer_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {quote.address}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>
                        {formatCurrency(quote.quote_amount)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <select
                          value={quote.status || 'pending'}
                          onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            backgroundColor: getStatusColor(quote.status),
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                        {formatDate(quote.created_at)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => alert(`Quote ID: ${quote.id}\nNotes: ${quote.notes}`)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

## 📁 **File 2: Create `app/api/quotes/update-status/route.ts`**

**Instructions**: Create this new API endpoint for updating quote status:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'quotes.db')
const db = new Database(dbPath)

export async function PUT(request: NextRequest) {
  try {
    const { quoteId, status } = await request.json()
    
    if (!quoteId || !status) {
      return NextResponse.json(
        { error: 'Missing quoteId or status' },
        { status: 400 }
      )
    }

    // Update quote status
    const stmt = db.prepare(`
      UPDATE quotes 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    
    const result = stmt.run(status, quoteId)
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }
    
    console.log(`✅ Quote ${quoteId} status updated to: ${status}`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Quote status updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating quote status:', error)
    return NextResponse.json(
      { error: 'Failed to update quote status' },
      { status: 500 }
    )
  }
}
```

## 📁 **File 3: Update `app/success/page.tsx`**

**Instructions**: Add dashboard navigation to success page:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quoteInfo, setQuoteInfo] = useState<{
    quoteId?: string, 
    amount?: string, 
    company?: string,
    newCompany?: string,
    companyName?: string
  }>({})

  useEffect(() => {
    const quoteId = searchParams.get('quoteId')
    const amount = searchParams.get('amount')
    const company = searchParams.get('company')
    const newCompany = searchParams.get('newCompany')
    const companyName = searchParams.get('companyName')
    
    setQuoteInfo({ quoteId, amount, company, newCompany, companyName })
  }, [searchParams])

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
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        {quoteInfo.newCompany === 'true' ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
            <h1 style={{ color: '#333', margin: '0 0 20px 0', fontSize: '24px' }}>
              Welcome!
            </h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              New company "{quoteInfo.companyName}" has been created successfully!
            </p>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>
              You can now start creating quotes for your company.
            </p>
          </>
        ) : quoteInfo.quoteId ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ color: '#333', margin: '0 0 20px 0', fontSize: '24px' }}>
              Quote Saved!
            </h1>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Quote ID:</strong> #{quoteInfo.quoteId}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Amount:</strong> ${quoteInfo.amount}
              </p>
              {quoteInfo.company && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Company:</strong> {decodeURIComponent(quoteInfo.company)}
                </p>
              )}
            </div>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Your quote has been saved successfully!
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>😊</div>
            <h1 style={{ color: '#333', margin: '0 0 20px 0', fontSize: '24px' }}>
              Success!
            </h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Access code verified! You're logged in successfully.
            </p>
          </>
        )}
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📊 View Dashboard
          </button>
          
          <button
            onClick={() => router.push('/create-quote')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + New Quote
          </button>
          
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏠 Home
          </button>
        </div>
        
        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          Company workspace active ✓
        </p>
      </div>
    </div>
  )
}
```

## 📁 **File 4: Update `app/page.tsx`**

**Instructions**: Make home page redirect to dashboard if logged in:

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a company session
    const companyData = localStorage.getItem('paintquote_company')
    
    if (companyData) {
      try {
        const company = JSON.parse(companyData)
        // Check if session is still valid (24 hours)
        if (Date.now() - company.loginTime < 24 * 60 * 60 * 1000) {
          router.push('/dashboard')
          return
        } else {
          // Session expired, clear it
          localStorage.removeItem('paintquote_company')
        }
      } catch (e) {
        // Invalid session data, clear it
        localStorage.removeItem('paintquote_company')
      }
    }
    
    // No valid session, redirect to access code page
    router.push('/access-code')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
```

---

# 🧪 **Testing Instructions**

## **Step 2 Testing:**
1. **Start app**: `npm run dev`
2. **Test multiple access codes**: Try DEMO2024, PAINTER001, CONTRACTOR123
3. **Test new code creation**: Try PAINT2025 (should auto-create)
4. **Test quote isolation**: Create quotes under different companies

## **Step 3 Testing:**
1. **Access dashboard**: Should redirect to `/dashboard` after login
2. **View analytics**: Check total quotes, revenue, averages
3. **Search/filter**: Test quote search and status filtering
4. **Update status**: Change quote status using dropdown
5. **Navigation**: Test all buttons (New Quote, Logout, etc.)

## ✅ **Expected Results**

- ✅ Multiple company access codes work
- ✅ Companies have isolated quote workspaces
- ✅ Professional dashboard with analytics
- ✅ Quote search, filter, and status management
- ✅ Smooth navigation between all pages

## 🎯 **Implementation Order**

1. **Start with Step 2** (Multi-company access codes)
2. **Test Step 2** thoroughly 
3. **Then implement Step 3** (Dashboard)
4. **Test complete workflow**

Ready to implement? Start with **Step 2** first!
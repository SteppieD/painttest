# Step 3 Implementation: Quote Management Dashboard
**Version 3.0** - Updated 2025-06-01

## 🎯 **Goal**: Company-specific quote management dashboard with analytics

Add a comprehensive dashboard where each company can:
- View all their quotes in a organized list
- Search and filter quotes by customer, amount, date
- See quote analytics (total revenue, average quote, etc.)
- Update quote status (pending, accepted, completed, cancelled)
- Export quotes to PDF or CSV

---

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

---

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

---

## 📁 **File 3: Update `app/api/quotes/route.ts`**

**Instructions**: Add status column support to existing quotes API:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'quotes.db')
const db = new Database(dbPath)

// Ensure status column exists
const setupQuotesTable = () => {
  try {
    // Check if status column exists
    const columns = db.prepare(`PRAGMA table_info(quotes)`).all()
    const hasStatusColumn = columns.some((col: any) => col.name === 'status')
    
    if (!hasStatusColumn) {
      db.exec(`ALTER TABLE quotes ADD COLUMN status TEXT DEFAULT 'pending'`)
      console.log('✅ Added status column to quotes table')
    }

    // Check if updated_at column exists
    const hasUpdatedAtColumn = columns.some((col: any) => col.name === 'updated_at')
    
    if (!hasUpdatedAtColumn) {
      db.exec(`ALTER TABLE quotes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`)
      console.log('✅ Added updated_at column to quotes table')
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
      quotes = stmt.all(companyId)
    } else {
      // Get all quotes with company info and status
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

## 📁 **File 4: Update `app/success/page.tsx`**

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

---

## 📁 **File 5: Update `app/page.tsx`**

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

## 🧪 **Testing Instructions**

### **Step 1: Implement Files**
1. Copy all 5 file contents from this implementation
2. Create/replace files as instructed

### **Step 2: Test Dashboard Access**
1. Start your app: `npm run dev`
2. Login with access code (e.g., `DEMO2024`)
3. Should redirect to `/dashboard`

### **Step 3: Test Dashboard Features**
1. **View Analytics**: See total quotes, revenue, averages
2. **Search Quotes**: Try searching by customer name
3. **Filter by Status**: Change status filter dropdown
4. **Sort Quotes**: Try different sorting options
5. **Update Status**: Change quote status using dropdown
6. **Create New Quote**: Click "New Quote" button

### **Step 4: Test Multi-Company Isolation**
1. Create quotes under different access codes
2. Switch between companies
3. Verify each company only sees their quotes

---

## ✅ **Expected Results**

- ✅ Professional dashboard with company analytics
- ✅ Quote list with search, filter, and sort
- ✅ Quote status management (pending/accepted/completed/cancelled)
- ✅ Company-specific data isolation
- ✅ Responsive design works on mobile
- ✅ Navigation between dashboard, create quote, and logout

## 🎯 **If It Works**
Report back: "Step 3 complete - quote management dashboard working!"

## 🚨 **If It Doesn't Work**  
Check Replit console for errors and copy/paste the error message.

---

## 🚀 **Ready for Step 4?**
Once Step 3 works, we'll implement **Step 4: Advanced Quote Features** with PDF export, quote templates, and enhanced calculations!
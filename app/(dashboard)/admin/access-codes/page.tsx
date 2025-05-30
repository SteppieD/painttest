'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Users, Calendar, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface AccessCode {
  id: string
  code: string
  company_name: string
  contact_name: string
  phone: string
  is_active: boolean
  uses_count: number
  max_uses: number | null
  expires_at: string | null
  created_at: string
  last_used_at: string | null
  notes: string
  access_code_sessions: Array<{
    id: string
    user_id: string
    created_at: string
  }>
}

export default function AccessCodesAdminPage() {
  const { toast } = useToast()
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCode, setNewCode] = useState({
    code: '',
    companyName: '',
    contactName: '',
    phone: '',
    maxUses: '',
    expiresAt: '',
    notes: ''
  })

  // Generate a random access code
  const generateCode = () => {
    const prefix = 'DEMO'
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${suffix}`
  }

  const loadAccessCodes = async () => {
    try {
      const response = await fetch('/api/admin/access-codes')
      const data = await response.json()
      setAccessCodes(data.accessCodes || [])
    } catch (error) {
      console.error('Error loading access codes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load access codes',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createAccessCode = async () => {
    try {
      const response = await fetch('/api/admin/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.code,
          companyName: newCode.companyName,
          contactName: newCode.contactName,
          phone: newCode.phone,
          maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : null,
          expiresAt: newCode.expiresAt || null,
          notes: newCode.notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast({
        title: 'Success',
        description: 'Access code created successfully'
      })

      setIsCreateDialogOpen(false)
      setNewCode({
        code: '',
        companyName: '',
        contactName: '',
        phone: '',
        maxUses: '',
        expiresAt: '',
        notes: ''
      })
      loadAccessCodes()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create access code',
        variant: 'destructive'
      })
    }
  }

  const deactivateCode = async (codeId: string) => {
    try {
      const response = await fetch(`/api/admin/access-codes?id=${codeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate code')
      }

      toast({
        title: 'Success',
        description: 'Access code deactivated'
      })

      loadAccessCodes()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate access code',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    loadAccessCodes()
  }, [])

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Code Management</h1>
          <p className="text-muted-foreground">
            Create and manage demo access codes for testing
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Access Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Access Code</DialogTitle>
              <DialogDescription>
                Generate a new access code for demo and testing purposes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Access Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    value={newCode.code}
                    onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                    placeholder="DEMO-XXXXX"
                    className="font-mono"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setNewCode({...newCode, code: generateCode()})}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={newCode.companyName}
                  onChange={(e) => setNewCode({...newCode, companyName: e.target.value})}
                  placeholder="Demo Painting Co."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={newCode.contactName}
                  onChange={(e) => setNewCode({...newCode, contactName: e.target.value})}
                  placeholder="John Demo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCode.phone}
                  onChange={(e) => setNewCode({...newCode, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses (optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode({...newCode, maxUses: e.target.value})}
                    placeholder="10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newCode.expiresAt}
                    onChange={(e) => setNewCode({...newCode, expiresAt: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newCode.notes}
                  onChange={(e) => setNewCode({...newCode, notes: e.target.value})}
                  placeholder="For client demo on..."
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createAccessCode}
                disabled={!newCode.code || !newCode.companyName}
              >
                Create Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {accessCodes.map((code) => (
          <Card key={code.id} className={!code.is_active ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono text-lg">{code.code}</CardTitle>
                  <CardDescription>{code.company_name}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {code.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deactivateCode(code.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span>Uses: {code.uses_count}</span>
                  {code.max_uses && <span>/ {code.max_uses}</span>}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Sessions: {code.access_code_sessions.length}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {new Date(code.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Last used: {code.last_used_at 
                      ? new Date(code.last_used_at).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
              
              {code.notes && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Notes: {code.notes}
                </div>
              )}
              
              {!code.is_active && (
                <div className="mt-2 text-sm text-red-600 font-medium">
                  ⚠️ Deactivated
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {accessCodes.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No access codes created yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first access code to get started with demo accounts.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
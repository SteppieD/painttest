'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business settings and preferences
        </p>
      </div>

      <div className="grid gap-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Your Company Name"
                defaultValue="My Painting Company"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="(555) 123-4567"
                type="tel"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="contact@company.com"
                type="email"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor & Material Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="labor">Labor Cost per Hour</Label>
              <Input
                id="labor"
                type="number"
                placeholder="50"
                defaultValue="50"
              />
            </div>
            <div>
              <Label>Paint Costs per Gallon</Label>
              <div className="space-y-2 mt-2">
                <div>
                  <Label htmlFor="paint-good" className="text-sm">Good Quality</Label>
                  <Input
                    id="paint-good"
                    type="number"
                    placeholder="25"
                    defaultValue="25"
                  />
                </div>
                <div>
                  <Label htmlFor="paint-better" className="text-sm">Better Quality</Label>
                  <Input
                    id="paint-better"
                    type="number"
                    placeholder="35"
                    defaultValue="35"
                  />
                </div>
                <div>
                  <Label htmlFor="paint-best" className="text-sm">Best Quality</Label>
                  <Input
                    id="paint-best"
                    type="number"
                    placeholder="50"
                    defaultValue="50"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  )
}
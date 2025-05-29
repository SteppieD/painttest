import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import { formatCurrency, calculateMarkup } from './utils'
import type { BaseCosts, ProjectDetails } from '@/types/database'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    paddingBottom: 30,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyInfo: {
    flex: 1,
  },
  logo: {
    width: 80,
    height: 80,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#D97706',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#92400E',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD34D',
    paddingBottom: 5,
  },
  clientInfo: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 80,
  },
  value: {
    flex: 1,
  },
  scopeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  scopeDescription: {
    flex: 3,
  },
  scopePrice: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  total: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#D97706',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  terms: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FFFBEB',
    borderRadius: 5,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  termItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
})

interface QuotePDFProps {
  clientName: string
  propertyAddress: string
  projectDetails: ProjectDetails
  baseCosts: BaseCosts
  markupPercentage: number
  companyName?: string
  companyPhone?: string
  companyLicense?: string
  companyLogo?: string
  userName?: string
}

const QuotePDF = ({
  clientName,
  propertyAddress,
  projectDetails,
  baseCosts,
  markupPercentage,
  companyName = 'Professional Painting Co.',
  companyPhone = '(555) 123-4567',
  companyLicense = 'License #123456',
  companyLogo,
  userName = 'John Doe',
}: QuotePDFProps) => {
  const { finalPrice } = calculateMarkup(
    baseCosts.labor + baseCosts.paint + baseCosts.supplies,
    markupPercentage
  )

  const today = new Date()
  const validUntil = new Date(today)
  validUntil.setDate(validUntil.getDate() + 30)

  // Calculate room prices (simplified for customer view)
  const roomPrices = projectDetails.rooms?.map(room => {
    const roomPercentage = room.sqft / projectDetails.totalSqft
    const roomPrice = finalPrice * roomPercentage
    return {
      name: room.name,
      description: `${room.sqft} sq ft, ${projectDetails.coats} coats of ${projectDetails.paintQuality} quality paint`,
      price: roomPrice
    }
  }) || []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Company Info */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {companyLogo && <Image style={styles.logo} src={companyLogo} />}
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.contactInfo}>{userName}</Text>
            <Text style={styles.contactInfo}>{companyPhone}</Text>
            <Text style={styles.contactInfo}>{companyLicense}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>PAINTING ESTIMATE</Text>

        {/* Client Information */}
        <View style={styles.clientInfo}>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{propertyAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{today.toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valid Until:</Text>
            <Text style={styles.value}>{validUntil.toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCOPE OF WORK</Text>
          {roomPrices.map((item, index) => (
            <View key={index} style={styles.scopeItem}>
              <View style={styles.scopeDescription}>
                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                  {item.description}
                </Text>
              </View>
              <Text style={styles.scopePrice}>
                {formatCurrency(item.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text>TOTAL ESTIMATE</Text>
            <Text style={{ color: '#D97706' }}>{formatCurrency(finalPrice)}</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.terms}>
          <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
          <Text style={styles.termItem}>• This is an estimate based on the scope of work discussed</Text>
          <Text style={styles.termItem}>• Final price may vary based on actual conditions</Text>
          <Text style={styles.termItem}>• 50% deposit required to begin work</Text>
          <Text style={styles.termItem}>• Balance due upon completion</Text>
          <Text style={styles.termItem}>• Includes all labor, materials, and supplies</Text>
          <Text style={styles.termItem}>• Additional work not included in this estimate</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for considering {companyName} for your painting needs!</Text>
          <Text style={{ marginTop: 5 }}>
            Questions? Contact us at {companyPhone}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateQuotePDF(props: QuotePDFProps): Promise<Blob> {
  const document = <QuotePDF {...props} />
  const blob = await pdf(document).toBlob()
  return blob
}

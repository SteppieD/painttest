# Paint Quote Generator

A professional painting quote generator with PDF export capabilities.

## Features

- Generate professional PDF quotes with company branding
- Customizable company logo and information
- Detailed line item breakdown
- Tax calculation options
- Mobile and desktop-friendly layout
- Automatic calculations and markup
- Save quotes for future reference

## Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.local.example` to `.env.local`
- Fill in the required environment variables:
  - AI API Keys (Gemini or OpenAI)
  - Supabase configuration
  - Google OAuth credentials

3. Set up Supabase storage:
- Create a storage bucket named 'company-logos'
- Configure CORS for the bucket:
```json
{
  "cors": [
    {
      "allowedOrigins": ["*"],
      "allowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "allowedHeaders": ["*"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

4. Run the development server:
```bash
npm run dev
```

## Configuration

### Company Settings

1. Navigate to the Settings page
2. Configure your company information:
   - Company name
   - Phone number
   - Upload company logo (supports JPEG, PNG, WebP)
3. Set up your AI API keys:
   - Google Gemini API key and/or
   - OpenAI API key
4. Configure cost settings:
   - Labor costs
   - Paint costs (economy, standard, premium)
   - Base supplies cost

### Quote Generation

1. Create a new project
2. Enter customer and project details
3. Add line items for the quote
4. Click "Generate Quote PDF" to create a professional PDF
5. Download or share the quote with your customer

## PDF Quote Features

The generated PDF quotes include:

- Company logo and information
- Customer details
- Project scope
- Line item breakdown
- Subtotal, tax (if enabled), and total
- Terms and conditions
- Valid until date
- Professional styling and layout

## Development

### Key Files

- `lib/pdf-generator.tsx`: PDF generation logic
- `lib/logo-manager.ts`: Company logo handling
- `lib/api-validator.ts`: AI API validation
- `components/settings/api-logo-settings.tsx`: Logo and API settings UI

### Adding New Features

1. PDF Customization:
   - Modify `lib/pdf-generator.tsx` to add new sections or styling
   - Update `QuotePDFProps` interface for new data fields

2. Logo Management:
   - Logo validation in `lib/logo-manager.ts`
   - Storage configuration in Supabase
   - UI components in `components/settings/api-logo-settings.tsx`

3. API Integration:
   - API key validation in `lib/api-validator.ts`
   - Environment variable configuration
   - Error handling and fallbacks

## Troubleshooting

### Common Issues

1. PDF Generation:
   - Ensure all required fields are filled
   - Check company logo is properly uploaded
   - Verify PDF styling matches your needs

2. Logo Upload:
   - Maximum file size: 2MB
   - Supported formats: JPEG, PNG, WebP
   - Check Supabase storage permissions

3. API Configuration:
   - Verify API keys are properly set
   - Check API validation results
   - Monitor API usage and limits

## License

MIT License - See LICENSE file for details
